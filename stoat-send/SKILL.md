---
name: stoat-send
description: Use when the user wants to send a message, note, link, or arp-report-create report link to their Stoat chat channel ("wyślij na Stoata", "wrzuć na kanał", "podeślij link na Stoat"). Sends text/markdown via webhook.
---

# stoat-send

Wysyła wiadomość (tekst/markdown) na kanał Stoat przez webhook. Send-only, jeden kanał.

## Wymagania

- `STOAT_WEBHOOK_URL` w `~/.secrets` (pełny URL webhooka, token w ścieżce — sekret).
- Node ≥18 (global `fetch`).

## Jak wysłać

ZAWSZE ładuj sekret gotchą zsh, potem wołaj skrypt:

```bash
set -a; source ~/.secrets; set +a
node ~/.claude/skills/stoat-send/scripts/send.mjs --content "treść markdown"
```

Inne źródła treści (dokładnie jedno):

```bash
node ~/.claude/skills/stoat-send/scripts/send.mjs --file /tmp/msg.md
echo "treść" | node ~/.claude/skills/stoat-send/scripts/send.mjs --stdin
```

Opcje:

- `--username "ARP bot"` / `--avatar <url>` — masquerade (nazwa/awatar nadawcy).
  Wymaga uprawnienia `use_masquerade` na webhooku; bez niego API zwróci 403.
- `--webhook-url <url>` — override domyślnego celu z env.
- `--dry-run` — pokaż zmaskowany request, nie wysyłaj.

## Zasady

- **Limit treści ~2000 znaków** (do potwierdzenia po stronie Stoata). Dłuższe raporty:
  wysyłaj **link** (`publicUrl` ze `/arp-report-create`), nie całe body.
- Token nigdy nie jest logowany — skrypt maskuje go we wszystkich komunikatach.
- Brak retry — gdy padnie, uruchom ponownie.

## Testy

```bash
node --test ~/.claude/skills/stoat-send/scripts/send.test.mjs
```
