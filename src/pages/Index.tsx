/**
 * ============================================================================
 * CRYPTO TRADING PLATFORM - MAIN INDEX PAGE
 * ============================================================================
 * 
 * This is the main landing page component that orchestrates all sections
 * of the crypto trading platform including hero, features, pricing, 
 * testimonials, and more.
 * 
 * @author CryptoTrade Development Team
 * @version 1.0.0
 * @created 2024
 * 
 * Security Features:
 * - Input sanitization for form data
 * - XSS protection via proper component structure
 * - Secure external link handling
 * - Rate limiting on form submissions
 * ============================================================================
 */

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { CryptoTradingChat } from "@/components/CryptoTradingChat";
import { VideoPlayer } from "@/components/ui/video-thumbnail-player";
import FAQSection from "@/components/FAQSection";
import { NewsSection } from "@/components/news/NewsSection";
import { Timeline } from "@/components/ui/timeline";
import { BackgroundBeams } from "@/components/ui/background-beams";
import type { TimelineItem } from "@/types";
import MultiStepCTA from "@/components/cta/MultiStepCTA";
import flowbuilderImage from "@/assets/smart-chat-flowbuilder.jpg";
import databaseImage from "@/assets/smart-chat-data-base.jpg";
import tecnologiaImage from "@/assets/smart-chat-tecnologia.jpg";

/**
 * ============================================================================
 * TIMELINE DATA CONFIGURATION
 * ============================================================================
 * 
 * Company history and milestones data for the timeline component.
 * Contains information about platform development, feature releases,
 * and company growth over the years.
 */
const timelineData: TimelineItem[] = [
  {
    title: "2023",
    content: (
      <div className="p-4 rounded-xl bg-card/40 border border-border/40">
        <div className="mb-4">
          <img
            src={flowbuilderImage}
            alt="Smart Chat Flowbuilder"
            className="rounded-lg object-cover w-full h-32 md:h-44 shadow-md ring-1 ring-border"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        </div>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed text-justify">
          Com o propósito fixado em diferenciais no mercado, o Smart Chat teve sua origem para melhorar a cada passo. Nosso foco foi construir uma base sólida de integrações e automações atualizadas que escalam com as necessidades dos clientes.
        </p>
      </div>
    ),
  },
  {
    title: "2024",
    content: (
      <div className="p-4 rounded-xl bg-card/40 border border-border/40">
        <div className="mb-4">
          <img
            src={databaseImage}
            alt="Smart Chat Data Base"
            className="rounded-lg object-cover w-full h-32 md:h-44 shadow-md ring-1 ring-border"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        </div>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed text-justify">
          Sempre buscamos melhorar, evoluir e oferecer as melhores soluções para nossos usuários. Ampliamos integrações, otimizamos performance e refinamos a experiência, mantendo simplicidade no uso e robustez nos nossos servidores.
        </p>
      </div>
    ),
  },
  {
    title: "2025",
    content: (
      <div className="p-4 rounded-xl bg-card/40 border border-border/40">
        <div className="mb-4">
          <img
            src={tecnologiaImage}
            alt="Smart Chat Tecnologia"
            className="rounded-lg object-cover w-full h-32 md:h-44 shadow-md ring-1 ring-border"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
        </div>
        <p id="timeline-end" className="text-muted-foreground text-sm md:text-base leading-relaxed text-justify">
          Deixamos de ser apenas um sistema: nos tornamos um ecossistema inteligente. Orquestramos dados, automações e comunicação para entregar resultados consistentes com arquitetura modular e escalável.
        </p>
      </div>
    ),
  },
];

/**
 * ============================================================================
 * MAIN INDEX COMPONENT
 * ============================================================================
 * 
 * The main landing page component that renders all sections in order:
 * 1. Navigation - Fixed header with smooth scrolling
 * 2. Hero Section - Main value proposition and CTA
 * 3. Features Section - Core platform features
 * 4. Video Demos - Interactive product demonstrations
 * 5. Blog Section - Latest articles and insights
 * 6. Timeline - Company history and milestones
 * 7. Pricing Section - Subscription plans and pricing
 * 8. Testimonials - Customer feedback and reviews
 * 9. CTA Section - Newsletter signup with background effects
 * 10. FAQ Section - Frequently asked questions
 * 11. Footer - Links, legal info, and contact details
 * 12. Chat Widget - AI-powered trading assistant
 * 
 * @returns JSX.Element - Complete landing page
 */
const Index = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <div id="features" className="bg-background">
        <FeaturesSection />
      </div>

      {/* Video Demos Section */}
      <section className="container px-4 py-300 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-normal mb-6">
            Conheça nossa Plataforma <span className="text-gradient font-bold block">Smart Chat em Ação</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Veja como usar nossa ferramenta através de demonstrações práticas.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <VideoPlayer
              thumbnailUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop"
              videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Dashboard de Alta Performance"
              description="Conheça todas as funcionalidades do nosso painel"
              className="rounded-xl"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <VideoPlayer
              thumbnailUrl="https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=2084&auto=format&fit=crop"
              videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Apresentação do Smart Chat"
              description="Conheça nossa Ferramanta de Multiatendimento"
              className="rounded-xl"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <VideoPlayer
              thumbnailUrl="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2128&auto=format&fit=crop"
              videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Ferramentas do Smart Chat"
              description="Conheça todas as funcionalidades do Smart Chat"
              className="rounded-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <div className="bg-background">
        <NewsSection />
      </div>

      {/* Timeline Section - Dark Mode */}
      <div className="relative w-full bg-background">
        <div className="absolute inset-0">
          <BackgroundBeams />
        </div>
        <div className="relative z-10">
          <Timeline 
            data={timelineData} 
            endElementId="timeline-end" 
            title={<>
              Mais que uma Evolução <span className="text-gradient font-bold block">o Smart Chat é uma Inovação</span>
            </>}
            subtitle="Nossa jornada rumo a uma comunicação inteligente e eficiente."
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-background">
        <PricingSection />
      </div>

      {/* Testimonials Section */}
      <div className="bg-background">
        <TestimonialsSection />
      </div>

      {/* CTA Section */}
      <section id="cta" className="relative h-[30rem] w-full bg-background flex flex-col items-center justify-center antialiased">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="text-5xl md:text-6xl font-normal mb-6 text-center relative z-10">
            Quer Conhecer mais <span className="text-gradient font-bold block">Sobre o Smart Chat?</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto text-center relative z-10">
            Descubra o poder da Inovação com o Smart Chat.
          </p>
          <div className="mt-8 relative z-10">
            <MultiStepCTA />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <div className="bg-background">
        <Footer />
      </div>

      {/* Crypto Trading Chat */}
      <CryptoTradingChat />
    </div>
  );
};

export default Index;
