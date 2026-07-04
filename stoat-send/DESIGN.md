# stoat-send — Design Spec

**Data:** 2026-06-20
**Status:** Zatwierdzony (do implementacji)
**Autor:** perun + Claude

## 1. Cel

Umożliwić wysyłanie wiadomości na kanał Stoat (https://stoat.chat) z poziomu sesji
Claude Code. MVP = jeden solidny prymityw wysyłki: tekst/markdown (inline, z pliku,
albo z stdin) na domyślny kanał, z opcjonalnym custom username/avatar. Linki i raporty
ze `/arp-report-create` to po prostu treść wiadomości — żadnej specjalnej obsługi w MVP.

Tie-in ze `/arp-report-create` (auto-format raportu, auto-post) świadomie odłożony —
dorobimy gdy ustalimy format wiadomości. YAGNI.

## 2. Zakres

- ✅ Skill `stoat-send` (`~/.claude/skills/stoat-send/`) + skrypt CLI
- ✅ Wysyłka przez **webhook** (send-only, jeden kanał, secret w `~/.secrets`)
- ✅ Tryby wejścia: `--content`, `--file`, `--stdin`
- ✅ Masquerade: `--username`, `--avatar`
- ✅ `--dry-run` (zmaskowany token), `--webhook-url` override
- ✅ Walidacja: brak secretu, pusta treść, >MAX_CONTENT znaków, non-https, stdin-TTY, błędy I/O
- ✅ Lekkie testy `node:test` na funkcje czyste (bez sieci)
- ❌ Auto-chunking długich wiadomości (dla raportów wysyłamy LINK, nie body)
- ❌ Wiele nazwanych kanałów
- ❌ Bot account / odczyt wiadomości / interakcje
- ❌ Auto-post po wygenerowaniu raportu w `/arp-report-create`

## 3. Architektura

Osobny **personal skill** poza repo ai-review-panel (to narzędzie osobiste):

```
~/.claude/skills/stoat-send/
├── DESIGN.md            # ten plik
├── SKILL.md             # kiedy/jak Claude używa skilla (triggery, flagi, gotcha .secrets)
└── scripts/
    ├── send.mjs         # Node 20 ESM, zero-dependency (global fetch)
    └── send.test.mjs    # node:test na funkcje czyste
```

Wzorowany na układzie `~/.claude/skills/arp-report-create/` (SKILL.md + scripts/cli.mjs).

## 4. Auth / secret

Jednorazowo (admin serwera): channel settings → Webhooks → Create → kopiuj pełny URL.
Zapis w `~/.secrets` (chmod 600, nigdy nie commitowany):

```
export STOAT_WEBHOOK_URL="https://stoat.chat/api/webhooks/<id>/<token>"
```

Cały URL jest sekretem (token w ścieżce). Skrypt **nigdy** nie loguje surowego URL-a.
Status na 2026-06-20: dodany przez usera, weryfikacja masked OK, scheme https.

## 5. Interfejs CLI

```
node scripts/send.mjs --content "tekst markdown"     # inline
node scripts/send.mjs --file /tmp/msg.md             # treść z pliku
echo "tekst" | node scripts/send.mjs --stdin         # pipe / heredoc
   [--username "ARP bot"]      # → masquerade.name (NIE top-level username)
   [--avatar <url>]            # → masquerade.avatar (URL do obrazka)
   [--webhook-url <url>]       # override domyślnego celu (inaczej z env)
   [--dry-run]                 # wypisz zmaskowany request, NIE wysyłaj
```

Dokładnie jedno źródło treści (`--content` | `--file` | `--stdin`) musi być podane —
inaczej błąd walidacji. `--stdin` gdy `process.stdin.isTTY` (brak pipe'u) → natychmiast
błąd „brak danych na stdin", NIE blokuj na EOF.

`--username`/`--avatar` mapują się na zagnieżdżony obiekt `masquerade` (patrz §7), a nie
na pola top-level. Render masquerade wymaga uprawnienia `use_masquerade` na webhooku —
admin musi je nadać przy tworzeniu; brak → 403 (obsługa: czytelny komunikat).

Wywołanie z poziomu CC zawsze przez gotchę zsh:
```bash
set -a; source ~/.secrets; set +a
node ~/.claude/skills/stoat-send/scripts/send.mjs --content "..."
```

## 6. Przepływ danych

```
sesja CC → skill → source ~/.secrets → node send.mjs
  → walidacja (treść, długość, https)
  → POST <webhook-url>  body: { content, masquerade?: { name?, avatar? } }
  → Stoat publikuje na kanale
```

POST jest one-shot — **bez retry** (analogicznie do clientów ARP; retry to rola
wyższej warstwy / ręczny rerun). 10s timeout przez `AbortController`.

## 7. Kontrakt HTTP (webhook Stoat/Revolt)

Stoat to kontynuacja Revolta — body w schemacie `DataMessageSend`, **NIE** Discordowym.

- Metoda: `POST <STOAT_WEBHOOK_URL>`
- Nagłówki: `Content-Type: application/json` (body UTF-8)
- Body:
  ```json
  { "content": "<tekst>", "masquerade": { "name": "<opcjonalnie>", "avatar": "<opcjonalnie url>" } }
  ```
  - **Brak top-level `username`/`avatar`** — zostałyby zignorowane. Override nazwy/awatara
    idzie wyłącznie przez zagnieżdżony `masquerade` (`name`, `avatar`-jako-URL, opcjonalnie `colour`).
  - `masquerade` budowane TYLKO gdy podano `--username` i/lub `--avatar`; inaczej pominięte
    w body (wiadomość pójdzie pod nazwą/awatarem webhooka skonfigurowanym przy tworzeniu).
  - Render masquerade wymaga permission `use_masquerade` na webhooku → bez niego 403.
- Sukces: sprawdzaj `res.ok` (200 z obiektem `Message` albo 204) — **nie parsuj body**.

> Zweryfikowane w źródłach Revolt (`revolt_api` Masquerade, revolt.js API.Masquerade).
> **Smoke-send 2026-06-20:** zwykła wiadomość ✅ dostarczona; masquerade (`--username "ARP bot"`)
> ✅ dostarczona bez 403 → webhook **MA uprawnienie `use_masquerade`**. Dokładny limit treści
> nie był probowany empirycznie (żeby nie spamować kanału) — `MAX_CONTENT=2000` zostaje jako
> udokumentowany default Revolta; źródłem prawdy pozostaje serwer.

## 8. Obsługa błędów

| Sytuacja | Zachowanie |
|---|---|
| Brak `STOAT_WEBHOOK_URL` i brak `--webhook-url` | Komunikat + exit 1 |
| URL nie zaczyna się od `https://` | Odmowa (token nie wycieknie plaintext) + exit 1 |
| Treść pusta po trim | Błąd walidacji + exit 1 |
| Treść > `MAX_CONTENT` znaków (code points) | Błąd + podpowiedź "wyślij link do raportu zamiast body" + exit 1 |
| >1 albo 0 źródeł treści | Błąd walidacji + exit 1 |
| `--stdin` przy TTY (brak pipe'u) | Błąd "brak danych na stdin" + exit 1 (NIE blokuj na EOF) |
| `--file` nie istnieje / nieczytelny | Błąd I/O + exit 1 |
| HTTP 429 (rate-limit) | Komunikat "rate-limited, spróbuj za Ns" (z `Retry-After`) + exit 1 |
| HTTP 403 (brak `use_masquerade`) | Komunikat "webhook bez use_masquerade — wyślij bez --username/--avatar lub nadaj permission" + exit 1 |
| HTTP non-2xx (inne) | Wypisz status + **zmaskowane** response body (przez `maskWebhookUrl`), exit 1 |
| Timeout / network | **Zmaskowany** komunikat (fetch wrzuca URL w message) + exit 1 (bez retry) |

**Limit treści:** `const MAX_CONTENT = 2000` z komentarzem „verify against Stoat" — walidacja
client-side to UX, źródłem prawdy jest serwer. Liczenie po **code points** (`[...str].length`),
nie UTF-16 units, żeby emoji/znaki PL nie rozjechały licznika.

## 9. Bezpieczeństwo

- Token wyłącznie w `~/.secrets`; skrypt nie echo-uje surowego URL-a.
- **`maskWebhookUrl` na KAŻDEJ ścieżce printu, nie tylko `--dry-run`.** Token siedzi w
  ścieżce URL-a, więc może wyciec przez: (a) response body przy non-2xx (404/401 echo URL),
  (b) komunikat błędu sieci/timeout z `fetch` (zawiera URL), (c) uncaught stack trace.
  Każdy z tych printów MUSI przejść przez `maskWebhookUrl` (regex `/webhooks/<id>/<token>`
  → `/webhooks/<id>/****`). `main()` w try/catch maskujący przed wypisaniem; guard na
  `uncaughtException`/`unhandledRejection`.
- `--dry-run` maskuje token: `https://stoat.chat/api/webhooks/<id>/****`.
- Guard non-https (patrz §8).
- (opcjonalnie) `--avatar` walidowane że to `http(s)://` URL — szybszy feedback.
- Brak logowania treści wrażliwych poza tym co user sam wysyła.

## 10. Testy

`scripts/send.test.mjs` (`node --test`), tylko funkcje czyste, **bez sieci**:

- `parseArgs` — poprawne flagi, wykrycie >1/0 źródeł treści
- `validateContent` — pusta / >MAX_CONTENT (licz po code points, test na emoji/PL) / OK
- `maskWebhookUrl` — token w ścieżce → `****` (też wewnątrz dłuższego stringa, np. error body)
- `resolveWebhookUrl` — env vs `--webhook-url` vs brak (błąd), guard non-https
- `buildBody` — `{ content, masquerade?: { name?, avatar? } }`; masquerade obecne TYLKO gdy
  podano name/avatar; brak top-level username/avatar; bez undefined keys

Plus jednorazowy realny smoke send ("hello from CC") — ręcznie, nie w teście.

Struktura `send.mjs`: funkcje czyste eksportowane + cienki `main()` wywoływany tylko gdy
uruchomiony bezpośrednio (`import.meta.url === ...`), żeby test mógł importować bez side-effectów.

## 11. SKILL.md — triggery (skrót)

Use gdy user chce: wysłać wiadomość/notkę/link/raport na swój kanał Stoat
("wyślij na Stoata", "wrzuć na kanał", "podeślij link na Stoat").
SKILL.md dokumentuje: flagi, wymóg `STOAT_WEBHOOK_URL`, gotchę `set -a; source ~/.secrets`,
limit treści (`MAX_CONTENT`, dłuższe raporty → wysyłamy publicUrl ze `/arp-report-create`),
oraz że `--username`/`--avatar` (masquerade) wymagają `use_masquerade` na webhooku.

## 12. Setup jednorazowy (user)

1. ✅ Webhook utworzony w Stoat, URL skopiowany
2. ✅ `STOAT_WEBHOOK_URL` w `~/.secrets`
3. ✅ Webhook MA `use_masquerade` — `--username`/`--avatar` działają (zweryfikowane smoke 2026-06-20)
4. ✅ Smoke send wykonany 2026-06-20 — zwykła + masquerade obie dostarczone (exit 0). Limit treści
   nie probowany empirycznie; `MAX_CONTENT=2000` jako default (patrz §7).
