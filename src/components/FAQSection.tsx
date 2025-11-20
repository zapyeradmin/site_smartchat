import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQSection() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'Eu já uso o WhatsApp Business. O que o Smart Chat faz que o aplicativo comum não faz?',
            answer: 'Excelente pergunta! O WhatsApp Business comum foi feito para uma pessoa gerenciar uma conta. O Smart Chat transforma esse mesmo número de WhatsApp em uma central de atendimento completa. A principal diferença é o Multiatendimento: você pode ter até 15 atendentes respondendo clientes simultaneamente pelo mesmo número, sem que um atrapalhe o outro. Além disso, você ganha um CRM Kanban para gerenciar vendas, pode criar filas de atendimento por setor (ex: Vendas, Suporte), automatizar conversas com Inteligência Artificial (GPT-4o-mini) e ter relatórios completos. É a profissionalização e a escala do seu atendimento.'
        },
        {
            id: 'item-2',
            question: 'Eu preciso ter a API Oficial do WhatsApp (Meta) para usar? Ouvi dizer que é complicado e caro.',
            answer: 'O Smart Chat oferece o melhor dos dois mundos, e essa é uma grande vantagem. Temos a integração com a API Oficial da Meta, que garante máxima estabilidade e segurança, ideal para empresas com grande volume. Contudo, também oferecemos a conexão via QR Code (Não Oficial), que é extremamente simples e rápida, perfeita para quem busca praticidade imediata. Você escolhe qual caminho seguir, e o mais importante: nossa equipe de especialistas cuida de toda a configuração inicial para você, sem dor de cabeça.'
        },
        {
            id: 'item-3',
            question: 'O plano Smart Chat custa R$249,00. Existem custos adicionais ou pegadinhas?',
            answer: 'O Smart Chat preza pela transparência total. O plano Smart Chat custa apenas R$249,00 mensais (menos de R$9,00 por dia) inclui acesso a todas as funcionalidades da plataforma: os 15 usuários, os 5 números de WhatsApp, o CRM Kanban, o Construtor de Fluxos (Flow Builder) e todas as integrações nativas. Os únicos custos que não estão inclusos são opcionais e pagos diretamente a terceiros:  1 - Tokens da OpenAI: Se você optar por usar a inteligência artificial do Chat GPT, você paga pelos tokens consumidos (o uso) diretamente para a OpenAI.  2 - Plano de Ligações: Se você quiser fazer ligações ilimitadas via Wavoip, você contrata um plano direto com eles. Se você não quiser usar IA ou ligações, não há absolutamente nenhum custo adicional.'
        },
        {
            id: 'item-4',
            question: 'Posso cancelar a qualquer momento? Tenho direito a reembolso?',
            answer: 'Ótima pergunta. Nossa política sobre isso é um dos nossos maiores diferenciais e reflete o quanto confiamos em nossa plataforma.  Sim, você pode cancelar a qualquer momento!  Acreditamos que o cliente deve permanecer conosco pela qualidade do serviço e pelos resultados, e não por amarras contratuais. Por isso, o Smart Chat não possui contrato de fidelização. Você tem total liberdade para decidir o que é melhor para o seu negócio. Quanto ao reembolso, você tem direito ao reembolso total nos 7 primeiros dias! Se, após a liberação do seu acesso, você sentir que a plataforma não é o que você esperava, pode solicitar o cancelamento em até 7 (sete) dias úteis. Garantimos o estorno de 100% do valor investido, sem burocracia. É a nossa garantia de transparência e o nosso compromisso com a sua satisfação.'
        },
        {
            id: 'item-5',
            question: 'Minha equipe é dividida entre Vendas e Suporte. As conversas vão ficar misturadas?',
            answer: 'De forma alguma. O Smart Chat foi desenhado exatamente para resolver isso através dos Setores/Filas. Você pode criar até 15 departamentos diferentes. Quando o cliente inicia uma conversa, ele pode ser direcionado (automaticamente ou por um menu) para a fila correta, por exemplo, Digita 1 para Vendas ou Digita 2 para Suporte. Assim, o time de vendas só recebe os leads, e o time de suporte só recebe os chamados, tudo de forma organizada no mesmo número.'
        },
        {
            id: 'item-6',
            question: 'Contratei o Smart Chat. E agora? Demora muito para começar a usar? Minha equipe vai precisar se virar para configurar tudo?',
            answer: 'Essa é uma etapa é onde o nosso serviço realmente brilha. O processo é muito mais rápido e assistido do que você imagina. Assim que você contrata o Smart Chat, nossa equipe de especialistas já entra em ação. Nós cuidamos de toda a configuração inicial e dos ajustes para garantir que a plataforma esteja alinhada às necessidades específicas da sua empresa. Logo em seguida, agendamos o treinamento completo (que pode ser presencial ou online) para toda a sua equipe. Nosso objetivo é que todos dominem a ferramenta e saibam extrair o máximo dela. Portanto, não se preocupe: você não fica sozinho em nenhum momento. Desde o primeiro dia, você já conta com nosso Suporte Prioritário Premium para tirar dúvidas e otimizar processos. Basicamente, você contrata, e nós preparamos tudo para que sua equipe só precise aprender a usar e começar a colher os resultados.'
        },
    ];

    return (
        <section className="py-12 bg-background">
            <div className="container mx-auto max-w-5xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <h2 className="text-5xl md:text-6xl font-normal mb-6">
                        Fique sem Dúvidas nas <span className="text-gradient font-bold block">Perguntas Frequentes</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Encontre respostas rápidas para as dúvidas mais comuns sobre o Smart Chat.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto mt-12 max-w-2xl"
                >
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card border border-border w-full rounded-2xl px-8 py-3 shadow-sm"
                    >
                        {faqItems.map((item, index) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed border-border"
                            >
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline text-foreground">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base text-muted-foreground">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8 text-center">
                        Ainda tem dúvidas? Entre em contato com nosso{' '}
                        <a
                            href="http://wa.me/5587996316081"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-medium hover:underline cursor-pointer"
                            aria-label="Abrir conversa de WhatsApp com suporte especializado"
                        >
                            suporte especializado
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}