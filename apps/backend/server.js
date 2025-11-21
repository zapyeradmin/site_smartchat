import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

dotenv.config()
const app = express()
const allowedOrigin = process.env.ALLOWED_ORIGIN
app.use(cors({ origin: allowedOrigin ? [allowedOrigin] : true }))
app.use(express.json())

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase env: VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}
const supabase = createClient(supabaseUrl, serviceRoleKey)

app.post('/api/register-prospect', async (req, res) => {
    const { name, email, phone, company, notes, status } = req.body || {}
    console.log('[dev-api] incoming body', req.body)
    if (!name || !email || !phone || !company) return res.status(400).send('Invalid data')
    const usersList = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
    const firstUserId = usersList?.data?.users?.[0]?.id
    if (!firstUserId) return res.status(500).json({ error: 'No users found to assign created_by' })
    const payload = { name, email, phone, company, notes: notes || null, status: status || 'prospect', created_by: firstUserId }
    const { data, error } = await supabase.from('clients').insert([payload]).select().single()
    if (error) {
      console.error('[dev-api] supabase insert error', error)
      return res.status(500).json({ error: error.message, details: error })
    }

    const mdPath = path.resolve(process.cwd(), 'src', 'assets', 'email-smart-chat.md')
    const mdRaw = await fs.readFile(mdPath, 'utf8')
    const subjectMatch = mdRaw.match(/^\*\*Assunto:\*\*\s*(.+)$/m) || mdRaw.match(/Assunto:\s*(.+)/m)
    const subject = (subjectMatch ? subjectMatch[1] : `Recebemos sua solicitação, ${name}! 🚀`).replace(/\{nome\}/gi, name)
    const body = mdRaw
      .replace(/^#.*$/m, '')
      .replace(/^\*\*Assunto:\*\*.*$/m, '')
      .replace(/\{nome\}/gi, name)
      .trim()

    const sourceTextCTA = body
      .replace(/^-{6,}\s*$/mg, '')
      .trim()

    const linesCTA = sourceTextCTA.split(/\r?\n/)
    let partsCTA = []
    let inListCTA = false
    let lineIndexCTA = 0
    for (const line of linesCTA) {
      const l = line.trim()
      if (!l) continue
      lineIndexCTA++
      const isBullet = /^-\s/.test(l)
      if (isBullet) {
        if (!inListCTA) {
          partsCTA.push('<ul style="margin:12px 0 20px;padding-left:0;color:#cbd5e1;font-size:16px;line-height:1.8;list-style:none;">')
          inListCTA = true
        }
        const textHtml = l.replace(/^-\s*/, '')
        partsCTA.push('<li style="margin:8px 0;font-weight:600;">' + textHtml + '</li>')
        continue
      }

      // Headings and emphasized lines
      if (lineIndexCTA === 1) {
        partsCTA.push('<p style="margin:0 0 18px;font-size:18px;font-weight:800;color:#e5e7eb;">' + l + '</p>')
        continue
      }
      if (/^Enquanto isso,/i.test(l)) {
        partsCTA.push('<p style="margin:18px 0 12px;font-size:17px;font-weight:700;color:#e5e7eb;">' + l + '</p>')
        continue
      }
      if (/^☎️\s*Contatos.*$/i.test(l)) {
        partsCTA.push('<p style="margin:20px 0 12px;font-size:17px;font-weight:700;color:#e5e7eb;">' + l + '</p>')
        continue
      }
      if (/^📲\s*WhatsApp:/i.test(l) || /^🌐\s*Site:/i.test(l) || /^📩\s*E-mail:/i.test(l)) {
        partsCTA.push('<p style="margin:6px 0;font-size:15px;line-height:1.7;color:#cbd5e1;font-weight:600;">' + l + '</p>')
        continue
      }
      // Regular paragraph with comfortable spacing
      partsCTA.push('<p style="margin:12px 0;font-size:16px;line-height:1.8;color:#cbd5e1;">' + l + '</p>')
    }
    if (inListCTA) partsCTA.push('</ul>')
    const bodyHtmlCTA = partsCTA.join('')

    let transporter
    const hasGmailCTA = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    if (hasGmailCTA) {
      transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } })
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: (process.env.SMTP_PORT || '587') === '465',
        auth: { user: process.env.SMTP_USER || process.env.GMAIL_USER, pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD },
      })
    }

    const appBaseCTA = 'https://smartchat.zapyer.com.br'
    const logoPathCTA = path.resolve(process.cwd(), 'src', 'assets', 'zapyer-hub-logo.png')
    const logoContentCTA = await fs.readFile(logoPathCTA)
    const htmlCTA = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
  </head>
  <body style="margin:0;padding:0;background:#0a0f1a;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
    <div style="max-width:680px;margin:0 auto;padding:24px;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="background:linear-gradient(135deg,#0a1420 0%,#0f2a55 50%,#1e3a8a 100%);padding:36px;border-radius:20px 20px 0 0;text-align:center;color:#fff;">
        <img src="cid:smartchat-logo" alt="Zapyer Smart Chat" style="height:56px;width:auto;display:block;margin:0 auto 16px;" />
        <div style="font-size:24px;font-weight:800;letter-spacing:.3px;">${subject}</div>
        <div style="font-size:14px;opacity:.9;margin-top:10px;">Inovação, IA e tendências para evoluir com inteligência</div>
      </div>
      <div style="background:#0f1115;border-radius:0 0 20px 20px;padding:32px;border:1px solid #1f2937;border-top:none;">
        <div style="font-size:16px;line-height:1.8;color:#cbd5e1;">${bodyHtmlCTA}</div>
        <div style="margin-top:24px;padding:16px;border:1px solid #1f2937;border-radius:12px;background:#0b0c10;color:#9ca3af;font-size:14px;line-height:1.6;">
          Você está recebendo este email porque entrou em contato pelo Smart Chat.
        </div>
        <div style="margin-top:16px;display:flex;justify-content:center;gap:16px;font-size:13px;">
          <a href="${appBaseCTA}" style="color:#93c5fd;text-decoration:none;">Site</a>
          <span style="color:#4b5563;">•</span>
          <a href="${appBaseCTA}/noticias" style="color:#93c5fd;text-decoration:none;">Notícias</a>
          <span style="color:#4b5563;">•</span>
          <a href="${appBaseCTA}/#/newsletter/descadastrar?email=${encodeURIComponent(email)}" style="color:#fca5a5;text-decoration:none;">Descadastrar</a>
        </div>
        <hr style="border:none;border-top:1px solid #1f2937;margin:28px 0;">
        <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">Smart Chat | Atendimento Inteligente de verdade. 🚀</p>
      </div>
    </div>
  </body>
</html>`

    await transporter.sendMail({ from: process.env.GMAIL_USER, to: email, subject, html: htmlCTA, attachments: [{ filename: 'zapyer-hub-logo.png', content: logoContentCTA, cid: 'smartchat-logo' }] })

    res.json({ success: true, client: data })
})

app.get('/share/noticias/:slug', async (req, res) => {
    const slug = req.params.slug
    const { data, error } = await supabase
      .from('news_admin')
      .select('*')
      .eq('slug', slug)
      .in('status', ['published', 'Publicado', 'publicado'])
      .single()

    if (error || !data) {
      return res.status(404).send('<!doctype html><html><head><meta charset="utf-8"><title>Notícia não encontrada</title></head><body>Notícia não encontrada</body></html>')
    }

    const title = data.title || 'Smart Chat - Notícias'
    const source = (data.excerpt && data.excerpt.trim().length > 0) ? data.excerpt : (data.content || '')
    const description = String(source)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200)
      .replace(/[^\w)]*$/, '') + (source ? '…' : '')

    const appBase = 'https://smartchat.zapyer.com.br'
    const canonicalUrl = `${appBase}/#/noticias/${slug}`
    const rawImage = data.featured_image || '/placeholder.svg'
    const imageUrl = /^(https?:)?\/\//.test(rawImage) ? rawImage : `${appBase}${rawImage}`
    const publishedAt = data.published_at || data.created_at
    const authorName = 'Zapyer Hub'

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">

  <meta property="og:site_name" content="Zapyer Smart Chat">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:alt" content="${title}">
  <meta property="article:published_time" content="${publishedAt}">
  <meta property="article:author" content="${authorName}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <meta http-equiv="refresh" content="1; url=${canonicalUrl}">
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:2rem;text-align:center}</style>
</head>
<body>
  <p>Redirecionando para a notícia… <a href="${canonicalUrl}">Clique aqui se não for redirecionado</a>.</p>
  <script>setTimeout(function(){ window.location.href = '${canonicalUrl}'; }, 800);</script>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
})

// Rota para newsletter - envio de email de boas-vindas
app.post('/api/newsletter/welcome', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    // Ler o template de email
    const mdPath = path.resolve(process.cwd(), 'apps', 'backend', 'assets', 'email-automatico-newsletter-zapyer-noticias.md')
    const mdRaw = await fs.readFile(mdPath, 'utf8')
    
    // Extrair assunto e conteúdo
    const subjectMatch = mdRaw.match(/^\*\*Assunto:\*\*\s*(.+)$/m)
    const subject = subjectMatch ? subjectMatch[1] : 'Bem-vindo(a) à Newsletter do Zapyer Notícias! 📰'
    
    // Processar conteúdo HTML
    const sourceText = mdRaw
      .replace(/^#.*$/m, '')
      .replace(/^\*\*Assunto:\*\*.*$/m, '')
      .replace(/^-{6,}\s*$/mg, '')
      .trim()

    const lines = sourceText
      .split(/\r?\n/)
      .filter((ln) => !/smart\s*chat\s*\|\s*atendimento\s*inteligente/i.test(ln.trim()))
    let parts = []
    let inList = false
    for (const line of lines) {
      const l = line.trim()
      if (!l) continue
      const isBullet = /^[✨🤖📈🚀\-\*]/.test(l)
      if (isBullet) {
        if (!inList) {
          parts.push('<ul style="margin:12px 0;padding-left:18px;color:#cbd5e1;font-size:16px;line-height:1.8;list-style:none;padding-left:0;">')
          inList = true
        }
        const textHtml = l.replace(/^[\-\*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        parts.push('<li style="margin:6px 0;">' + textHtml + '</li>')
      } else {
        if (inList) {
          parts.push('</ul>')
          inList = false
        }
        const textHtml = l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        parts.push('<p style="margin:10px 0;">' + textHtml + '</p>')
      }
    }
    if (inList) parts.push('</ul>')
    const content = parts.join('')

    const htmlContent = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  </head>
  <body style="margin:0;padding:0;background:#0a0f1a;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
    <div style="max-width:680px;margin:0 auto;padding:24px;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="background:linear-gradient(135deg,#0a1420 0%,#0f2a55 50%,#1e3a8a 100%);padding:36px;border-radius:20px 20px 0 0;text-align:center;color:#fff;">
        <img src="cid:smartchat-logo" alt="Zapyer Smart Chat" style="height:56px;width:auto;display:block;margin:0 auto 16px;" />
        <div style="font-size:24px;font-weight:800;letter-spacing:.3px;">Bem-vindo(a) à Newsletter do Smart Chat Notícias!</div>
        <div style="font-size:14px;opacity:.9;margin-top:10px;">Inovação, IA e tendências para evoluir com inteligência</div>
      </div>
      <div style="background:#0f1115;border-radius:0 0 20px 20px;padding:32px;border:1px solid #1f2937;border-top:none;">
        <h1 style="margin:0 0 16px;font-size:20px;line-height:1.5;color:#e5e7eb;">Bem-vindo(a) à Newsletter do Smart Chat Notícias!</h1>
        <div style="font-size:16px;line-height:1.8;color:#cbd5e1;word-break:break-word;">
          ${content}
        </div>
        <div style="margin-top:24px;padding:16px;border:1px solid #1f2937;border-radius:12px;background:#0b0c10;color:#9ca3af;font-size:14px;line-height:1.6;">
          Você está recebendo este email porque assinou a nossa newsletter.
        </div>
        <div style="margin-top:16px;display:flex;justify-content:center;gap:16px;font-size:13px;">
          <a href="https://smartchat.zapyer.com.br/#/" style="color:#93c5fd;text-decoration:none;">Site</a>
          <span style="color:#4b5563;">•</span>
          <a href="https://smartchat.zapyer.com.br/#/noticias" style="color:#93c5fd;text-decoration:none;">Notícias</a>
          <span style="color:#4b5563;">•</span>
          <a href="${appBase}/#/newsletter/descadastrar?email=${email}" style="color:#fca5a5;text-decoration:none;">Descadastrar</a>
        </div>
        <hr style="border:none;border-top:1px solid #1f2937;margin:28px 0;">
        <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">Smart Chat | Atendimento Inteligente de verdade. 🚀</p>
      </div>
    </div>
  </body>
</html>`

    // Configurar transporte de email com fallback para SMTP
    let transporter
    const hasGmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD

    if (hasGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    } else if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    } else {
      return res.status(500).json({
        error: 'SMTP não configurado',
        details: 'Defina GMAIL_USER/GMAIL_APP_PASSWORD ou SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS',
      })
    }

    // Enviar email
const logoPath = path.resolve(process.cwd(), 'src', 'assets', 'zapyer-hub-logo.png')
    const logoContent = await fs.readFile(logoPath)
    const mailOptions = {
      from: `"Smart Chat Newsletter" <${smtpUser || process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      text: mdRaw
        .replace(/^#.*$/m, '')
        .replace(/^\*\*Assunto:\*\*.*$/m, '')
        .replace(/\*\*/g, '')
        .trim(),
      attachments: [
        { filename: 'zapyer-hub-logo.png', content: logoContent, cid: 'smartchat-logo' }
      ]
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email de boas-vindas enviado para ${email}: ${info.messageId}`)
    
    res.json({ 
      success: true, 
      message: 'Email de boas-vindas enviado com sucesso',
      messageId: info.messageId
    })

  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error)
    res.status(500).json({ 
      error: 'Erro ao enviar email de boas-vindas',
      details: error.message 
    })
  }
})

app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }

    const { error: upsertError } = await supabase
      .from('newsletter')
      .upsert([{ email, status: 'active' }], { onConflict: 'email' })

    if (upsertError) {
      return res.status(500).json({ error: 'Erro ao cadastrar', details: upsertError.message })
    }

const mdPath = path.resolve(process.cwd(), 'apps', 'backend', 'assets', 'email-automatico-newsletter-zapyer-noticias.md')
    const mdRaw = await fs.readFile(mdPath, 'utf8')
    const subjectMatch = mdRaw.match(/^\*\*Assunto:\*\*\s*(.+)$/m)
    const subject = subjectMatch ? subjectMatch[1] : 'Bem-vindo(a) à Newsletter do Smart Chat Notícias! 📰'

    const appBase = 'https://smartchat.zapyer.com.br'
    const content = mdRaw
      .replace(/^#.*$/m, '')
      .replace(/^\*\*Assunto:\*\*.*$/m, '')
      .trim()
    const htmlContent = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
  </head>
  <body style="margin:0;padding:0;background:#0a0f1a;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
    <div style="max-width:680px;margin:0 auto;padding:24px;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="background:linear-gradient(135deg,#0a1420 0%,#0f2a55 50%,#1e3a8a 100%);padding:36px;border-radius:20px 20px 0 0;text-align:center;color:#fff;">
        <img src="cid:smartchat-logo" alt="Zapyer Smart Chat" style="height:56px;width:auto;display:block;margin:0 auto 16px;" />
        <div style="font-size:24px;font-weight:800;letter-spacing:.3px;">${subject}</div>
        <div style="font-size:14px;opacity:.9;margin-top:10px;">Inovação, IA e tendências para evoluir com inteligência</div>
      </div>
      <div style="background:#0f1115;border-radius:0 0 20px 20px;padding:32px;border:1px solid #1f2937;border-top:none;">
        <div style="font-size:16px;line-height:1.8;color:#cbd5e1;">${content.replace(/\n\n/g, '</p><p>').replace(/^/m, '<p>').replace(/$/m, '</p>').replace(/<p><\/p>/g, '')}</div>
        <div style="margin-top:24px;padding:16px;border:1px solid #1f2937;border-radius:12px;background:#0b0c10;color:#9ca3af;font-size:14px;line-height:1.6;">Você está recebendo este email porque assinou a nossa newsletter.</div>
        <div style="margin-top:16px;display:flex;justify-content:center;gap:16px;font-size:13px;">
          <a href="${appBase}" style="color:#93c5fd;text-decoration:none;">Site</a>
          <span style="color:#4b5563;">•</span>
          <a href="${appBase}/noticias" style="color:#93c5fd;text-decoration:none;">Notícias</a>
          <span style="color:#4b5563;">•</span>
          <a href="${appBase}/#/newsletter/descadastrar?email=${encodeURIComponent(email)}" style="color:#fca5a5;text-decoration:none;">Descadastrar</a>
        </div>
        <hr style="border:none;border-top:1px solid #1f2937;margin:28px 0;">
        <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">Smart Chat | Atendimento Inteligente de verdade. 🚀</p>
      </div>
    </div>
  </body>
</html>`

    let transporter
    const hasGmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD
    if (hasGmail) {
      transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } })
    } else if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: smtpUser, pass: smtpPass } })
    } else {
      return res.status(500).json({ error: 'SMTP não configurado' })
    }

    let logoContent
    try {
      const logoPathBackend = path.resolve(process.cwd(), 'apps', 'backend', 'assets', 'zapyer-hub-logo.png')
      logoContent = await fs.readFile(logoPathBackend)
    } catch {
      const logoPathSrc = path.resolve(process.cwd(), 'src', 'assets', 'zapyer-hub-logo.png')
      logoContent = await fs.readFile(logoPathSrc)
    }
    const info = await transporter.sendMail({
      from: `"Smart Chat Newsletter" <${smtpUser || process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent,
      attachments: [{ filename: 'zapyer-hub-logo.png', content: logoContent, cid: 'smartchat-logo' }]
    })
    res.json({ success: true, messageId: info.messageId })
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao assinar', details: error.message })
  }
})

// Nova notícia: enviar email aos assinantes
app.post('/api/newsletter/news-created', async (req, res) => {
  try {
    const { slug } = req.body
    if (!slug) {
      return res.status(400).json({ error: 'Slug é obrigatório' })
    }

    const { data: article, error: articleErr } = await supabase
      .from('news_admin')
      .select('*')
      .eq('slug', slug)
      .single()

    if (articleErr || !article) {
      return res.status(404).json({ error: 'Notícia não encontrada' })
    }

    if (!['published', 'Publicado', 'publicado'].includes(String(article.status).toLowerCase())) {
      return res.status(400).json({ error: 'Notícia não está publicada' })
    }

    const mdPath = path.resolve(process.cwd(), 'apps', 'backend', 'assets', 'email-automatico-nova-noticia-newsletter-zapyer-noticias.md')
    const mdRaw = await fs.readFile(mdPath, 'utf8')

    const subjectMatch = mdRaw.match(/^\*\*Assunto:\*\*\s*(.+)$/m)
    const subject = subjectMatch ? subjectMatch[1] : `Nova Notícia no Smart Chat Notícias! 📰`

  const appBase = 'https://smartchat.zapyer.com.br'
    const canonicalUrl = `${appBase}/#/noticias/${article.slug}`
    const rawImage = article.featured_image || '/placeholder.svg'
    const imageUrl = /^(https?:)?\/\//.test(rawImage) ? rawImage : `${appBase}${rawImage}`
    const source = (article.excerpt && article.excerpt.trim().length > 0) ? article.excerpt : (article.content || '')
    const summary = String(source)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220)
      .replace(/[^\w)]*$/, '') + (source ? '…' : '')

    const sourceText = mdRaw
      .replace(/^#.*$/m, '')
      .replace(/^\*\*Assunto:\*\*.*$/m, '')
      .trim()

    const bodyContent = ''

    const htmlContent = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  </head>
  <body style="margin:0;padding:0;background:#0a0f1a;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
    <div style="max-width:680px;margin:0 auto;padding:24px;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="background:linear-gradient(135deg,#0a1420 0%,#0f2a55 50%,#1e3a8a 100%);padding:36px;border-radius:20px 20px 0 0;text-align:center;color:#fff;">
        <img src="cid:smartchat-logo" alt="Zapyer Smart Chat" style="height:56px;width:auto;display:block;margin:0 auto 16px;" />
        <div style="font-size:24px;font-weight:800;letter-spacing:.3px;">${subject}</div>
        <div style="font-size:14px;opacity:.9;margin-top:10px;">Inovação, IA e tendências para evoluir com inteligência</div>
      </div>
      <div style="background:#0f1115;border-radius:0 0 20px 20px;padding:32px;border:1px solid #1f2937;border-top:none;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:0;">
              <img src="${imageUrl}" alt="${article.title}" style="display:block;width:100%;max-width:640px;height:360px;object-fit:cover;border-radius:12px;border:1px solid #1f2937;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:12px;">
              <div style="font-size:22px;line-height:1.5;color:#e5e7eb;text-align:center;font-weight:800;margin:0;">${article.title}</div>
            </td>
          </tr>
          <tr>
            <td align="left" style="padding-top:8px;">
              <div style="font-size:16px;line-height:1.8;color:#cbd5e1;text-align:justify;margin:0;">${summary}</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:12px;">
              <a href="${canonicalUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:9999px;font-weight:700;">Leia a Notícia</a>
            </td>
          </tr>
        </table>
        ${bodyContent}
        <div style="margin-top:24px;padding:16px;border:1px solid #1f2937;border-radius:12px;background:#0b0c10;color:#9ca3af;font-size:14px;line-height:1.6;">
          Você está recebendo este email porque assinou a nossa newsletter.
        </div>
        <hr style="border:none;border-top:1px solid #1f2937;margin:28px 0;">
        <div style="margin-top:16px;display:flex;justify-content:center;gap:16px;font-size:13px;">
          <a href="${appBase}/#/" style="color:#93c5fd;text-decoration:none;">Site</a>
          <span style="color:#4b5563;">•</span>
          <a href="${appBase}/#/noticias" style="color:#93c5fd;text-decoration:none;">Notícias</a>
          <span style="color:#4b5563;">•</span>
          <a href="${appBase}/#/newsletter/descadastrar?email={{email}}" style="color:#fca5a5;text-decoration:none;">Descadastrar</a>
        </div>
        <hr style="border:none;border-top:1px solid #1f2937;margin:28px 0;">
        <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">Smart Chat | Atendimento Inteligente de verdade. 🚀</p>
      </div>
    </div>
  </body>
</html>`

    let transporter
    const hasGmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD

    if (hasGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      })
    } else if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    } else {
      return res.status(500).json({ error: 'SMTP não configurado' })
    }

    let logoContent
    try {
      const logoPathBackend = path.resolve(process.cwd(), 'apps', 'backend', 'assets', 'zapyer-hub-logo.png')
      logoContent = await fs.readFile(logoPathBackend)
    } catch {
      const logoPathSrc = path.resolve(process.cwd(), 'src', 'assets', 'zapyer-hub-logo.png')
      logoContent = await fs.readFile(logoPathSrc)
    }

    const { data: subscribers, error: subsErr } = await supabase
      .from('newsletter')
      .select('email,status')
      .eq('status', 'active')

    if (subsErr) {
      return res.status(500).json({ error: 'Erro ao buscar assinantes', details: subsErr.message })
    }

    let sent = 0
    for (const sub of subscribers || []) {
      if (!sub.email) continue
      const personalizedHtml = htmlContent.replace('{{email}}', encodeURIComponent(sub.email))
      const mailOptions = {
        from: `"Smart Chat Newsletter" <${smtpUser || process.env.GMAIL_USER}>`,
        to: sub.email,
        subject: subject,
        html: personalizedHtml,
        text: `${article.title}\n\n${summary}\n\nAcesse: ${canonicalUrl}`,
        attachments: [ { filename: 'zapyer-hub-logo.png', content: logoContent, cid: 'smartchat-logo' } ],
      }
      try {
        await transporter.sendMail(mailOptions)
        sent++
      } catch (err) {
        console.error('[newsletter/news-created] fail for', sub.email, err)
      }
    }

    // Registrar envio
    try {
      await supabase.from('newsletter_sends').insert([{ slug: article.slug, total_enviados: sent }])
    } catch (e) {
      console.warn('[newsletter/news-created] log insert failed', e?.message)
    }

    res.json({ success: true, sent, total: (subscribers || []).length })
  } catch (error) {
    console.error('[newsletter/news-created] error', error)
    res.status(500).json({ error: 'Erro interno ao enviar nova notícia', details: error.message })
  }
})

const port = 3001
app.listen(port, () => {
  console.log(`[dev-api] listening on http://localhost:${port}`)
})