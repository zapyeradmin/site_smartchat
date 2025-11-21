import React, { useState, useCallback } from 'react'
import { Mail, SendHorizonal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface NewsletterSignupProps {
  className?: string
  placeholder?: string
  buttonText?: string
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  className = "",
  placeholder = "Assine nossa Newsletter Grátis",
  buttonText = "Assinar"
}) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleNewsletterSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Assinar via backend e enviar email de boas-vindas
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${apiBase}/api/newsletter/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          console.warn('⚠️ Não foi possível enviar email de boas-vindas', body)
          toast({
            title: 'Aviso',
            description: body?.details ? `Falha ao enviar email: ${body.details}` : 'Falha ao enviar email de boas-vindas.',
          })
        } else {
          console.log('✅ Email de boas-vindas enviado com sucesso')
          toast({
            title: 'Email enviado',
            description: 'Mensagem de boas-vindas enviada ao seu email.',
          })
        }
      } catch (emailError) {
        console.warn('⚠️ Erro ao enviar email de boas-vindas:', emailError)
        toast({
          title: 'Aviso',
          description: 'Não foi possível enviar o email de boas-vindas agora.',
        })
      }

      toast({
        title: "Sucesso!",
        description: "Inscrição concluída e email de boas-vindas enviado.",
        variant: "default",
      })
      
      setEmail('')
      
    } catch (error: any) {
      console.error('Erro ao cadastrar newsletter:', error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar sua inscrição.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [email, toast])

  return (
    <form onSubmit={handleNewsletterSubmit} className={className}>
      <div className="bg-background has-[input:focus]:ring-ring relative grid grid-cols-[1fr_auto] pr-1.5 items-center rounded-full border border-border shadow-lg has-[input:focus]:ring-2 transition-all duration-300 hover:shadow-xl lg:pr-0">
        <Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-muted-foreground" />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent pl-12 text-foreground placeholder:text-muted-foreground focus:outline-none"
          type="email"
          required
          disabled={isSubmitting}
          aria-label="Email para newsletter"
        />

        <div className="md:pr-1.5 lg:pr-0">
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-label={buttonText}
            size="sm"
            className="rounded-full button-gradient h-12 px-6 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <span className="hidden md:block">{buttonText}</span>
                <SendHorizonal
                  className="relative mx-auto size-5 md:hidden"
                  strokeWidth={2}
                />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}