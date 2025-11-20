import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoogleCalendarIntegrationProps {
  onSync?: () => void;
}

export const GoogleCalendarIntegration = ({ onSync }: GoogleCalendarIntegrationProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [calendarId, setCalendarId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const savedCalendarId = localStorage.getItem('google_calendar_id') || '';
    const savedAccessToken = localStorage.getItem('google_access_token') || '';
    setCalendarId(savedCalendarId);
    setAccessToken(savedAccessToken);
    setIsConnected(!!savedCalendarId && !!savedAccessToken);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      if (!calendarId || !accessToken) {
        throw new Error('Informe o Calendar ID e o Access Token');
      }
      localStorage.setItem('google_calendar_id', calendarId);
      localStorage.setItem('google_access_token', accessToken);
      setIsConnected(true);
      toast({
        title: "Sucesso",
        description: "Google Calendar conectado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao conectar com Google Calendar.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    localStorage.removeItem('google_calendar_id');
    localStorage.removeItem('google_access_token');
    toast({
      title: "Desconectado",
      description: "Google Calendar desconectado.",
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      // Simulação da sincronização
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Sincronizado",
        description: "Tarefas sincronizadas com Google Calendar!",
      });
      
      onSync?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha na sincronização.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          Integração Google Calendar
          {isConnected ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
              <XCircle className="h-3 w-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {isConnected 
            ? 'Suas tarefas estão sincronizadas com o Google Calendar. As alterações serão refletidas automaticamente.'
            : 'Conecte sua conta do Google para sincronizar tarefas com o Google Calendar.'
          }
        </p>
        
        {!isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calendar_id">ID do Calendário</Label>
              <Input id="calendar_id" value={calendarId} onChange={(e) => setCalendarId(e.target.value)} placeholder="primary ou seu_calendar_id@group.calendar.google.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access_token">Access Token (OAuth)</Label>
              <Input id="access_token" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="ya29.a0..." />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Conectar Google Calendar
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDisconnect} 
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Desconectar
              </Button>
            </>
          )}
        </div>
        
        {isConnected && (
          <div className="p-3 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
            <p className="text-sm text-green-400 font-medium">
              ✓ Última sincronização: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};