import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Clock, Calendar, MessageCircle, Instagram, Facebook, Twitter, Mail, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { NewsCard } from "@/components/news/NewsCard";
import { useNewsBySlug, useRelatedNews } from "@/hooks/useNews";
import { useState, useEffect } from "react";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copyPreviewSuccess, setCopyPreviewSuccess] = useState(false);
  const [copyDirectSuccess, setCopyDirectSuccess] = useState(false);
  
  const { data: news, isLoading: newsLoading, error: newsError } = useNewsBySlug(slug || "");
  const { data: relatedNews = [], isLoading: relatedLoading } = useRelatedNews(
    slug || "", 
    news?.category || "", 
    3
  );

  // Redirect if no slug
  useEffect(() => {
    if (!slug) {
      window.location.href = "/noticias";
    }
  }, [slug]);

  // Redirect if news not found after loading
  useEffect(() => {
    if (!newsLoading && newsError) {
      window.location.href = "/noticias";
    }
  }, [newsLoading, newsError]);

  if (!slug) {
    return null;
  }

  if (newsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!news) {
    return null;
  }

  const currentUrl = window.location.href;
  const shareUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://apismartchat.zapyer.com.br'}/share/noticias/${slug}`;
  const shareText = `${news.title} - ${news.excerpt}`;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(news.title);
    const body = encodeURIComponent(`${shareText}\n\nLeia mais em: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleCopyPreviewLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyPreviewSuccess(true);
      toast.success("Link com preview copiado!");
      setTimeout(() => setCopyPreviewSuccess(false), 2000);
    } catch {
      toast.error("Erro ao copiar o link com preview");
    }
  };

  const handleCopyDirectLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopyDirectSuccess(true);
      toast.success("Link direto copiado!");
      setTimeout(() => setCopyDirectSuccess(false), 2000);
    } catch {
      toast.error("Erro ao copiar o link direto");
    }
  };

  const handleShareInstagram = () => {
    handleCopyPreviewLink();
    toast.info("Link com preview copiado! Cole nos seus stories do Instagram");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16 sm:pt-20">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6 gap-2 hover:bg-primary/10 transition-colors"
            onClick={() => navigate('/noticias')}
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            Voltar para notícias
          </Button>
        </div>

        {/* Article */}
        <article className="container mx-auto px-4 max-w-4xl">
          {/* Article Header */}
          <header className="mb-8">
            {/* Title and Subtitle */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-center">
              {news.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-6">
              {news.excerpt}
            </p>

            {/* Category, Date and Reading Time */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6 flex-wrap">
              <Badge className="capitalize bg-primary text-white hover:bg-primary/90">
                {news.category}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>{news.readTime} min de leitura</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{format(news.publishedAt, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
              </div>
            </div>

            {/* Author and Share */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/1m3a91dc-013b-1991-a1md-19915d771a13.png" 
                  alt="Marcílio Barros | CEO Zapyer HUB"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h3 className="font-medium text-sm sm:text-base">{news.author.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{news.author.bio}</p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Compartilhar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleShareWhatsApp} className="gap-2 cursor-pointer">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareInstagram} className="gap-2 cursor-pointer">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    Instagram
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareFacebook} className="gap-2 cursor-pointer">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareTwitter} className="gap-2 cursor-pointer">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    X (Twitter)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareEmail} className="gap-2 cursor-pointer">
                    <Mail className="w-4 h-4 text-gray-500" />
                    E-mail
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyPreviewLink} className="gap-2 cursor-pointer">
                    {copyPreviewSuccess ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-primary" />
                    )}
                    {copyPreviewSuccess ? "Preview copiado!" : "Copiar link com preview"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyDirectLink} className="gap-2 cursor-pointer">
                    {copyDirectSuccess ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-primary" />
                    )}
                    {copyDirectSuccess ? "Direto copiado!" : "Copiar link da notícia"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Featured Image */}
          <div className="aspect-video rounded-md sm:rounded-lg overflow-hidden mb-6 sm:mb-8 shadow-sm">
            <img 
              src={news.featuredImage} 
              alt={news.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div 
            className="article-content prose prose-base sm:prose-lg max-w-none prose-headings:text-white prose-headings:text-center prose-h1:text-3xl sm:prose-h1:text-4xl md:prose-h1:text-5xl prose-h2:text-2xl sm:prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-xl sm:prose-h3:text-2xl md:prose-h3:text-3xl prose-p:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-primary/20">
            <h3 className="text-sm font-medium mb-3 text-primary">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag) => (
                <Badge key={tag} className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <section className="container mx-auto px-4 py-10 sm:py-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Notícias relacionadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedNews.map((relatedArticle) => (
                <NewsCard key={relatedArticle.id} news={relatedArticle} showAuthor />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;