import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Blog = () => (
  <div className="w-full py-12 lg:py-12">
    <div className="container mx-auto flex flex-col gap-14">
      <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
        <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular">
          Últimos artigos
        </h4>
        <Button className="gap-4">
          Ver todos os artigos <MoveRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex flex-col gap-2 hover:opacity-75 cursor-pointer">
          <div 
            className="rounded-md aspect-video mb-4 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('/lovable-uploads/4681b45a-e10b-4a3a-8d17-0b0defcd7032.png')" }}
          ></div>
          <h3 className="text-xl tracking-tight">Como Fazer Seu Primeiro Trade</h3>
          <p className="text-muted-foreground text-base">
            Aprenda estratégias essenciais de trading de criptomoedas para 
            maximizar seus lucros.
          </p>
        </div>
        <div className="flex flex-col gap-2 hover:opacity-75 cursor-pointer">
          <div 
            className="rounded-md aspect-video mb-4 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('/lovable-uploads/61b45282-5735-4bef-8996-557611b71182.png')" }}
          ></div>
          <h3 className="text-xl tracking-tight">Análise de Mercado Avançada</h3>
          <p className="text-muted-foreground text-base">
            Domine ferramentas de análise técnica para tomar decisões 
            mais informadas em seus trades.
          </p>
        </div>
        <div className="flex flex-col gap-2 hover:opacity-75 cursor-pointer">
          <div 
            className="rounded-md aspect-video mb-4 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('/lovable-uploads/de08f44e-da14-467d-882c-67f893cdd9b7.png')" }}
          ></div>
          <h3 className="text-xl tracking-tight">Gestão de Risco no Trading</h3>
          <p className="text-muted-foreground text-base">
            Aprenda a proteger seu capital com estratégias eficazes 
            de gerenciamento de risco.
          </p>
        </div>
        <div className="flex flex-col gap-2 hover:opacity-75 cursor-pointer">
          <div 
            className="rounded-md aspect-video mb-4 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('/lovable-uploads/d4235e74-39e5-47b2-a294-9e825d81c7f0.png')" }}
          ></div>
          <h3 className="text-xl tracking-tight">Tendências do Mercado Cripto</h3>
          <p className="text-muted-foreground text-base">
            Fique por dentro das últimas tendências e oportunidades 
            no mercado de criptomoedas.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export { Blog };