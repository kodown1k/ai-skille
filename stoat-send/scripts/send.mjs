// stoat-send — wysyłka wiadomości na kanał Stoat przez webhook.
// Funkcje czyste eksportowane; main() tylko przy bezpośrednim uruchomieniu.

import { readFileSync as fsReadFileSync } from 'node:fs';

export const MAX_CONTENT = 2000; // verify against Stoat — liczba z Discorda; serwer = źródło prawdy
export const DEFAULT_TIMEOUT_MS = 10_000;

// Token webhooka siedzi w ostatnim segmencie ścieżki /webhooks/<id>/<token>.
// Maskujemy go w dowolnym stringu (URL goły lub osadzony w error/network message).
export function maskWebhookUrl(text) {
  const s = typeof text === 'string' ? text : String(text);
  return s.replace(/(\/webhooks\/[^/\s]+\/)([^/\s?#'"]+)/g, '$1****');
}

export function parseArgs(argv) {
  const args = {
    content: null, file: null, stdin: false,
    username: null, avatar: null, webhookUrl: null, dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--content': args.content = argv[++i] ?? null; break;
      case '--file': args.file = argv[++i] ?? null; break;
      case '--stdin': args.stdin = true; break;
      case '--username': args.username = argv[++i] ?? null; break;
      case '--avatar': args.avatar = argv[++i] ?? null; break;
      case '--webhook-url': args.webhookUrl = argv[++i] ?? null; break;
      case '--dry-run': args.dryRun = true; break;
      default: throw new Error(`Nieznana flaga: ${a}`);
    }
  }
  const sources = [args.content !== null, args.file !== null, args.stdin].filter(Boolean).length;
  if (sources === 0) throw new Error('Podaj dokładnie jedno źródło treści: --content | --file | --stdin');
  if (sources > 1) throw new Error('Podaj tylko jedno źródło treści (--content | --file | --stdin)');
  return args;
}

export function validateContent(content, max = MAX_CONTENT) {
  const trimmed = String(content).trim();
  if (trimmed.length === 0) throw new Error('Treść jest pusta.');
  const codePoints = [...trimmed].length;
  if (codePoints > max) {
    throw new Error(`Treść za długa: ${codePoints} > ${max} znaków. Wyślij link do raportu zamiast całego body.`);
  }
  return trimmed;
}

export function resolveWebhookUrl(args, env) {
  const url = args.webhookUrl ?? env.STOAT_WEBHOOK_URL ?? null;
  if (!url) throw new Error('Brak webhooka: ustaw STOAT_WEBHOOK_URL w ~/.secrets albo podaj --webhook-url.');
  if (!url.startsWith('https://')) {
    throw new Error('Webhook URL musi być https:// (token nie może lecieć plaintext).');
  }
  return url;
}

export function buildBody({ content, username = null, avatar = null }) {
  const body = { content };
  if (username != null || avatar != null) {
    const masquerade = {};
    if (username != null) masquerade.name = username;
    if (avatar != null) masquerade.avatar = avatar;
    body.masquerade = masquerade;
  }
  return body;
}

async function defaultReadStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export async function readContent(args, deps = {}) {
  const readFile = deps.readFileSync ?? fsReadFileSync;
  const isTTY = deps.stdinIsTTY ?? process.stdin.isTTY;
  const readStdin = deps.readStdin ?? defaultReadStdin;

  if (args.content !== null) return args.content;
  if (args.file !== null) return readFile(args.file, 'utf8');
  if (isTTY) throw new Error('--stdin: brak danych na stdin (uruchom z pipe, np. echo ... | send.mjs --stdin).');
  return await readStdin();
}

export async function sendMessage(url, body, deps = {}) {
  const doFetch = deps.fetch ?? fetch;
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await doFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error(maskWebhookUrl(`Błąd sieci/timeout: ${err.message}`));
  } finally {
    clearTimeout(timer);
  }

  if (res.ok) return;

  if (res.status === 403) {
    throw new Error('HTTP 403 — webhook prawdopodobnie bez use_masquerade. Wyślij bez --username/--avatar albo nadaj permission webhookowi.');
  }
  if (res.status === 429) {
    const retry = res.headers.get('retry-after') ?? '?';
    throw new Error(`HTTP 429 — rate-limited, spróbuj za ${retry}s.`);
  }
  const text = await res.text().catch(() => '');
  throw new Error(maskWebhookUrl(`HTTP ${res.status}: ${text}`));
}

export async function main(argv, env, deps = {}) {
  try {
    const args = parseArgs(argv);
    const url = resolveWebhookUrl(args, env);
    const raw = await readContent(args, deps);
    const content = validateContent(raw);
    const body = buildBody({ content, username: args.username, avatar: args.avatar });

    if (args.dryRun) {
      console.log('[dry-run] POST ' + maskWebhookUrl(url));
      console.log('[dry-run] body: ' + JSON.stringify(body));
      return 0;
    }

    await sendMessage(url, body, deps);
    console.log('✅ Wysłano na Stoat.');
    return 0;
  } catch (err) {
    console.error('❌ ' + maskWebhookUrl(err?.message ?? String(err)));
    return 1;
  }
}

// Guard wykonania: main() tylko przy bezpośrednim uruchomieniu (nie przy imporcie w testach).
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const die = (e) => { console.error('❌ ' + maskWebhookUrl(e?.message ?? String(e))); process.exit(1); };
  process.on('uncaughtException', die);
  process.on('unhandledRejection', die);
  main(process.argv.slice(2), process.env).then((code) => process.exit(code));
}
