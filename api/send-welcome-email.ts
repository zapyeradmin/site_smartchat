import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';

const sendWelcomeEmailSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = sendWelcomeEmailSchema.parse(req.body);
    
    const mdPath = path.resolve(process.cwd(), 'src', 'assets', 'email-smart-chat.md');
    const mdRaw = await fs.readFile(mdPath, 'utf8');
    const subjectMatch = mdRaw.match(/^\*\*Assunto:\*\*\s*(.+)$/m) || mdRaw.match(/Assunto:\s*(.+)/m);
    const subject = (subjectMatch ? subjectMatch[1] : `Recebemos sua solicitação, ${data.name}! 🚀`).replace(/\{nome\}/gi, data.name);
    const body = mdRaw
      .replace(/^#.*$/m, '')
      .replace(/^\*\*Assunto:\*\*.*$/m, '')
      .replace(/\{nome\}/gi, data.name)
      .trim();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: data.email,
      subject,
      text: body,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error instanceof z.ZodError ? error.errors : undefined
    });
  }
}