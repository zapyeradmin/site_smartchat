import { useState } from "react";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { NewsCard } from "@/components/news/NewsCard";
import { useNews } from "@/hooks/useNews";

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: newsData, isLoading, error, refetch } = useNews({ excerptLength: 200 });

  // Get unique categories
  const categories = Array.from(new Set(newsData?.map(news => news.category) || []));

  // Filter news based on search term and category
  const filteredNews = (newsData || []).filter((news) => {
    const matchesSearch = searchTerm === "" || 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || news.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 sm:pt-20">
          <div className="bg-background py-16">
            <div className="container mx-auto px-4">
              <div className="mb-6">
                <Link to="/">
                  <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Início
                  </Button>
                </Link>
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl mb-4">
                  Fique atualizado com <span className="font-bold text-primary">Zapyer Notícias</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Carregando notícias...
                </p>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-md aspect-video mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="bg-background py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl mb-4">Erro ao carregar notícias</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ocorreu um erro ao carregar as notícias. Tente novamente mais tarde.
              </p>
              <div className="mt-6">
                <Button variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Header */}
        <div className="bg-background py-10 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Link to="/">
                <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-normal mb-6">
                Fique sempre Atualizado com <span className="text-gradient font-bold block">o Zapyer Notícias</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Tudo Sobre Tecnologia, Automações, Mercados e as Últimas Tendências do Mundo das Inteligências Artificias.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
              <Input
                placeholder="Buscar notícias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-11"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-10 sm:h-11">
                  <Filter className="w-4 h-4 text-primary" />
                  {selectedCategory ? selectedCategory : "Categoria"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  Todas as categorias
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category} 
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-5 sm:mb-6">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Busca: {searchTerm}
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1 capitalize">
                  Categoria: {selectedCategory}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs"
              >
                Limpar filtros
              </Button>
            </div>
          )}

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">
            {filteredNews.length} {filteredNews.length === 1 ? 'notícia encontrada' : 'notícias encontradas'}
          </p>

          {/* News Grid */}
          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredNews.map((news) => (
                <NewsCard key={news.id} news={news} showAuthor variant="default" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhuma notícia encontrada com os filtros aplicados.
              </p>
              <Button onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsPage;