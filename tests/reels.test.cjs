const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Executa o TypeScript com APIs externas simuladas: não usa credenciais nem publica.
function load(file, options = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, {
    exports, URL, URLSearchParams, AbortSignal, console,
    process: { env: { META_PAGE_ID: '123', META_PAGE_ACCESS_TOKEN: 'test-secret', ...options.env } },
    require(name) { if (name in (options.modules || {})) return options.modules[name]; return require(name); },
    fetch: async () => { throw new Error('Unexpected network request'); },
    ...options.globals,
  }, { filename: file });
  return exports;
}
const ok = data => ({ ok: true, status: 200, json: async () => data });
const response = (status, data) => ({ ok: false, status, json: async () => data });

test('Reel: início, transferência autenticada e finalização; permanece em processamento', async () => {
  const calls = [];
  const queue = [ok({ video_id: '999', upload_url: 'https://rupload.facebook.com/video-upload/v26.0/999' }), ok({ success: true }), ok({ success: true })];
  const service = load('src/services/reels.ts', { globals: { fetch: async (url, init) => { calls.push({ url, init }); return queue.shift(); } } });
  const result = await service.publishReel('Legenda', 'https://cdn.example/video.mp4', 'https://example.com');
  assert.equal(result.success, true);
  assert.equal(result.pending, true);
  assert.equal(result.postId, '999');
  assert.equal(calls.length, 3);
  assert.equal(calls[1].init.headers.file_url, 'https://cdn.example/video.mp4');
  assert.equal(calls[1].init.headers.Authorization, 'OAuth test-secret');
  assert.equal(calls[2].init.body.get('upload_phase'), 'finish');
  assert.equal(calls[2].init.body.get('description'), 'Legenda\n\nhttps://example.com');
  assert.equal(calls[2].init.body.get('video_state'), 'PUBLISHED');
  assert.ok(calls.every(call => !call.url.includes('test-secret')));
});

test('Reel: rejeita URL HTTP e credenciais ausentes antes do envio', async () => {
  const service = load('src/services/reels.ts');
  assert.equal((await service.publishReel('Legenda', 'http://example.com/video.mp4')).success, false);
  const unconfigured = load('src/services/reels.ts', { env: { META_PAGE_ACCESS_TOKEN: '' } });
  assert.equal((await unconfigured.publishReel('Legenda', 'https://example.com/video.mp4')).success, false);
});

test('Reel: token nunca é enviado a um host de upload inesperado', async () => {
  let calls = 0;
  const service = load('src/services/reels.ts', { globals: { fetch: async () => { calls++; return ok({ video_id: '999', upload_url: 'https://example.com/steal' }); } } });
  assert.equal((await service.publishReel('Legenda', 'https://cdn.example/video.mp4')).success, false);
  assert.equal(calls, 1);
});

test('Reel: recusa explícita da Meta é erro; resposta final perdida fica em verificação', async () => {
  for (const networkFailure of [false, true]) {
    let count = 0;
    const service = load('src/services/reels.ts', { globals: { fetch: async () => {
      count++;
      if (count === 1) return ok({ video_id: '999', upload_url: 'https://rupload.facebook.com/video-upload/v26.0/999' });
      if (count === 2) return ok({ success: true });
      if (networkFailure) throw new Error('fetch failed');
      return response(400, { error: { code: 190, message: 'secret must not be exposed' } });
    } } });
    const result = await service.publishReel('Legenda', 'https://cdn.example/video.mp4');
    assert.equal(result.success, networkFailure);
    if (networkFailure) assert.equal(result.pending, true);
    else assert.ok(!result.error.includes('secret must not be exposed'));
  }
});

test('Status: vídeo pronto não significa publicado; reconhece confirmação e falha', async () => {
  const fixtures = [
    [{ video_status: 'ready', publishing_phase: { status: 'not_started' } }, 'processing'],
    [{ video_status: 'ready', publishing_phase: { publish_status: 'published' } }, 'success'],
    [{ video_status: 'error' }, 'error'],
    [{ processing_phase: { status: 'error' } }, 'error'],
  ];
  for (const [status, expected] of fixtures) {
    const service = load('src/services/reels.ts', { globals: { fetch: async () => ok({ status }) } });
    assert.equal(await service.getReelStatus('999'), expected);
  }
});

test('Publicação: posts antigos continuam no feed e Reels usam o serviço de vídeo', async () => {
  const calls = [];
  const service = load('src/services/publishDailyPost.ts', { modules: {
    './facebook': { publishToFacebook: (...args) => calls.push(['feed', ...args]) },
    './reels': { publishReel: (...args) => calls.push(['reel', ...args]) },
  } });
  service.publishDailyPost({ message: 'Antigo', imageUrl: 'https://example.com/photo.jpg' });
  service.publishDailyPost({ kind: 'reel', message: 'Vídeo', videoUrl: 'https://example.com/video.mp4' });
  assert.equal(calls[0][0], 'feed'); assert.equal(calls[1][0], 'reel');
  assert.equal(calls[1][2], 'https://example.com/video.mp4');
});

test('Cron: 18h em Lisboa no verão e no inverno; fora da janela não publica', async () => {
  const cases = [
    ['2026-07-06T17:00:00Z', 1], ['2026-07-06T18:00:00Z', 0],
    ['2026-12-07T17:00:00Z', 0], ['2026-12-07T18:00:00Z', 1],
    ['2026-10-25T17:00:00Z', 0], ['2026-10-25T18:00:00Z', 1],
  ];
  for (const [now, expected] of cases) {
    let calls = 0;
    const route = load('src/app/api/cron/daily-reel/route.ts', {
      env: { CRON_SECRET: 'cron-test' },
      globals: { Date: class extends Date { constructor(value) { super(value ?? now); } } },
      modules: {
        'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
        '@/services/autoPublisher': { publishScheduledPost: async kind => { assert.equal(kind, 'reel'); calls++; return { success: true }; } },
      },
    });
    await route.GET({ headers: new Headers({ authorization: 'Bearer cron-test' }) });
    assert.equal(calls, expected, now);
    const unauthorized = await route.GET({ headers: new Headers() });
    assert.equal(unauthorized.status, 401);
  }
});

test('Reserva diária: conflito de chave impede segunda publicação; falha do banco não libera envio', async () => {
  const db = load('src/lib/jsonStore.ts', {
    env: { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-role' },
    globals: { fetch: async () => response(409, {}) },
  });
  assert.equal(await db.claimPublication('reel-daily:2026-10-31'), false);
  const failed = load('src/lib/jsonStore.ts', {
    env: { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-role' },
    globals: { fetch: async () => response(503, {}) },
  });
  await assert.rejects(failed.claimPublication('reel-daily:2026-10-31'));
});

test('Rotação semanal: feed e Reel separados, dia de Lisboa e somente um envio por data', async () => {
  const entries = [];
  let claimed = false, sends = 0;
  const publisher = load('src/services/autoPublisher.ts', {
    globals: { Date: class extends Date { constructor(value) { super(value ?? '2026-07-05T23:30:00Z'); } } },
    modules: {
      '@/lib/postsConfig': { readConfig: async () => ({ schedule: { timezone: 'Europe/Lisbon' }, posts: [
        { id: 'feed-mon', message: 'Feed', days: ['monday'] },
        { id: 'reel-mon', kind: 'reel', message: 'Reel', videoUrl: 'https://example.com/v.mp4', days: ['monday'] },
      ] }) },
      '@/services/publishDailyPost': { publishDailyPost: async post => { sends++; assert.equal(post.id, 'reel-mon'); return { success: true, pending: true, postId: '999' }; } },
      '@/lib/jsonStore': { claimPublication: async () => { if (claimed) return false; claimed = true; return true; } },
      '@/lib/logger': { savePublication: async entry => entries.push(entry) },
      '@/lib/schedulerState': { readState: async () => ({ enabled: true }) },
    },
  });
  assert.equal((await publisher.getNextPost()).id, 'feed-mon');
  assert.equal((await publisher.getNextPost('reel')).id, 'reel-mon');
  const first = await publisher.publishScheduledPost('reel');
  assert.equal(first.pending, true);
  assert.equal(entries[0].status, 'processing');
  assert.equal(entries[0].dayOfWeek, 'monday');
  await publisher.publishScheduledPost('reel');
  assert.equal(sends, 1);
});

test('Cadastro: salva o vídeo no Reel sem conflitar com feed; bloqueia dois Reels no mesmo dia', async () => {
  const config = { schedule: {}, posts: [{ id: 'old-feed', message: 'Feed', days: ['monday'] }] };
  const reelService = load('src/services/reels.ts');
  const route = load('src/app/api/scheduler/posts/route.ts', {
    env: { ADMIN_SECRET: 'admin-test' },
    modules: {
      'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
      '@/lib/postsConfig': { readConfig: async () => structuredClone(config), writeConfig: async next => { config.posts = next.posts; } },
      '@/services/reels': reelService,
    },
  });
  const request = body => ({ headers: new Headers({ authorization: 'Bearer admin-test' }), json: async () => body });
  const first = await route.POST(request({ id: 'video-mon', kind: 'reel', message: 'Legenda', videoUrl: 'https://example.com/v.mp4', days: ['monday'] }));
  assert.equal(first.status, 200);
  assert.equal(config.posts[1].videoUrl, 'https://example.com/v.mp4');
  const conflict = await route.POST(request({ id: 'video-two', kind: 'reel', message: 'Legenda', videoUrl: 'https://example.com/v2.mp4', days: ['monday'] }));
  assert.equal(conflict.status, 400);
  const invalidUpdate = await route.PUT(request({ id: 'video-mon', videoUrl: null }));
  assert.equal(invalidUpdate.status, 400);
});

test('Upload: rota exige chave de administrador e só assina MP4 de até 50 MB', async () => {
  let calls = 0;
  const route = load('src/app/api/scheduler/video-upload/route.ts', {
    env: { ADMIN_SECRET: 'admin-test' },
    globals: { fetch: async () => { calls++; return ok({ url: '/object/upload/sign/marketing-videos/reels/test.mp4?token=temporary' }); } },
    modules: {
      'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
      '@/lib/jsonStore': { supabaseConfig: () => ({ url: 'https://test.supabase.co', key: 'server-secret' }) },
    },
  });
  assert.equal((await route.POST({ headers: new Headers() })).status, 401);
  const request = body => ({ headers: new Headers({ authorization: 'Bearer admin-test' }), json: async () => body });
  assert.equal((await route.POST(request({ type: 'video/mp4', size: 60 * 1024 * 1024 }))).status, 400);
  assert.equal((await route.POST(request({ type: 'text/html', size: 100 }))).status, 400);
  const result = await route.POST(request({ type: 'video/mp4', size: 1000 }));
  assert.equal(result.status, 200); assert.equal(calls, 1);
  assert.ok(result.body.signedUrl.startsWith('https://test.supabase.co/storage/v1/object/upload/sign/'));
  assert.ok(!JSON.stringify(result.body).includes('server-secret'));
});
