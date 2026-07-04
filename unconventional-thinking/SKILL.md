---
name: unconventional-thinking
description: Use when user asks open-ended creative or design questions — triggers like "wymyśl", "brainstorm", "co byś zaproponował", "kreatywnie", "wytęż mózg", "wow", "out-of-the-box", "hiper-dokładnie", "super", "nieoczywiste", "czego świat nie widział", or open framings ("jak to ulepszyć?", "design X", "zaprojektuj"). Also activate when you catch your own default answer drifting to "tak jak wszyscy / industry standard". DO NOT activate for bug fixes, type errors, "po prostu zrób X", verify-before-completion — there conventional = correct. Runs a mechanical anti-default-mode protocol to produce 3 proposals from different families with sanity tags.
---

# Protokół „wymyśl coś prawdziwie nieoczywistego"

Default-mode LLM-a = mode collapse do najczęstszej odpowiedzi w training corpusie. Same exhortacje („be creative!") tego nie łamią. Łamie **mechaniczny protokół** wymuszający ścieżki obok defaultu.

## Kiedy aktywować

Trigger to słowa „wymyśl / brainstorm / co byś zaproponował / kreatywnie / wytęż mózg / wow / out-of-the-box / hiper-dokładnie / super / nieoczywiste / czego świat nie widział", lub gdy user opisuje problem otwarcie („jak to ulepszyć?", „design X", „zaprojektuj"), lub gdy sam łapiesz się że twoja domyślna odpowiedź = „tak jak wszyscy / industry standard".

**NIE aktywuj** przy bug-fixach, type errorach, „po prostu zrób X", verify-before-completion — tam konwencjonalne = prawidłowe.

## Anti-defaults (wzorce które ZABIJAJĄ oryginalność — wykryj u siebie i przełam)

- Lead with „industry standard / powszechnie używa się…" bez kwestionowania.
- Hedge stacking („może A, albo B, albo C") zamiast commitmentu.
- Mirroring framing'u usera bez reframe.
- Lista 5 wariantów tego samego pomysłu udających różne propozycje.
- Premature convergence po pierwszej „sensownej" odpowiedzi.
- Reaching for biggest/newest tool (Kubernetes, GraphQL, LLM) gdy mniejszy/starszy/lokalny rozwiązuje to elegancko.

## Protokół mechaniczny (nie pomijaj kroków nawet gdy myślisz że masz odpowiedź)

1. **Default check.** W 1 zdaniu sformułuj odpowiedź jaką dałby „średni senior engineer ze Stack Overflow". Nazwij ją: *konwencjonalna*. **MASZ ją** — odłóż, nie powtarzaj w propozycjach.
2. **Assumption excavation.** Wypisz 3-5 niewypowiedzianych założeń obecnych w problemie/framing'u usera. Zaznacz które da się zakwestionować bez utraty sensu zadania.
3. **Cross-domain transplant.** Wybierz JEDNĄ odległą dziedzinę (biologia, urbanistyka, muzyka, ewolucja, gry, mrowiska, etologia, kuchnia, architektura sakralna, finanse derywaty, speedrunning, archeologia, sieci grzybniowe, kolejnictwo, ornitologia, hodowla pszczół, plemniki, lawiny, sieci elektroenergetyczne, antygenetyka, …). Znajdź jak TAM rozwiązali strukturalnie analogiczny problem. Zaproponuj transplant.
4. **Inversion test.** Co jeśli centralne założenie jest odwrócone? („a co jeśli przeciwieństwo jest prawdą?"). Nie musi wygrać — ujawnia overlooked opcje.
5. **Constraint removal.** Jeden constraint który wszyscy biorą za pewnik w tej klasie problemów — zaproponuj rozwiązanie zakładając że nie istnieje. Często constraint przestał obowiązywać (sprzęt potaniał, model się polepszył, API dorosły, prawo się zmieniło) ale meta tego jeszcze nie nadgoniła. To bogate źródło legitymie nieoczywistych rozwiązań.
6. **Scale shift.** Wyobraź sobie problem przy 1000× większej skali ALBO 1000× mniejszej. Często rozwiązania optymalne na innej skali są nieoczywiste na obecnej, ale przenośne.
7. **Trzy propozycje z RÓŻNYCH RODZIN.** Nie warianty tego samego pomysłu — różne mechanizmy działania. Co najmniej jedna oznaczona `[wild-card]` (impractical-but-instructive — pokazuje granicę przestrzeni rozwiązań nawet jeśli nie ship'ujemy).
8. **Sanity tag dla każdej:** `[stabilne]` / `[eksperyment]` / `[wild-card]` + JEDNO ZDANIE: *„DLACZEGO ta propozycja jest niekonwencjonalna"*. Jeśli nie umiesz odpowiedzieć — wróć do kroku 3, ta propozycja jest konwencjonalna w przebraniu.
9. **Rekomendacja z uzasadnieniem.** Wybierz jedną. Wyjaśnij dlaczego NIE konwencjonalną — albo, jeśli po przejściu protokołu konwencjonalna naprawdę wygrywa, powiedz to wprost (po pokazaniu alternatyw). User MA prawo wybrać safe.

## Honest novelty filter (anti-bullshit)

Prawdziwa oryginalność rzadko = „nikt nigdy o tym nie pomyślał". Częściej =

- **nieoczywista rekombinacja** znanych elementów (X z dziedziny A + Y z dziedziny B),
- **transplant wzorca** z odległej dziedziny (mrowisko → load balancing, fala oceaniczna → backpressure, mycelium → service mesh),
- **odwrócenie milcząco akceptowanego założenia** („dane idą do modelu" → „model idzie do danych"),
- **usunięcie constraintu który już nie obowiązuje** („zakładamy że RAM jest drogi" w 2026 = nieaktualne dla 90% use case'ów),
- **agresywne pierwsze-zasady** na problemie który stał się „tym jak się robi" przez inercję.

Jeśli nie umiesz wskazać KTÓRY z tych mechanizmów napędza twoją propozycję — to nie jest oryginalność, to teatr. Wróć do kroku 3.

## Output framing

- Jasno oznaczaj poziom ryzyka, nowości i tech-debt każdej propozycji. User MA prawo wybrać konwencjonalne — twoje zadanie to udostępnić wybór, nie wcisnąć „wow" wbrew sensowi.
- Ale jeśli protokół wytworzył coś naprawdę dobrego — **commit**, nie schodź do hedgingu w finałowym zdaniu. „Zrobiłbym X, bo…" beats „można by rozważyć X albo Y".
- Pokaż user'owi że konwencjonalną ROZWAŻYŁEŚ i ODRZUCIŁEŚ z konkretnego powodu — to buduje zaufanie do propozycji nie-konwencjonalnej.

## Triggery do follow-up'u po proposition

- „chcesz że rozbiję propozycję X na konkretny plan?" (gdy propozycja przyjęta → przejście do `superpowers:writing-plans`).
- „mam utworzyć Plane taska?" (per zasada „Inicjatywa: tworzenie Plane tasków" w `~/.claude/CLAUDE.md`).
- „chcesz zobaczyć jak by wyglądała architektura w propozycji [wild-card]?" (gdy user pokazał ciekawość, otwórz drugi krok).

## Kontrproof

Ten protokół ma cię SPOWALNIAĆ na otwartych pytaniach. To feature, nie bug. Jeśli odpowiedź potrzebna na YES/NO bug — pomiń protokół. Jeśli na „jak zaprojektować X" — przejdź protokół ZAWSZE, nawet gdy myślisz że pierwsza odpowiedź była dobra (zwykle nie była).
