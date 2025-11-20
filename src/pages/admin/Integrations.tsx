import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Settings, 
  Zap, 
  Mail, 
  MessageSquare, 
  Calendar,
  Database,
  Globe,
  Webhook,
  CheckCircle,
  XCircle,
  ExternalLink,
  Slack,
  Chrome,
  Github
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  type: string;
  config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const integrationTypes = [
  {
    id: 'zapier',
    name: 'Zapier',
    icon: Zap,
    description: 'Automatize fluxos de trabalho conectando aplicativos',
    color: 'from-orange-500 to-orange-600',
    fields: [
      { key: 'webhook_url', label: 'URL do Webhook', type: 'url', required: true },
      { key: 'trigger_events', label: 'Eventos que Acionam', type: 'multiselect', options: ['new_client', 'new_deal', 'deal_won', 'task_completed'] }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: Slack,
    description: 'Receba notificações e atualizações no Slack',
    color: 'from-purple-500 to-purple-600',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL do Slack', type: 'url', required: true },
      { key: 'channel', label: 'Canal', type: 'text', required: true },
      { key: 'username', label: 'Nome do Bot', type: 'text', placeholder: 'CRM Bot' }
    ]
  },
  {
    id: 'email',
    name: 'Email Notifications',
    icon: Mail,
    description: 'Configure notificações por email personalizadas',
    color: 'from-blue-500 to-blue-600',
    fields: [
      { key: 'smtp_host', label: 'Servidor SMTP', type: 'text', required: true },
      { key: 'smtp_port', label: 'Porta SMTP', type: 'number', required: true },
      { key: 'smtp_user', label: 'Usuário SMTP', type: 'email', required: true },
      { key: 'smtp_password', label: 'Senha SMTP', type: 'password', required: true }
    ]
  },
  {
    id: 'webhook',
    name: 'Webhook Customizado',
    icon: Webhook,
    description: 'Envie dados para qualquer endpoint HTTP',
    color: 'from-green-500 to-green-600',
    fields: [
      { key: 'url', label: 'URL do Endpoint', type: 'url', required: true },
      { key: 'method', label: 'Método HTTP', type: 'select', options: ['POST', 'PUT', 'PATCH'], required: true },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer token"}' },
      { key: 'auth_token', label: 'Token de Autenticação', type: 'password' }
    ]
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Sincronize tarefas e eventos com Google Calendar',
    color: 'from-red-500 to-red-600',
    fields: [
      { key: 'calendar_id', label: 'ID do Calendário', type: 'text', required: true },
      { key: 'sync_tasks', label: 'Sincronizar Tarefas', type: 'boolean' },
      { key: 'sync_meetings', label: 'Sincronizar Reuniões', type: 'boolean' }
    ]
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    icon: MessageSquare,
    description: 'Integração com Microsoft Teams para colaboração',
    color: 'from-indigo-500 to-indigo-600',
    fields: [
      { key: 'tenant_id', label: 'Tenant ID', type: 'text', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { key: 'team_id', label: 'Team ID', type: 'text', required: true }
    ]
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    description: 'Conecte com repositórios GitHub para tracking de projetos',
    color: 'from-gray-700 to-gray-800',
    fields: [
      { key: 'access_token', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'repository', label: 'Repositório', type: 'text', placeholder: 'usuario/repositorio', required: true },
      { key: 'sync_issues', label: 'Sincronizar Issues', type: 'boolean' }
    ]
  },
  {
    id: 'database',
    name: 'Banco de Dados Externo',
    icon: Database,
    description: 'Conecte com bancos de dados externos',
    color: 'from-teal-500 to-teal-600',
    fields: [
      { key: 'connection_string', label: 'String de Conexão', type: 'password', required: true },
      { key: 'database_type', label: 'Tipo do Banco', type: 'select', options: ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB'], required: true },
      { key: 'sync_frequency', label: 'Frequência de Sync (min)', type: 'number', placeholder: '60' }
    ]
  }
];

const Integrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as integrações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const integrationTypeData = integrationTypes.find(t => t.id === selectedType);
    if (!integrationTypeData) return;

    try {
      const integrationData = {
        name: formData.name || integrationTypeData.name,
        type: selectedType,
        config: formData,
        is_active: true,
      };

      if (editingIntegration) {
        const { error } = await supabase
          .from('integrations')
          .update(integrationData)
          .eq('id', editingIntegration.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Integração atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('integrations')
          .insert([integrationData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Integração criada com sucesso!",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a integração.",
        variant: "destructive",
      });
    }
  };

  const toggleIntegration = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;

      setIntegrations(prev => 
        prev.map(int => 
          int.id === id ? { ...int, is_active } : int
        )
      );

      toast({
        title: "Sucesso",
        description: `Integração ${is_active ? 'ativada' : 'desativada'} com sucesso!`,
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da integração.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta integração?')) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Integração excluída com sucesso!",
      });

      fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a integração.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setSelectedType(integration.type);
    setFormData({ ...integration.config, name: integration.name });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({});
    setSelectedType('');
    setEditingIntegration(null);
  };

  const renderFormField = (field: any) => {
    switch (field.type) {
      case 'text':
      case 'url':
      case 'email':
      case 'number':
      case 'password':
        return (
          <Input
            type={field.type}
            value={formData[field.key] || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            required={field.required}
            className="bg-background/50 border-primary/20"
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={formData[field.key] || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            rows={3}
            className="bg-background/50 border-primary/20"
          />
        );
      case 'select':
        return (
          <Select 
            value={formData[field.key] || ''} 
            onValueChange={(value) => setFormData({ ...formData, [field.key]: value })}
          >
            <SelectTrigger className="bg-background/50 border-primary/20">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData[field.key] || false}
              onCheckedChange={(checked) => setFormData({ ...formData, [field.key]: checked })}
            />
            <Label htmlFor={field.key}>Ativar</Label>
          </div>
        );
      default:
        return null;
    }
  };

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
                Integrações
              </h1>
              <p className="text-muted-foreground text-lg">
                Conecte seu CRM com outras ferramentas e serviços
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Integração
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {editingIntegration ? 'Editar Integração' : 'Nova Integração'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingIntegration ? 'Edite as configurações da integração' : 'Escolha o tipo de integração e configure os parâmetros'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!editingIntegration && (
                    <div className="space-y-2">
                      <Label>Tipo de Integração</Label>
                      <Select value={selectedType} onValueChange={setSelectedType} required>
                        <SelectTrigger className="bg-background/50 border-primary/20">
                          <SelectValue placeholder="Selecione o tipo de integração" />
                        </SelectTrigger>
                        <SelectContent>
                          {integrationTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {type.name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedType && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome da Integração</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={`Integração ${integrationTypes.find(t => t.id === selectedType)?.name}`}
                          className="bg-background/50 border-primary/20"
                        />
                      </div>

                      {integrationTypes
                        .find(t => t.id === selectedType)
                        ?.fields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key}>
                              {field.label}
                              {field.required && <span className="text-red-400 ml-1">*</span>}
                            </Label>
                            {renderFormField(field)}
                          </div>
                        ))}
                    </>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedType}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
                    >
                      {editingIntegration ? 'Atualizar' : 'Criar'} Integração
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Available Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrationTypes.map((type) => {
          const Icon = type.icon;
          const existingIntegration = integrations.find(i => i.type === type.id);
          
          return (
            <Card key={type.id} className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${type.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.name}</span>
                      {existingIntegration && (
                        <Badge className={existingIntegration.is_active 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }>
                          {existingIntegration.is_active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativa
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativa
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardTitle>
                <CardDescription>
                  {type.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {existingIntegration ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Switch
                        checked={existingIntegration.is_active}
                        onCheckedChange={(checked) => toggleIntegration(existingIntegration.id, checked)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(existingIntegration)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(existingIntegration.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setSelectedType(type.id);
                      setIsDialogOpen(true);
                    }}
                    className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 text-white`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Conectar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Integrations */}
      {integrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Integrações Configuradas
          </h2>
          
          <div className="grid gap-4">
            {integrations.map((integration) => {
              const typeData = integrationTypes.find(t => t.id === integration.type);
              const Icon = typeData?.icon || Globe;
              
              return (
                <Card key={integration.id} className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${typeData?.color || 'from-gray-500 to-gray-600'} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{integration.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            {typeData?.description || integration.type}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Criado em: {new Date(integration.created_at).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>Atualizado em: {new Date(integration.updated_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={integration.is_active 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }>
                          {integration.is_active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativa
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativa
                            </>
                          )}
                        </Badge>
                        
                        <Switch
                          checked={integration.is_active}
                          onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                        />
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(integration)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;