import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NewsCard } from "./NewsCard";
import { useNews } from "@/hooks/useNews";

const NewsSection = () => {
  const { data: newsData, isLoading, error, refetch } = useNews({ excerptLength: 160 });
  
  // Show only the first 4 news articles
  const featuredNews = newsData?.slice(0, 4) || [];
  
  if (isLoading) {
    return (
      <div className="w-full py-12 lg:py-12">
        <div className="container mx-auto flex flex-col gap-14">
          <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
            <h4 className="text-5xl md:text-6xl font-normal max-w-xl">
              Fique de Olho nas <span className="text-gradient font-bold block">Últimas Notícias</span>
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-md aspect-video mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 lg:py-12">
        <div className="container mx-auto flex flex-col gap-14">
          <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
            <h4 className="text-5xl md:text-6xl font-normal max-w-xl">
              Fique de Olho nas <span className="text-gradient font-bold block">Últimas Notícias</span>
            </h4>
            <Link to="/noticias">
              <Button className="gap-4">
                Ver todas as notícias <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="py-4 rounded-md border border-red-500/30 bg-red-500/10 text-red-200 flex items-center justify-between px-4">
            <p className="text-sm">Erro ao carregar últimas notícias. Tente novamente.</p>
            <Button variant="outline" onClick={() => refetch()} className="border-red-500/30 text-red-200 hover:bg-red-500/20">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!newsData?.length) {
    return (
      <div className="w-full py-12 lg:py-12">
        <div className="container mx-auto flex flex-col gap-14">
          <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
            <h4 className="text-5xl md:text-6xl font-normal max-w-xl">
              Fique de Olho nas <span className="text-gradient font-bold block">Últimas Notícias</span>
            </h4>
            <Link to="/noticias">
              <Button className="gap-4">
                Ver todas as notícias <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma notícia disponível no momento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 lg:py-12">
      <div className="container mx-auto flex flex-col gap-14">
        <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
          <h4 className="text-5xl md:text-6xl font-normal max-w-xl">
            Fique de Olho nas <span className="text-gradient font-bold block">Últimas Notícias</span>
          </h4>
          <Link to="/noticias">
            <Button className="gap-4">
              Ver todas as notícias <MoveRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredNews.map((news) => (
            <NewsCard key={news.id} news={news} variant="compact" />
          ))}
        </div>
      </div>
    </div>
  );
};

export { NewsSection };