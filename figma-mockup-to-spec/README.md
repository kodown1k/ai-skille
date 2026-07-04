# figma-mockup-to-spec — instalacja

Personal skill do Claude Code: makieta Figma (lub screenshot UI) → numerowana nakładka na obrazie → klikalny wywiad per-komponent → plik spec → delegacja planowania/implementacji do skilli superpowers.

## Instalacja

Rozpakuj do katalogu skilli Claude Code:

```bash
mkdir -p ~/.claude/skills
tar xzf figma-mockup-to-spec.tar.gz -C ~/.claude/skills/
```

Struktura po rozpakowaniu:

```
~/.claude/skills/figma-mockup-to-spec/
├── SKILL.md            # logika skilla (auto-wykrywany przez Claude Code)
├── README.md           # ten plik
└── scripts/annotate.py # generator numerowanej nakładki
```

Skille są **auto-wykrywane** — w nowej sesji Claude Code skill jest dostępny od razu, bez rejestracji. Odpala się sam, gdy wkleisz link `figma.com/design/...?node-id=...` z intencją „zrób z tej makiety spec".

## Zależności

| Zależność | Po co | Wymagana? |
|---|---|---|
| **Figma MCP** (serwer claude.ai Figma podłączony w Claude Code) | render makiety (`get_screenshot`, `get_metadata`) | **TAK** — twarda zależność |
| **Python 3 + Pillow** | `scripts/annotate.py` rysuje numerki na obrazie | TAK do nakładki (`pip install pillow`) |
| **google-chrome / xdg-open + `$DISPLAY`** | otwarcie nakładki w przeglądarce podczas wywiadu | NIE — bez GUI skill poda tylko ścieżkę pliku |
| **superpowers** (`writing-plans`, `subagent-driven-development`, `executing-plans`) | checkpointy 6–7 (delegacja planu/implementacji) | NIE — fazy spec/nakładka działają bez nich |

Sprawdzenie Pillow:

```bash
python3 -c "import PIL; print('Pillow', PIL.__version__)" || pip install pillow
```

## Uwaga

Skill to **cienki orkiestrator** — woła zewnętrzne narzędzia, nie duplikuje ich. Najwęższe gardło to Figma MCP (jedyna twarda zależność); reszta degraduje się łagodnie. Ścieżki w SKILL.md używają `~`, więc działają u każdego użytkownika bez edycji.
