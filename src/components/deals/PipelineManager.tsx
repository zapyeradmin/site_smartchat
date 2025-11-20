import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface PipelineManagerProps {
  stages: PipelineStage[];
  onStagesUpdate: (stages: PipelineStage[]) => void;
}

export const PipelineManager = ({ stages, onStagesUpdate }: PipelineManagerProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
  });

  const colorOptions = [
    { value: '#3b82f6', label: 'Azul', class: 'bg-blue-500' },
    { value: '#22c55e', label: 'Verde', class: 'bg-green-500' },
    { value: '#eab308', label: 'Amarelo', class: 'bg-yellow-500' },
    { value: '#f97316', label: 'Laranja', class: 'bg-orange-500' },
    { value: '#ef4444', label: 'Vermelho', class: 'bg-red-500' },
    { value: '#8b5cf6', label: 'Roxo', class: 'bg-purple-500' },
    { value: '#06b6d4', label: 'Ciano', class: 'bg-cyan-500' },
    { value: '#f59e0b', label: 'Âmbar', class: 'bg-amber-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStage) {
      // Update existing stage
      const updatedStages = stages.map(stage => 
        stage.id === editingStage.id 
          ? { ...stage, name: formData.name, color: formData.color }
          : stage
      );
      onStagesUpdate(updatedStages);
      toast({
        title: "Sucesso",
        description: "Estágio atualizado com sucesso!",
      });
    } else {
      // Create new stage
      const newStage: PipelineStage = {
        id: `stage_${Date.now()}`,
        name: formData.name,
        color: formData.color,
        order: stages.length,
      };
      onStagesUpdate([...stages, newStage]);
      toast({
        title: "Sucesso",
        description: "Novo estágio criado com sucesso!",
      });
    }

    setFormData({ name: '', color: '#3b82f6' });
    setEditingStage(null);
  };

  const handleEdit = (stage: PipelineStage) => {
    setEditingStage(stage);
    setFormData({ name: stage.name, color: stage.color });
  };

  const handleDelete = (stageId: string) => {
    const updatedStages = stages.filter(stage => stage.id !== stageId);
    onStagesUpdate(updatedStages);
    toast({
      title: "Sucesso",
      description: "Estágio removido com sucesso!",
    });
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#3b82f6' });
    setEditingStage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
        >
          <Settings className="mr-2 h-4 w-4" />
          Gerenciar Pipeline
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Gerenciar Pipeline de Negócios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Stages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Estágios Atuais</h3>
            <div className="space-y-3">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-primary/10 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    ></div>
                    <span className="font-medium">{stage.name}</span>
                    <Badge variant="outline" className="text-xs">
                      #{stage.order + 1}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(stage)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {stages.length > 2 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(stage.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingStage ? 'Editar Estágio' : 'Novo Estágio'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stageName">Nome do Estágio</Label>
                  <Input
                    id="stageName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Qualificação"
                    required
                    className="bg-background/50 border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cor do Estágio</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`h-10 rounded-lg border-2 transition-all ${
                          formData.color === color.value 
                            ? 'border-primary scale-110 shadow-lg' 
                            : 'border-muted hover:scale-105'
                        } ${color.class}`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {editingStage && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {editingStage ? 'Atualizar Estágio' : 'Adicionar Estágio'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};