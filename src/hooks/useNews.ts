import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NewsArticle, Author } from '@/types';

interface NewsFromDB {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  status: string | null;
  featured_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  tags: string[] | null;
}

// Default author when no specific author is set
const defaultAuthor: Author = {
  id: "default",
  name: "Marcílio Barros | CEO Zapyer HUB",
  avatar: "/lovable-uploads/1m3a91dc-013b-1991-a1md-19915d771a13.png",
  bio: "Sempre a frente no mundo da Tecnologia e do Marketing."
};

function transformDbNewsToNewsArticle(dbNews: NewsFromDB, maxExcerptChars: number = 200): NewsArticle {
  const buildExcerpt = (maxChars: number = maxExcerptChars) => {
    const source = (dbNews.excerpt && dbNews.excerpt.trim().length > 0)
      ? dbNews.excerpt
      : dbNews.content;
    const text = source
      // remove HTML tags
      .replace(/<[^>]+>/g, '')
      // normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length <= maxChars) return text;
    const sliced = text.slice(0, maxChars);
    // avoid cutting mid-word and trim trailing punctuation
    const trimmed = sliced.replace(/[^\w)]*$/, '').trim();
    return trimmed + '…';
  };
  return {
    id: dbNews.id, // Keep as string UUID
    title: dbNews.title,
    slug: dbNews.slug,
    excerpt: buildExcerpt(maxExcerptChars),
    content: dbNews.content,
    featuredImage: dbNews.featured_image || "/placeholder.svg",
    category: dbNews.category || "geral",
    author: defaultAuthor, // Using default author for now
    publishedAt: new Date(dbNews.published_at || dbNews.created_at),
    readTime: Math.max(1, Math.ceil(dbNews.content.length / 1000)), // Estimate reading time
    tags: Array.isArray(dbNews.tags) ? dbNews.tags : []
  };
}

export function useNews(options?: { excerptLength?: number }) {
  return useQuery({
    queryKey: ['news', 'published_or_publicado', options?.excerptLength ?? 200],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_admin')
        .select('*')
        .in('status', ['published', 'Publicado', 'publicado'])
        .order('published_at', { ascending: false, nullsFirst: false });

      if (error) {
        // Log detalhado para diagnóstico de RLS/chave/URL
        console.error('[useNews] Falha ao carregar notícias publicadas:', {
          message: error.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
        });
        throw error;
      }

      const maxChars = options?.excerptLength ?? 200;
      return (data as NewsFromDB[]).map((n) => transformDbNewsToNewsArticle(n, maxChars));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useNewsBySlug(slug: string) {
  return useQuery({
    queryKey: ['news', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_admin')
        .select('*')
        .eq('slug', slug)
        .in('status', ['published', 'Publicado', 'publicado'])
        .single();

      if (error) {
        console.error('[useNewsBySlug] Falha ao carregar notícia por slug:', {
          slug,
          message: error.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
        });
        throw error;
      }

      return transformDbNewsToNewsArticle(data as NewsFromDB, 200);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useRelatedNews(currentSlug: string, category: string, limit: number = 3) {
  return useQuery({
    queryKey: ['news', 'related', currentSlug, category, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_admin')
        .select('*')
        .in('status', ['published', 'Publicado', 'publicado'])
        .eq('category', category)
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) {
        console.error('[useRelatedNews] Falha ao carregar notícias relacionadas:', {
          currentSlug,
          category,
          limit,
          message: error.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
        });
        throw error;
      }

      return (data as NewsFromDB[]).map((n) => transformDbNewsToNewsArticle(n, 200));
    },
    enabled: !!currentSlug && !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}