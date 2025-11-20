import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  Mail,
  RefreshCw,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>) || {};

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any, description?: string) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('site_settings')
        .upsert([{
          key,
          value,
          description: description || null,
        }]);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));

      toast({
        title: "Sucesso",
        description: "Configuração salva com sucesso!",
      });
    } catch (error) {
      console.error('Error saving setting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const SettingCard = ({ title, description, children, icon: Icon }: any) => (
    <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const SwitchSetting = ({ 
    settingKey, 
    label, 
    description, 
    defaultValue = false 
  }: { 
    settingKey: string; 
    label: string; 
    description?: string; 
    defaultValue?: boolean;
  }) => (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={settings[settingKey] ?? defaultValue}
        onCheckedChange={(checked) => saveSetting(settingKey, checked, description)}
        disabled={saving}
      />
    </div>
  );

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
                Configurações
              </h1>
              <p className="text-muted-foreground text-lg">
                Configure o sistema e integrações Google
              </p>
            </div>
            
            <Button 
              onClick={fetchSettings}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="google">Google Services</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <SettingCard
            title="Configurações da Empresa"
            description="Configure informações básicas do sistema"
            icon={User}
          >
            <SwitchSetting
              settingKey="maintenance_mode"
              label="Modo de Manutenção"
              description="Ativa o modo de manutenção do sistema"
            />
            <SwitchSetting
              settingKey="allow_registrations"
              label="Permitir Novos Registros"
              description="Permite que novos usuários se registrem"
              defaultValue={true}
            />
          </SettingCard>
        </TabsContent>

        <TabsContent value="google" className="space-y-6">
          <SettingCard
            title="Integração Google"
            description="Configure todos os recursos do Google Workspace"
            icon={Globe}
          >
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Google Calendar</h4>
                    <p className="text-sm text-muted-foreground">Sincronize tarefas e eventos</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Configurar
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Gmail</h4>
                    <p className="text-sm text-muted-foreground">Integração com email</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Configurar
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Google Drive</h4>
                    <p className="text-sm text-muted-foreground">Armazenamento de arquivos</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Configurar
                  </Badge>
                </div>
              </div>
            </div>
          </SettingCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <SettingCard
            title="Notificações"
            description="Configure alertas e notificações do sistema"
            icon={Bell}
          >
            <SwitchSetting
              settingKey="email_notifications"
              label="Notificações por Email"
              description="Receber alertas importantes por email"
              defaultValue={true}
            />
            <SwitchSetting
              settingKey="push_notifications"
              label="Notificações Push"
              description="Notificações em tempo real no navegador"
              defaultValue={true}
            />
          </SettingCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;