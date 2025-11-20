"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const stepSchema = [
  z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  }),
  z.object({
    email: z.string().email("Email inválido"),
  }),
  z.object({
    phone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
  }),
  z.object({
    company: z.string().min(2, "Empresa deve ter pelo menos 2 caracteres"),
  }),
  z.object({
    notes: z.string().optional(),
  }),
];

const finalSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10,11}$/),
  company: z.string().min(2),
  notes: z.string().optional(),
  status: z.enum(["prospect"]),
});

export function MultiStepCTA() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toast } = useToast();

  const steps = [
    { title: "Nome", field: "name", placeholder: "Seu nome completo" },
    { title: "Email", field: "email", placeholder: "seu@email.com" },
    { title: "Telefone", field: "phone", placeholder: "87981633477" },
    { title: "Empresa", field: "company", placeholder: "Nome da sua empresa" },
    { title: "Observações", field: "notes", placeholder: "Opcional..." },
  ];

  const validateStep = () => {
    try {
      stepSchema[currentStep].parse({ [steps[currentStep].field]: formData[steps[currentStep].field as keyof typeof formData] });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ [steps[currentStep].field]: error.errors[0]?.message || "Campo inválido" });
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast({
        title: "Erro",
        description: "Você deve aceitar os termos para continuar",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const finalData = finalSchema.parse({
        ...formData,
        status: "prospect" as const,
      });

      let response: Response | null = null
      let ok = false
      try {
        response = await fetch("/api/register-prospect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        })
        ok = response.ok
      } catch {
        ok = false
      }
      if (!ok) {
        const base = import.meta.env?.VITE_DEV_API_URL || "http://localhost:3001"
        response = await fetch(`${base}/api/register-prospect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        })
        if (!response.ok) {
          const text = await response.text()
          throw new Error(text || "Falha ao registrar cliente")
        }
      }

      setIsComplete(true);
      toast({
        title: "Sucesso!",
        description: "Seus dados foram enviados com sucesso. Entraremos em contato em breve!",
      });
    } catch (error) {
      console.error("Error submitting form:", error instanceof Error ? error.message : JSON.stringify(error));
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWelcomeEmail = async (clientData: z.infer<typeof finalSchema>) => {
    try {
      const response = await fetch("/api/send-welcome-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't throw here, as the client registration was successful
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      return digits;
    }
    return digits.slice(0, 11);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone") {
      value = formatPhoneNumber(value);
    }
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Cadastro Realizado!</h3>
        <p className="text-muted-foreground">
          Entraremos em contato em breve para apresentar o Smart Chat.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Passo {currentStep + 1} de {steps.length}
          </span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <Label className="text-lg font-medium mb-2 block">
              {steps[currentStep].title}
            </Label>
            <Input
              type={steps[currentStep].field === "email" ? "email" : "text"}
              placeholder={steps[currentStep].placeholder}
              value={formData[steps[currentStep].field as keyof typeof formData]}
              onChange={(e) => handleInputChange(steps[currentStep].field, e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (currentStep === steps.length - 1) {
                    // Will be handled by submit button
                  } else {
                    handleNext();
                  }
                }
              }}
            />
            {steps[currentStep].field === "phone" && (
              <p className="text-xs text-muted-foreground mt-1">
                Digite apenas os números (DD + número, ex: 87981633477)
              </p>
            )}
            {errors[steps[currentStep].field] && (
              <p className="text-sm text-red-500 mt-1">{errors[steps[currentStep].field]}</p>
            )}
          </div>

          {currentStep === steps.length - 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  Aceito os termos e condições
                </Label>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !termsAccepted}
                className="w-full button-gradient"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Cadastro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Voltar
            </Button>
            {currentStep < steps.length - 1 && (
              <Button onClick={handleNext} className="button-gradient">
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default MultiStepCTA;