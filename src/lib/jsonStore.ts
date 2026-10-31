import { promises as fs } from 'fs';
import path from 'path';

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  const config = supabaseConfig();
  if (config) {
    const query = new URLSearchParams({ key: `eq.${file}`, select: 'value' });
    const response = await fetch(`${config.url}/rest/v1/autometa_data?${query}`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Não foi possível ler no Supabase. Confira a tabela autometa_data.');
    const rows: { value: T }[] = await response.json();
    if (rows.length) return rows[0].value;
  }
  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), file), 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw error;
  }
}

export async function writeJson<T>(file: string, value: T): Promise<void> {
  const config = supabaseConfig();
  if (config) {
    const response = await fetch(`${config.url}/rest/v1/autometa_data?on_conflict=key`, {
      method: 'POST',
      headers: {
        apikey: config.key, Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ key: file, value }), cache: 'no-store',
    });
    if (!response.ok) throw new Error('Não foi possível salvar no Supabase. Confira a tabela autometa_data.');
    return;
  }
  if (process.env.VERCEL) throw new Error('Configure o Supabase no Vercel para salvar posts e histórico.');
  const target = path.join(process.cwd(), file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(value, null, 2), 'utf8');
}
