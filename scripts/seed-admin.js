import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltam variáveis no .env: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias para criar usuário admin.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Sem checagens extras; políticas devem ser aplicadas via migrations

async function main() {
  console.log('Seed: criando usuário super administrador...');
  const email = 'admzapyer@gmail.com';
  const password = 'Admin@123';
  const full_name = 'Marcilio Barros';

  // Tentar localizar usuário por email; se não existir, criar
  let userId = null;
  let existingUser = null;
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data: listRes, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage });
    if (listErr) {
      console.error('Erro ao listar usuários:', listErr.message);
      break;
    }
    existingUser = listRes?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      userId = existingUser.id;
      console.log('Usuário já existente:', userId);
      break;
    }
    if (!listRes || listRes.users?.length < perPage) {
      break;
    }
    page += 1;
  }

  if (!userId) {
    // Criar usuário via Admin API, confirmando email
    const { data: createRes, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createErr) {
      // Se o usuário já existir, tentamos novamente buscar
      if (createErr.message && createErr.message.includes('already been registered')) {
        console.warn('Usuário já existe, tentando localizar para atribuir papel...');
      } else {
        console.error('Erro ao criar usuário admin:', createErr.message);
        process.exit(1);
      }
    } else {
      userId = createRes.user.id;
      console.log('Usuário criado:', userId);
    }

    if (!userId) {
      // Buscar novamente para obter o id após erro de usuário existente
      page = 1;
      while (true) {
        const { data: listRes2, error: listErr2 } = await supabase.auth.admin.listUsers({ page, perPage });
        if (listErr2) {
          console.error('Erro ao listar usuários (2):', listErr2.message);
          break;
        }
        existingUser = listRes2?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (existingUser) {
          userId = existingUser.id;
          console.log('Usuário localizado:', userId);
          break;
        }
        if (!listRes2 || listRes2.users?.length < perPage) {
          break;
        }
        page += 1;
      }
    }
  }

  if (!userId) {
    console.error('Não foi possível obter o ID do usuário admin.');
    process.exit(1);
  }

  // Atribuir papel admin
  const { error: roleErr } = await supabase.from('user_roles').upsert({ user_id: userId, role: 'admin' });
  if (roleErr) {
    console.error('Erro ao atribuir papel admin:', roleErr.message);
    process.exit(1);
  }
  console.log('Papel admin atribuído.');

  // Opcional: validar perfil se tabela existir
  try {
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (profErr) {
      console.warn('Aviso: não foi possível validar perfil (pode ser RLS ou tabela ausente).');
    } else {
      console.log('Perfil encontrado para admin:', profile?.full_name);
    }
  } catch (_) {
    console.warn('Aviso: tabela profiles não disponível para verificação agora.');
  }

  console.log('Seed concluído com sucesso.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Seed falhou:', e?.message || e);
    process.exit(1);
  });