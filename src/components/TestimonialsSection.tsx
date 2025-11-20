"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { BinaryRain } from "@/components/ui/binary-rain";

const testimonials = [
  {
    name: "Marcelo Carvalho",
    role: "Profissional Dentista",
    image: "https://images.unsplash.com/photo-1667133295308-9ef24f71952e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=757",
    content: "Gente, sério, eu não sei como a gente sobrevivia antes do Smart Chat. Era uma loucura, todo mundo respondendo no mesmo número, cliente esperando horas... Agora, tudo é organizado por setores. Podem contratar de olhos fechados!."
  },
  {
    name: "Sarah Veloso",
    role: "Empreendedora Digital",
    image: "https://images.unsplash.com/photo-1730663454733-a82313c3f35d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=746",
    content: "Eu achava que perdia vendas por causa do preço, mas era por falta de organização. O CRM Kanban do Smart Chat mudou nosso jogo. Não perdemos mais nenhuma oportunidade. Recomendo 100%!"
  },
  {
    name: "Diego Souto",
    role: "Advogado Previdenciário",
    image: "https://images.unsplash.com/photo-1659128103048-e41477d734a5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=697",
    content: "Meu time de suporte vivia sobrecarregado respondendo as mesmas coisas: 'qual o horário?', 'qual o valor?', 'onde fica?'. Depois que configuramos o prompt com a integração do GPT, foi surreal. O Melhor investimento!"
  },
  {
    name: "Emília Martins",
    role: "Gerente Comercial",
    image: "https://images.unsplash.com/photo-1727268531070-b9284f2379f9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    content: "O maior benefício para nós foi poder ter 15 pessoas atendendo no mesmo número de WhatsApp. Antes, o celular ficava passando de mão em mão, era um caos. O cliente é respondido em segundos!"
  },
  {
    name: "Flávio Gustavo",
    role: "Corretor Imobiliário",
    image: "https://images.unsplash.com/photo-1656717161981-56d0ce777fdc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    content: "Eu confesso que tinha receio de contratar por achar que seria muito complicado de configurar. A surpresa foi o suporte da Zapyer Hub. O pessoal foi incrível, configurou tudo com a gente, deu treinamento para a equipe. Eles não te deixam na mão!"
  },
  {
    name: "Dra. Ana Esteves",
    role: "Advogada",
    image: "https://images.unsplash.com/photo-1662104935883-e9dd0619eaba?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
    content: "Estávamos com o custo operacional alto e o atendimento lento. O Smart Chat resolveu os dois. Com as respostas rápidas, o agendamento de mensagens e o chatbot, minha equipe (com o mesmo número de pessoas) agora produz o triplo. Vale cada centavo!"
  }
];

const TestimonialsSection = () => {
  return (
    <section
      className="py-12 overflow-hidden relative bg-cover bg-center"
      style={{ backgroundImage: "url(/lovable-uploads/background-smartchat.png)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/85" />
      <BinaryRain className="absolute inset-0 w-full h-full" color="rgba(99, 102, 241, 0.8)" speed={1.1} density={1} opacity={0.35} />
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-normal mb-6">
            Aprovado e Recomendado <span className="text-gradient font-bold block">por Quem Utiliza</span>
          </h2>
          <p className="text-lg text-gray-400">
            Faça parte dos nossos clientes satisfeitos no Smart Chat
          </p>
        </motion.div>

        <div className="relative flex flex-col antialiased">
          <div className="relative flex flex-col overflow-hidden py-6 space-y-8">
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-10">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-1`} className="w-[420px] shrink-0 rounded-2xl bg-background/60 backdrop-blur-xl border-border/40 hover:bg-background/70 hover:border-border transition-all duration-300 shadow-lg p-6 md:p-8">
                  <div className="flex items-center gap-5 mb-6">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/30">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-lg font-semibold text-white/90">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-base md:text-lg leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;