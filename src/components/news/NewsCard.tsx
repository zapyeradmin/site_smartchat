import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar } from "lucide-react";
import type { NewsArticle } from "@/types";

interface NewsCardProps {
  news: NewsArticle;
  showAuthor?: boolean;
  variant?: 'default' | 'compact';
}

export const NewsCard = ({ news, showAuthor = false, variant = 'default' }: NewsCardProps) => {
  return (
    <Link to={`/noticias/${news.slug}`} className="group">
      <article className={`${variant === 'compact' ? 'rounded-md' : 'rounded-lg'} border ${variant === 'compact' ? 'border-primary/10' : 'border-primary/20'} ${variant === 'compact' ? 'bg-card/40' : 'bg-card/50'} overflow-hidden hover:shadow-xl transition-shadow`}>
        {/* Image */}
        <div className={`${variant === 'compact' ? 'aspect-[16/10]' : 'aspect-video'} w-full overflow-hidden`}>
          <img
            src={news.featuredImage}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className={`${variant === 'compact' ? 'p-3' : 'p-4'} flex flex-col gap-2`}>
          <div className={`flex items-center gap-3 ${variant === 'compact' ? 'text-[11px]' : 'text-xs'} text-muted-foreground`}>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
              {news.category}
            </span>
            <Clock className="w-3 h-3" />
            <span>{news.readTime} min de leitura</span>
            <Calendar className="w-3 h-3" />
            <span>{format(news.publishedAt, 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>

          <h3 className={`${variant === 'compact' ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl sm:text-2xl md:text-3xl'} font-semibold tracking-tight text-center group-hover:text-primary transition-colors`}>
            {news.title}
          </h3>

          <p className={`${variant === 'compact' ? 'text-sm' : 'text-sm'} text-muted-foreground line-clamp-3`}>
            {news.excerpt}
          </p>

          {showAuthor && variant === 'default' && (
            <div className="flex items-center gap-3 mt-2 pt-3 border-t border-border">
              <img
                src={news.author.avatar}
                alt={news.author.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src !== window.location.origin + '/placeholder.svg') {
                    img.src = '/placeholder.svg';
                  }
                }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{news.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {format(news.publishedAt, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};