import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Trash2, Calendar, User, FileText, SendHorizonal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: string;
  category: string;
  featured_image: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: string | null;
  tags?: string[] | null;
}

interface NewsFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  featured_image: string;
  tagsRaw: string;
}

const News = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'geral',
    status: 'published',
    featured_image: '',
    tagsRaw: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news_admin')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notícias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tagsParsed = formData.tagsRaw
        .split('#')
        .map((t) => t.trim())
        .filter(Boolean);

      const newsData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        featured_image: formData.featured_image,
        tags: tagsParsed,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (editingNews) {
        const { error } = await supabase
          .from('news_admin')
          .update(newsData)
          .eq('id', editingNews.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Notícia atualizada com sucesso!",
        });
        if (newsData.status === 'published') {
          try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || ''
            await fetch(`${apiBase}/api/newsletter/news-created`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug: newsData.slug })
            })
          } catch {}
        }
      } else {
        const { error } = await supabase
          .from('news_admin')
          .insert([newsData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Notícia criada com sucesso!",
        });
        if (newsData.status === 'published') {
          try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || ''
            await fetch(`${apiBase}/api/newsletter/news-created`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug: newsData.slug })
            })
          } catch {}
        }
      }

      fetchNews();
      resetForm();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a notícia.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingNews(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content,
      category: article.category,
      status: article.status as 'draft' | 'published',
      featured_image: article.featured_image || '',
      tagsRaw: Array.isArray(article.tags) && article.tags.length
        ? article.tags.join(' #')
        : ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;

    try {
      const { error } = await supabase
        .from('news_admin')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Notícia excluída com sucesso!",
      });

      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notícia.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'geral',
      status: 'published',
      featured_image: '',
      tagsRaw: ''
    });
    setEditingNews(null);
    setIsCreateDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tutorial':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'analise':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'mercado':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'educacao':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const resendNewsletter = async (slug: string) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      await fetch(`${apiBase}/api/newsletter/news-created`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })
      toast({ title: 'Reenvio iniciado', description: 'Email de nova notícia está sendo reenviado.' })
    } catch (e) {
      toast({ title: 'Erro ao reenviar', description: 'Não foi possível reenviar o email.', variant: 'destructive' })
    }
  }

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
                Gerenciar Notícias
              </h1>
              <p className="text-muted-foreground text-lg">
                Crie, edite e publique artigos e notícias com editor avançado
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Notícia
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {news.length}
            </div>
            <p className="text-xs text-muted-foreground">artigos no total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10">
                <Eye className="h-4 w-4 text-green-400" />
              </div>
              Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {news.filter(a => a.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">artigos publicados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-500/10">
                <Edit className="h-4 w-4 text-yellow-400" />
              </div>
              Rascunhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {news.filter(a => a.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">em rascunho</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                <Calendar className="h-4 w-4 text-blue-400" />
              </div>
              Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {news.filter(a => {
                const articleDate = new Date(a.created_at);
                const now = new Date();
                return articleDate.getMonth() === now.getMonth() && 
                       articleDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">neste mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-card/50 rounded-lg border border-primary/20">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar notícias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-background/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] bg-background/50">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="geral">Geral</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
            <SelectItem value="analise">Análise</SelectItem>
            <SelectItem value="educacao">Educação</SelectItem>
            <SelectItem value="mercado">Mercado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {news.length === 0 ? 'Nenhuma notícia encontrada' : 'Nenhum resultado'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {news.length === 0 
                  ? 'Comece criando sua primeira notícia.'
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
              {news.length === 0 && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Notícia
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredNews.map((article) => (
            <Card key={article.id} className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      {article.featured_image && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={article.featured_image} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.created_at).toLocaleDateString('pt-BR')}
                          <User className="h-3 w-3 ml-2" />
                          Admin
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <Badge className={getStatusColor(article.status)}>
                        {article.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50"
                        onClick={() => window.open(`/noticias/${article.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-green-50"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      {article.status === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-indigo-50 text-indigo-600"
                          onClick={() => resendNewsletter(article.slug)}
                        >
                          <SendHorizonal className="h-4 w-4 mr-1" />
                          Reenviar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 text-red-600"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? 'Editar Notícia' : 'Nova Notícia'}
            </DialogTitle>
            <DialogDescription>
              {editingNews ? 'Edite os dados da notícia' : 'Crie uma nova notícia para o site'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title,
                      slug: generateSlug(title)
                    }));
                  }}
                  placeholder="Digite o título da notícia"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-da-noticia"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <Input
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Breve descrição da notícia"
                required
              />
            </div>

            <ImageUpload
              value={formData.featured_image}
              onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="analise">Análise</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="mercado">Mercado</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'published') => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tagsRaw}
                onChange={(e) => setFormData(prev => ({ ...prev, tagsRaw: e.target.value }))}
                placeholder="Ex.: #bitcoin #mercado #tecnologia"
              />
              <p className="text-xs text-muted-foreground">Separe por #. Ex: #bitcoin #mercado</p>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Escreva o conteúdo da notícia..."
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingNews ? 'Atualizar' : 'Criar'} Notícia
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default News;