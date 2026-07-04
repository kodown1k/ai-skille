---
name: proactive-signaling
description: Use when you notice during work — a repeatable procedure (skill candidate), context that should off-load to a subagent, a manual step that could be hooked/scripted/MCP-ified, missing tooling, or a surprising pattern worth saving in CLAUDE.md. Interrupts current flow with a single structured proposal block (`💡 [TYPE] Observation / Proposal / Question`) and waits for user decision. Activate cross-project — silence equals lost value.
---

# Proaktywne sygnalizowanie wartościowych obserwacji

## Zasada główna

Gdy w trakcie pracy zauważysz coś wartościowego — **przerwij flow i zgłoś od razu**, jednym konkretnym pytaniem lub propozycją. Lepsze świeże spostrzeżenie teraz niż zapomniane na końcu sesji. Milczenie = strata wartości.

## Co kwalifikuje się jako "wartościowe"

**Priorytet wysoki — zgłaszaj zawsze:**
- **Pomysł na Skill** — powtarzalna procedura, którą właśnie wykonujesz/wykonałeś (3+ kroków, deterministyczna, wraca w różnych projektach)
- **Pomysł na agenta/subagenta** — wyspecjalizowana rola, która odciąży główny kontekst (review, research, refactor, testing)
- **Automatyzacja IT/AI** — zadanie, które aktualnie robimy ręcznie, a da się je zskryptować, scachować, zhookować lub przepiąć na pipeline
- **Wzorzec tooling/MCP** — luka w obecnym setupie (brakujący MCP server, hook, slash command, alias)

**Priorytet niższy — zgłaszaj tylko gdy mocno wartościowe:**
- Plane task (bug/TODO wykryty mimochodem, niezwiązany z bieżącym celem)
- Update do CLAUDE.md (nowa konwencja, gotcha, ścieżka)

## Triggery (kiedy "wpada do głowy")

Aktywuj sygnał, gdy:
1. Robisz tę samą sekwencję czynności **drugi raz** w sesji → kandydat na Skill
2. Zauważasz, że trzymasz w kontekście dużo specjalistycznej wiedzy jednorazowej → kandydat na subagenta
3. Wykonujesz krok, który dałoby się zhookować (post-commit, pre-edit, on-save) → automatyzacja
4. Brakuje Ci narzędzia/danych, których nie masz pod ręką → kandydat na MCP/skrypt
5. Widzisz wzorzec "user zawsze prosi o X po Y" → kandydat na slash command lub alias
6. Coś w bieżącym repo zaskakuje cię na tyle, że warto to zapamiętać → CLAUDE.md

## Format zgłoszenia

Przerwij flow **krótkim blokiem** w tej strukturze:

```
💡 [TYP: Skill | Agent | Automation | MCP | CLAUDE.md | Plane]
Obserwacja: <1 zdanie — co zauważyłem>
Propozycja: <1 zdanie — co konkretnie zrobić>
Pytanie: <jedno pytanie zamknięte: tak/nie/odłożyć>
```

Po pytaniu **czekaj na odpowiedź** — nie kontynuuj pierwotnego zadania, dopóki user nie zdecyduje (chyba że odpowie "kontynuuj, zapisz na potem").

## Reguły higieny

- **Jedno pytanie naraz.** Nigdy nie łącz dwóch obserwacji w jeden blok.
- **Maks. 1 sygnał na ~10 minut pracy** — jeśli pojawia się więcej, zapisz pozostałe do `/tmp/ideas.md` i wróć na końcu sesji.
- **Nie zgłaszaj banałów** — jeśli nie umiesz w jednym zdaniu uzasadnić wartości, pomiń.
- **Nie powtarzaj** — jeśli user już raz odrzucił podobny pomysł w tej sesji, nie wracaj do niego.
- **Konkret > ogólnik** — "Skill do generowania changeloga z git log" zamiast "może warto coś zautomatyzować".
- **Akcja > opis** — propozycja musi mieć jasny pierwszy krok, nie "warto by się zastanowić".

## Przykłady dobrego zgłoszenia

```
💡 [Skill]
Obserwacja: Drugi raz w tej sesji parsuję output `kubectl get pods` i filtruję po statusie.
Propozycja: Skill `k8s-pod-triage` — input: namespace; output: tabela problematycznych podów + sugerowane akcje.
Pytanie: Tworzymy teraz, czy zapisać do backlogu?
```

```
💡 [Agent]
Obserwacja: Trzymam w głównym kontekście pełną dokumentację Plane API tylko po to, żeby co kilka turów wywołać jeden endpoint.
Propozycja: Subagent `plane-ops` z wąskim system promptem i dostępem tylko do MCP Plane.
Pytanie: Uruchomić go teraz dla tego zadania?
```

```
💡 [Automation]
Obserwacja: Po każdym `git commit` ręcznie aktualizujesz CHANGELOG.md.
Propozycja: Hook `PostToolUse` na Bash z patternem `git commit*` → wywołanie skilla changelog.
Pytanie: Dodać hook do `.claude/settings.json`?
```

## Anty-przykłady (nie rób tak)

- ❌ "Może warto by zrobić jakiś skill do tego?" (za ogólne, brak akcji)
- ❌ Trzy obserwacje w jednym bloku (bombardowanie)
- ❌ "Zauważyłem, że X. Idę dalej z zadaniem." (brak pytania = milczenie)
- ❌ Sygnał o czymś, co user już odrzucił 5 minut temu

## Powiązany workflow: Plane tasks

Gdy obserwacja jest typu "future enhancement / workaround → native feature / bug-z-mitygacją" — zamiast `💡 [CLAUDE.md]` rozważ stworzenie Plane taska (patrz sekcja "Inicjatywa: tworzenie Plane tasków" w `~/.claude/CLAUDE.md`). Notki w CLAUDE.md się kurzą, taski mają lifecycle.
