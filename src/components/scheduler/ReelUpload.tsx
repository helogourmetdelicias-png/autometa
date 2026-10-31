'use client';

import { useState } from 'react';

async function checkVideo(file: File): Promise<void> {
  if (!file.name.toLowerCase().endsWith('.mp4') || file.size === 0 || file.size > 50 * 1024 * 1024) throw new Error('Use um MP4 de até 50 MB.');
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (Array.from(header.slice(4, 8)).map(byte => String.fromCharCode(byte)).join('') !== 'ftyp') throw new Error('O arquivo não parece ser um MP4 válido.');
  await new Promise<void>((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    const cleanup = () => { clearTimeout(timer); video.onloadedmetadata = null; video.onerror = null; video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Não foi possível ler o vídeo. Exporte novamente em MP4 H.264.')); }, 15000);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const valid = Number.isFinite(video.duration) && video.duration >= 4 && video.duration <= 60.1 && video.videoWidth >= 540 && video.videoHeight >= 960 && Math.abs(video.videoWidth / video.videoHeight - 9 / 16) < 0.02;
      video.onloadedmetadata = null;
      video.onerror = null;
      cleanup();
      if (valid) resolve(); else reject(new Error('Nesta versão, use vídeo vertical 9:16, com 4 a 60 segundos e resolução mínima de 540 × 960.'));
    };
    video.onerror = () => { video.onerror = null; cleanup(); reject(new Error('O navegador não conseguiu ler o MP4. Exporte em H.264/AAC.')); };
    video.src = url;
  });
}

export function ReelUpload({ value, onChange, onBusyChange }: { value: string; onChange: (url: string) => void; onBusyChange: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setBusy(true); onBusyChange(true); setError(''); setProgress(0);
    try {
      await checkVideo(file);
      const response = await fetch('/api/scheduler/video-upload', {
        method: 'POST', headers: { Authorization: `Bearer ${sessionStorage.getItem('adminSecret')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'video/mp4', size: file.size }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível preparar o envio.');
      await new Promise<void>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PUT', data.signedUrl);
        request.timeout = 300000;
        request.setRequestHeader('Content-Type', 'video/mp4');
        request.setRequestHeader('cache-control', 'max-age=3600');
        request.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(100 * e.loaded / e.total)); };
        request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error('O Supabase recusou o upload. Confira o bucket marketing-videos e o limite de tamanho.'));
        request.onerror = () => reject(new Error('Conexão interrompida no envio. Tente novamente.'));
        request.ontimeout = () => reject(new Error('O envio demorou demais. Confira a conexão e tente novamente.'));
        request.send(file);
      });
      onChange(data.videoUrl);
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao enviar vídeo.'); }
    finally { setBusy(false); onBusyChange(false); }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="reel-video" className="block text-xs font-medium text-gray-700">Vídeo do Reel</label>
      <input id="reel-video" type="url" disabled={busy} value={value} onChange={e => onChange(e.target.value)} placeholder="https://seu-site.com/video.mp4" className="w-full px-3 py-2 border rounded-lg text-sm" />
      <label htmlFor="reel-file" className="block text-xs text-gray-700">Ou envie um MP4 do computador (até 50 MB)</label>
      <input id="reel-file" type="file" accept="video/mp4,.mp4" disabled={busy} className="text-xs w-full" onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ''; }} />
      <p className="text-xs text-gray-500">Vertical 9:16, de 4 a 60 segundos. Recomendado: 1080 × 1920, H.264 e áudio AAC. Salve o post após enviar o vídeo.</p>
      {busy && <p role="status" className="text-xs text-blue-700">Enviando vídeo: {progress}%</p>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {value && <video key={value} src={value} controls preload="metadata" className="max-h-80 max-w-full rounded-lg bg-black" />}
    </div>
  );
}
