import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maskWebhookUrl, MAX_CONTENT, DEFAULT_TIMEOUT_MS } from './send.mjs';

test('maskWebhookUrl maskuje token w gołym URL', () => {
  const url = 'https://stoat.chat/api/webhooks/01ABC/SuperSecretToken123';
  assert.equal(maskWebhookUrl(url), 'https://stoat.chat/api/webhooks/01ABC/****');
});

test('maskWebhookUrl maskuje token wewnątrz dłuższego stringa (error body)', () => {
  const msg = 'Błąd sieci: request to https://stoat.chat/api/webhooks/01ABC/Tok_en-9 failed';
  assert.equal(
    maskWebhookUrl(msg),
    'Błąd sieci: request to https://stoat.chat/api/webhooks/01ABC/**** failed',
  );
});

test('maskWebhookUrl bez webhooka zwraca tekst bez zmian', () => {
  assert.equal(maskWebhookUrl('zwykły komunikat 404'), 'zwykły komunikat 404');
});

test('MAX_CONTENT to 2000', () => {
  assert.equal(MAX_CONTENT, 2000);
});

test('DEFAULT_TIMEOUT_MS to 10000', () => {
  assert.equal(DEFAULT_TIMEOUT_MS, 10_000);
});

import { parseArgs } from './send.mjs';

test('parseArgs czyta content + flagi masquerade + dry-run', () => {
  const a = parseArgs(['--content', 'cześć', '--username', 'ARP bot', '--avatar', 'https://x/y.png', '--dry-run']);
  assert.equal(a.content, 'cześć');
  assert.equal(a.username, 'ARP bot');
  assert.equal(a.avatar, 'https://x/y.png');
  assert.equal(a.dryRun, true);
  assert.equal(a.stdin, false);
});

test('parseArgs ustawia stdin flag', () => {
  const a = parseArgs(['--stdin']);
  assert.equal(a.stdin, true);
  assert.equal(a.content, null);
});

test('parseArgs traktuje pusty --content jako źródło (nie null)', () => {
  const a = parseArgs(['--content', '']);
  assert.equal(a.content, '');
});

test('parseArgs rzuca gdy 0 źródeł treści', () => {
  assert.throws(() => parseArgs(['--username', 'x']), /jedno źródło treści/);
});

test('parseArgs rzuca gdy >1 źródło treści', () => {
  assert.throws(() => parseArgs(['--content', 'a', '--stdin']), /tylko jedno źródło/);
});

test('parseArgs rzuca przy nieznanej fladze', () => {
  assert.throws(() => parseArgs(['--content', 'a', '--wat']), /Nieznana flaga/);
});

import { validateContent } from './send.mjs';

test('validateContent zwraca przyciętą treść', () => {
  assert.equal(validateContent('  hej  '), 'hej');
});

test('validateContent rzuca przy pustej treści', () => {
  assert.throws(() => validateContent('   '), /pusta/);
});

test('validateContent rzuca powyżej limitu (max param)', () => {
  assert.throws(() => validateContent('aaaa', 3), /za długa/);
});

test('validateContent liczy po code points (emoji = 1)', () => {
  // 2 emoji = 2 code points, więc max=2 przechodzi, max=1 nie
  assert.equal(validateContent('😀😀', 2), '😀😀');
  assert.throws(() => validateContent('😀😀', 1), /za długa/);
});

import { resolveWebhookUrl } from './send.mjs';

const baseArgs = { webhookUrl: null };

test('resolveWebhookUrl bierze z env', () => {
  const url = resolveWebhookUrl(baseArgs, { STOAT_WEBHOOK_URL: 'https://stoat.chat/api/webhooks/1/t' });
  assert.equal(url, 'https://stoat.chat/api/webhooks/1/t');
});

test('resolveWebhookUrl --webhook-url ma priorytet nad env', () => {
  const url = resolveWebhookUrl(
    { webhookUrl: 'https://override/api/webhooks/2/t' },
    { STOAT_WEBHOOK_URL: 'https://stoat.chat/api/webhooks/1/t' },
  );
  assert.equal(url, 'https://override/api/webhooks/2/t');
});

test('resolveWebhookUrl rzuca gdy brak źródła', () => {
  assert.throws(() => resolveWebhookUrl(baseArgs, {}), /Brak webhooka/);
});

test('resolveWebhookUrl rzuca gdy nie https', () => {
  assert.throws(
    () => resolveWebhookUrl({ webhookUrl: 'http://x/api/webhooks/1/t' }, {}),
    /https/,
  );
});

import { buildBody } from './send.mjs';

test('buildBody sam content — bez masquerade', () => {
  assert.deepEqual(buildBody({ content: 'hej' }), { content: 'hej' });
});

test('buildBody z username → masquerade.name', () => {
  assert.deepEqual(
    buildBody({ content: 'hej', username: 'ARP bot' }),
    { content: 'hej', masquerade: { name: 'ARP bot' } },
  );
});

test('buildBody z avatar → masquerade.avatar', () => {
  assert.deepEqual(
    buildBody({ content: 'hej', avatar: 'https://x/y.png' }),
    { content: 'hej', masquerade: { avatar: 'https://x/y.png' } },
  );
});

test('buildBody z oboma → masquerade.name + avatar', () => {
  assert.deepEqual(
    buildBody({ content: 'hej', username: 'ARP bot', avatar: 'https://x/y.png' }),
    { content: 'hej', masquerade: { name: 'ARP bot', avatar: 'https://x/y.png' } },
  );
});

test('buildBody z pustym username ("") → masquerade.name = ""', () => {
  assert.deepEqual(
    buildBody({ content: 'x', username: '' }),
    { content: 'x', masquerade: { name: '' } },
  );
});

test('buildBody NIE ma top-level username/avatar', () => {
  const body = buildBody({ content: 'hej', username: 'ARP bot' });
  assert.equal('username' in body, false);
  assert.equal('avatar' in body, false);
});

import { readContent } from './send.mjs';

test('readContent zwraca --content wprost', async () => {
  const out = await readContent({ content: 'inline', file: null, stdin: false });
  assert.equal(out, 'inline');
});

test('readContent czyta --file przez wstrzyknięty readFileSync', async () => {
  const out = await readContent(
    { content: null, file: '/tmp/x.md', stdin: false },
    { readFileSync: (p, enc) => { assert.equal(p, '/tmp/x.md'); assert.equal(enc, 'utf8'); return 'z pliku'; } },
  );
  assert.equal(out, 'z pliku');
});

test('readContent propaguje błąd I/O z --file', async () => {
  await assert.rejects(
    readContent(
      { content: null, file: '/nope', stdin: false },
      { readFileSync: () => { throw new Error('ENOENT'); } },
    ),
    /ENOENT/,
  );
});

test('readContent rzuca gdy --stdin przy TTY', async () => {
  await assert.rejects(
    readContent({ content: null, file: null, stdin: true }, { stdinIsTTY: true }),
    /brak danych na stdin/,
  );
});

test('readContent czyta --stdin przez wstrzyknięty readStdin', async () => {
  const out = await readContent(
    { content: null, file: null, stdin: true },
    { stdinIsTTY: false, readStdin: async () => 'z pipe' },
  );
  assert.equal(out, 'z pipe');
});

import { sendMessage } from './send.mjs';

function fakeRes({ ok = true, status = 200, text = '', headers = {} } = {}) {
  return {
    ok, status,
    text: async () => text,
    headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  };
}

test('sendMessage POST-uje JSON i kończy przy 2xx', async () => {
  let seen;
  const fetch = async (url, opts) => { seen = { url, opts }; return fakeRes({ ok: true, status: 200 }); };
  await sendMessage('https://h/api/webhooks/1/t', { content: 'hej' }, { fetch });
  assert.equal(seen.url, 'https://h/api/webhooks/1/t');
  assert.equal(seen.opts.method, 'POST');
  assert.equal(seen.opts.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(seen.opts.body), { content: 'hej' });
  assert.ok(seen.opts.signal instanceof AbortSignal);
});

test('sendMessage 403 → komunikat o use_masquerade', async () => {
  const fetch = async () => fakeRes({ ok: false, status: 403, text: 'forbidden' });
  await assert.rejects(sendMessage('https://h/api/webhooks/1/t', {}, { fetch }), /use_masquerade/);
});

test('sendMessage 429 → komunikat z Retry-After', async () => {
  const fetch = async () => fakeRes({ ok: false, status: 429, headers: { 'retry-after': '7' } });
  await assert.rejects(sendMessage('https://h/api/webhooks/1/t', {}, { fetch }), /429.*7/);
});

test('sendMessage non-2xx maskuje token w body błędu', async () => {
  const leak = 'not found: https://h/api/webhooks/1/SECRETTOKEN';
  const fetch = async () => fakeRes({ ok: false, status: 404, text: leak });
  await assert.rejects(sendMessage('https://h/api/webhooks/1/SECRETTOKEN', {}, { fetch }), (err) => {
    assert.match(err.message, /HTTP 404/);
    assert.doesNotMatch(err.message, /SECRETTOKEN/);
    assert.match(err.message, /\*\*\*\*/);
    return true;
  });
});

test('sendMessage błąd sieci jest zmaskowany', async () => {
  const fetch = async () => { throw new Error('connect fail https://h/api/webhooks/1/SECRETTOKEN'); };
  await assert.rejects(sendMessage('https://h/api/webhooks/1/SECRETTOKEN', {}, { fetch }), (err) => {
    assert.doesNotMatch(err.message, /SECRETTOKEN/);
    return true;
  });
});

import { main } from './send.mjs';

function captureLogs() {
  const out = [], err = [];
  const origLog = console.log, origErr = console.error;
  console.log = (...a) => out.push(a.join(' '));
  console.error = (...a) => err.push(a.join(' '));
  return { out, err, restore: () => { console.log = origLog; console.error = origErr; } };
}

test('main dry-run maskuje URL i nie wysyła', async () => {
  const cap = captureLogs();
  try {
    let fetched = false;
    const code = await main(
      ['--content', 'hej', '--dry-run'],
      { STOAT_WEBHOOK_URL: 'https://h/api/webhooks/1/SECRETTOKEN' },
      { fetch: async () => { fetched = true; return { ok: true }; } },
    );
    assert.equal(code, 0);
    assert.equal(fetched, false);
    const joined = cap.out.join('\n');
    assert.match(joined, /\*\*\*\*/);
    assert.doesNotMatch(joined, /SECRETTOKEN/);
  } finally {
    cap.restore();
  }
});

test('main wysyła i zwraca 0 przy 2xx', async () => {
  const cap = captureLogs();
  try {
    const code = await main(
      ['--content', 'hej'],
      { STOAT_WEBHOOK_URL: 'https://h/api/webhooks/1/t' },
      { fetch: async () => ({ ok: true, status: 200 }) },
    );
    assert.equal(code, 0);
  } finally {
    cap.restore();
  }
});

test('main zwraca 1 i maskuje błąd przy braku secretu', async () => {
  const cap = captureLogs();
  try {
    const code = await main(['--content', 'hej'], {}, {});
    assert.equal(code, 1);
    assert.match(cap.err.join('\n'), /Brak webhooka/);
  } finally {
    cap.restore();
  }
});

test('main maskuje token w błędzie HTTP', async () => {
  const cap = captureLogs();
  try {
    const code = await main(
      ['--content', 'hej'],
      { STOAT_WEBHOOK_URL: 'https://h/api/webhooks/1/SECRETTOKEN' },
      { fetch: async () => ({ ok: false, status: 404, text: async () => 'x https://h/api/webhooks/1/SECRETTOKEN', headers: { get: () => null } }) },
    );
    assert.equal(code, 1);
    assert.doesNotMatch(cap.err.join('\n'), /SECRETTOKEN/);
  } finally {
    cap.restore();
  }
});
