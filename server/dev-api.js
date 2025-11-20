import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase env: VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}
const supabase = createClient(supabaseUrl, serviceRoleKey)

app.post('/api/register-prospect', async (req, res) => {
  try {
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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({ from: process.env.GMAIL_USER, to: email, subject, text: body })

    res.json({ success: true, client: data })
  } catch (err) {
    console.error('[dev-api] unknown error', err)
    res.status(500).json({ error: err?.message || 'Unknown error' })
  }
})

const port = 3001
app.listen(port, () => {
  console.log(`[dev-api] listening on http://localhost:${port}`)
})