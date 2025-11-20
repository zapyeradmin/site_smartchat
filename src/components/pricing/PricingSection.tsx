import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "./CardSpotlight";
import { PRICING_CONTACT } from "@/constants";

const PricingTier = ({
  name,
  price,
  description,
  features,
  isPopular,
  hireUrl,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  hireUrl?: string;
}) => (
  <CardSpotlight className={`h-full ${isPopular ? "border-primary" : "border-white/10"} border-2`}>
    <div className="relative h-full p-6 flex flex-col">
      {isPopular && (
        <span className="text-xs font-medium bg-primary/10 text-primary rounded-full px-3 py-1 w-fit mb-4">
          Mais Popular
        </span>
      )}
      <h3 className="text-xl font-medium mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold">{price}</span>
        {price !== "Personalizado" && <span className="text-gray-400">/mês</span>}
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      {hireUrl ? (
        <Button asChild className="button-gradient w-full">
          <a href={hireUrl} target="_blank" rel="noopener noreferrer">Contratar Agora</a>
        </Button>
      ) : (
        <Button className="button-gradient w-full">
          Contratar Agora
        </Button>
      )}
    </div>
  </CardSpotlight>
);

export const PricingSection = () => {
  return (
    <section className="container px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-normal mb-6"
        >
          Comece Agora seu{" "}
          <span className="text-gradient font-bold">Plano Smart Chat</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-lg text-gray-400"
        >
          Selecione o melhor plano, perfeito com recursos avançados e tudo liberado
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {(() => {
          const encoded = encodeURIComponent(PRICING_CONTACT.MESSAGES.free)
          const url = `http://wa.me/${PRICING_CONTACT.WHATSAPP_NUMBER}?text=${encoded}`
          return (
            <PricingTier
              name="Plano Grátis"
              price="R$ 0"
              description="Plano Gratuito com Recursos Básicos"
              features={[
                "1 Conexão WhatsApp",
                "Apenas 1 Usuário",
                "Integrações Básicas",
                "Recursos Limitados"
              ]}
              hireUrl={url}
            />
          )
        })()}
        {(() => {
          const encoded = encodeURIComponent(PRICING_CONTACT.MESSAGES.smart)
          const url = `http://wa.me/${PRICING_CONTACT.WHATSAPP_NUMBER}?text=${encoded}`
          return (
            <PricingTier
              name="Smart Chat"
              price="R$ 249"
              description="Todos os Recursos Avançados Liberados"
              features={[
                "Até 5 Conexão WhatsApp",
                "Até 15 Usuários",
                "Mensagens Ilimitadas",
                "Integrações Avançadas",
                "ChatGPT, Gemini, Flowbuilder liberados..."
              ]}
              isPopular
              hireUrl={url}
            />
          )
        })()}
        {(() => {
          const encoded = encodeURIComponent(PRICING_CONTACT.MESSAGES.corporate)
          const url = `http://wa.me/${PRICING_CONTACT.WHATSAPP_NUMBER}?text=${encoded}`
          return (
            <PricingTier
              name="Corporativo"
              price="Personalizado"
              description="Soluções de Nível Corporativo Totalmente Personalizado"
              features={[
                "Soluções de comunicação personalizadas",
                "Instalação Própria",
                "White Label com sua Marca e Cor",
                "Conta Ilimitada de Usuários",
                "Integração de API personalizada",
                "Suporte prioritário 24/7"
              ]}
              hireUrl={url}
            />
          )
        })()}
      </div>
    </section>
  );
};