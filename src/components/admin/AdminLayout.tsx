import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar 
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Newspaper, 
  Settings, 
  Plug, 
  LogOut,
  Menu
} from 'lucide-react';
import zapyerLogo from '@/assets/zapyer-hub-logo.png';
import { NavLink } from 'react-router-dom';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/admin/clients', icon: Users },
  { name: 'Negócios', href: '/admin/deals', icon: Briefcase },
  { name: 'Tarefas', href: '/admin/tasks', icon: CheckSquare },
  { name: 'Notícias', href: '/admin/news', icon: Newspaper },
  { name: 'Integrações', href: '/admin/integrations', icon: Plug },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

const AdminSidebar = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthState();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar className={`transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen shadow-xl`}>
      <SidebarContent className="flex flex-col h-full bg-gradient-to-b from-card via-card/95 to-card/90 border-r border-primary/20 backdrop-blur-xl">
        {/* Logo */}
        <div className="p-4 border-b bg-card border-primary/20">
          <div className="flex items-center justify-center">
            <img 
              src={zapyerLogo} 
              alt="Zapyer Hub" 
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 p-2">
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:scale-105'
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted ${
              collapsed ? 'px-2' : 'px-3'
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const AdminLayout = () => {
  const { user, loading } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <div className="fixed inset-y-0 left-0 z-50">
          <AdminSidebar />
        </div>
        
        <main className="flex-1 flex flex-col overflow-hidden ml-64">
          {/* Header */}
          <header className="h-16 bg-gradient-to-r from-card/95 via-card to-card/95 border-b border-primary/20 flex items-center px-6 gap-4 backdrop-blur-xl shadow-sm sticky top-0 z-40">
            <SidebarTrigger className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Painel Administrativo
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background/98 to-background/95">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;