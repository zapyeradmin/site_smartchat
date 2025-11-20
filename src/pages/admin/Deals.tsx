import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Calendar, User, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NewDealDialog } from '@/components/deals/NewDealDialog';
import { PipelineManager } from '@/components/deals/PipelineManager';

interface Deal {
  id: string;
  title: string;
  description: string | null;
  value: number | null;
  stage: string;
  client_id: string | null;
  expected_close_date: string | null;
  probability: number;
  created_at: string;
}

const stageLabels = {
  lead: 'Leads',
  proposal: 'Propostas',
  negotiation: 'Negociação',
  closed_won: 'Fechados',
};

const stageColors = {
  lead: 'bg-blue-500/10 border-blue-500/20',
  proposal: 'bg-yellow-500/10 border-yellow-500/20',
  negotiation: 'bg-orange-500/10 border-orange-500/20',
  closed_won: 'bg-green-500/10 border-green-500/20',
};

const SortableItem = ({ deal }: { deal: Deal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <Card className="cursor-grab hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-sm">{deal.title}</h4>
            <Badge variant="outline" className="text-xs">
              {deal.probability}%
            </Badge>
          </div>
          
          {deal.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {deal.description}
            </p>
          )}
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {deal.value ? `R$ ${deal.value.toLocaleString('pt-BR')}` : 'Não informado'}
            </div>
            
            {deal.expected_close_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const KanbanColumn = ({ stage, deals, title }: { stage: string; deals: Deal[]; title: string }) => {
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-0 p-4 rounded-lg border-2 border-dashed ${stageColors[stage as keyof typeof stageColors]} min-h-[400px]`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {deals.length}
        </Badge>
      </div>
      
      <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {deals.map((deal) => (
            <SortableItem key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>
      
      {deals.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Nenhum negócio neste estágio
        </div>
      )}
    </div>
  );
};

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [pipelineStages, setPipelineStages] = useState([
    { id: 'lead', name: 'Leads', color: 'bg-blue-500/10 border-blue-500/20', order: 0 },
    { id: 'proposal', name: 'Propostas', color: 'bg-yellow-500/10 border-yellow-500/20', order: 1 },
    { id: 'negotiation', name: 'Negociação', color: 'bg-orange-500/10 border-orange-500/20', order: 2 },
    { id: 'closed_won', name: 'Fechados', color: 'bg-green-500/10 border-green-500/20', order: 3 },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .neq('stage', 'closed_lost')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os negócios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const dealId = active.id as string;
    const newStage = over.id as string;
    
    // Find the deal being moved
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === newStage) return;
    
    try {
      // Update in database
      const { error } = await supabase
        .from('deals')
        .update({ stage: newStage })
        .eq('id', dealId);

      if (error) throw error;

      // Update local state
      setDeals(prevDeals => 
        prevDeals.map(d => 
          d.id === dealId ? { ...d, stage: newStage as any } : d
        )
      );

      toast({
        title: "Sucesso",
        description: `Negócio movido para ${stageLabels[newStage as keyof typeof stageLabels]}.`,
      });
    } catch (error) {
      console.error('Error updating deal stage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o negócio.",
        variant: "destructive",
      });
    }
    
    setActiveId(null);
  };

  const getDealsForStage = (stage: string) => 
    deals.filter(deal => deal.stage === stage);

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl -z-10"></div>
        <div className="p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                Pipeline de Negócios
              </h1>
              <p className="text-muted-foreground text-lg">
                Gerencie seu funil de vendas com drag & drop
              </p>
            </div>
            
            <div className="flex gap-3">
              <PipelineManager 
                stages={pipelineStages} 
                onStagesUpdate={setPipelineStages} 
              />
              <Button 
                onClick={() => setNewDealOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Negócio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pipelineStages.map((stage) => {
          const stageDeals = getDealsForStage(stage.id);
          const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
          
          return (
            <Card key={stage.id} className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: stage.color.includes('blue') ? '#3b82f6' : 
                             stage.color.includes('yellow') ? '#eab308' :
                             stage.color.includes('orange') ? '#f97316' : '#22c55e' }}
                  ></div>
                  {stage.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {stageDeals.length}
                </div>
                <p className="text-sm text-primary font-medium">
                  R$ {totalValue.toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <KanbanColumn
                stage={stage.id}
                deals={getDealsForStage(stage.id)}
                title={stage.name}
              />
            </div>
          ))}
        </div>
        
        <DragOverlay>
          {activeDeal ? (
            <Card className="opacity-90 rotate-3">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm">{activeDeal.title}</h4>
                {activeDeal.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeDeal.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <NewDealDialog 
        open={newDealOpen}
        onOpenChange={setNewDealOpen}
        onSuccess={fetchDeals}
      />
    </div>
  );
};

export default Deals;