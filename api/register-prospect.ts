import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10,11}$/),
  company: z.string().min(2),
  notes: z.string().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const data = schema.parse(req.body)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined
    if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Supabase env missing' })

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const usersList = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
    const firstUserId = usersList?.data?.users?.[0]?.id
    if (!firstUserId) return res.status(500).json({ error: 'No users found to assign created_by' })
    const insertPayload = { ...data, status: 'prospect' as const, created_by: firstUserId }
    const { data: inserted, error } = await supabase
      .from('clients')
      .insert([insertPayload])
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    const mdPath = path.resolve(process.cwd(), 'src', 'assets', 'email-smart-chat.md')
    const mdRaw = await fs.readFile(mdPath, 'utf8')
    const subjectMatch = mdRaw.match(/^\*\*Assunto:\*\*\s*(.+)$/m) || mdRaw.match(/Assunto:\s*(.+)/m)
    const subject = (subjectMatch ? subjectMatch[1] : `Recebemos sua solicitação, ${data.name}! 🚀`).replace(/\{nome\}/gi, data.name)
    const body = mdRaw
      .replace(/^#.*$/m, '')
      .replace(/^\*\*Assunto:\*\*.*$/m, '')
      .replace(/\{nome\}/gi, data.name)
      .trim()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })

    const emailContent = `Olá, ${data.name}, tudo bem?

Obrigado por entrar em contato e demonstrar interesse em conhecer o Smart Chat, a plataforma completa para transformar o atendimento da sua empresa através do WhatsApp.

Seus dados foram recebidos com sucesso e, em breve, um de nossos consultores irá falar com você para apresentar como o Smart Chat pode aumentar sua produtividade, reduzir custos e automatizar seu atendimento de forma simples, poderosa e totalmente personalizada.

Enquanto isso, aqui vai um breve resumo do que você terá acesso:

✨ Atendimentos mais rápidos e organizados com múltiplos agentes e filas inteligentes.
🤖 Chatbots avançados com IA (GPT-4o-mini) para respostas naturais e automatização completa.
📈 CRM Kanban integrado para gerenciar oportunidades direto das conversas.
📊 Dashboard analítico para acompanhar métricas e decisões estratégicas.
🔗 Integrações profissionais com N8N, Webhooks, Typebot, VoIP e muito mais.
💬 Mensagens ilimitadas, até 5 números conectados e 15 usuários simultâneos.

Tudo isso com suporte humanizado, implementação completa e um ecossistema robusto para escalar o seu atendimento! (pagando menos de R$ 9,00 por dia)

Logo mais entraremos em contato para te guiar para o próximo passo e mostrar o potencial do Smart Chat para o seu negócio.

📞 Contatos do Smart Chat
WhatsApp: +55 (87) 99631-6081
Site: smartchat.zapyer.com.br
E-mail: admzapyer@gmail.com

Se precisar de algo antes do nosso contato, é só chamar! Estamos aqui para ajudar você a transformar o atendimento da sua empresa.

Smart Chat | Atendimento Inteligente de Verdade. 🚀`

    await transporter.sendMail({ from: process.env.GMAIL_USER, to: data.email, subject, text: body })

    return res.status(200).json({ success: true, client: inserted })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid data', details: err.errors })
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
  }
}