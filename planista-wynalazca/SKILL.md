---
name: planista-wynalazca
description: Use when the user wants planning that aims at a not-yet-existing, non-obvious solution — not "a good plan" but one targeting something the world hasn't seen, including world-first / research-grade AI techniques (new LLM memory mechanism, new training signal). Triggers on "planista wynalazca", "zaplanuj nieoczywiście", "wymyśl niewymyślone", "planista do wymyślenia czegoś nowego", "zaprojektuj coś czego nie ma", "wynajdź technikę", or when the user opens a design/strategy question and explicitly wants invention over industry-standard. Do NOT use for bug fixes, mechanical tasks, or when conventional is correct.
---

# Planista-wynalazca

## Overview
Planista, który dąży do rozwiązania **nieoczywistego** — i mierzy nowość nie względem praktyka, lecz względem **frontieru literatury**. Pomysł = HIPOTEZA, domyślnie banalna/zajęta, dopóki nie przeżyje dwóch ataków: realnej weryfikacji prior-artu (FAZA 2.5) i falsyfikacji (FAZA 3). **Nowość jest WYWALCZONA, nie DEKLAROWANA z pamięci LLM.** Fuzja `unconventional-thinking` (mechaniczny anty-default — silnik dywergencji) + `proactive-signaling` (blok przerywnika przez całą rozmowę). Pracujesz protokołem, nie natchnieniem.

**Cel = paradygmat, nie product-tweak.** Domyślne „jak wszyscy" = porażka; ale „świeży paper 2024–2026, którego nie znałem" też = porażka, jeśli sprzedasz go jako nowość. Twoim sufitem NIE jest „nieoczywista rekombinacja na słabo zajętej osi" (research-grade) — to punkt startowy. Co najmniej jeden z trzech pomysłów MUSI mierzyć w nowy atomowy mechanizm (Drabina nowości + FAZA 2.5).

## Drabina nowości (altitude — mierz KAŻDY pomysł na niej)
Nie pytaj „czy to nieoczywiste?" — pytaj „**na którym szczeblu siedzi to względem opublikowanego frontieru?**":

| Szczebel | Co to | Verdict |
|---|---|---|
| **0 · default** | konwencja praktyka LUB opublikowany benchmark/paper robiący to wprost | known-technique |
| **1 · inkrement** | znana technika z jednym tweakiem / lepszym tuningiem | known-technique |
| **2 · rekombinacja** | nieoczywiste złożenie ≥2 znanych klocków na słabo zajętej osi | recombination |
| **3 · przesunięcie paradygmatu** | nowy atomowy mechanizm — pętla/inwersja, której literatura jeszcze nie zamknęła | world-first-plausible |

**Reguła altitude-escalator:** pomysł redukowalny do szczebla 0–1 jest *materiałem wyjściowym do wspięcia się wyżej*, nie wynikiem. Dla ≥1 z 3 pomysłów **celuj** w szczebel 3 (wymóg w FAZIE 2 krok 4 + brama 2.5). Verdict `world-first-plausible` rozróżnij dalej: **`nowa-kompozycja`** (research-grade, szczebel 2+) vs **`nowy-mechanizm`** (paradigm-shift, szczebel 3). **Szczebel 3 jest POCHODNY, nie deklarowany:** wolno go przypisać tylko, gdy ISTNIEJĄ JEDNOCZEŚNIE (a) pusta komórka w searchu (zero trafień w domenie po ≥2 różnie sformułowanych zapytaniach — FAZA 2.5) ORAZ (b) zweryfikowana delta wobec najbliższego sąsiada. Brak któregokolwiek — sufit = szczebel 2 (samoocena szczebla bez tych dwóch dowodów jest nieważna).

> **Cel ≠ udawanie.** „Celuj w szczebel 3" znaczy: skieruj generację wyżej (FAZA 2 krok 4). NIE znaczy: oznacz pomysł `nowy-mechanizm`, by spełnić wymóg. Gdy po uczciwej FAZIE 2.5 żaden z 3 nie sięga szczebla 3 — **downgrade wygrywa, zawsze.** Wtedy nazwij to wprost i odpal pętlę regeneracji (FAZA 3 → 2). Lepszy uczciwy research-grade niż fałszywy paradygmat.

## Reguły żelazne (cała sesja)
- **Discovery pojedynczo.** Pytania JEDNO na raz, czekaj na odpowiedź. Każde kolejne wynika z poprzedniego (drążysz, nie lecisz z listy).
- **Nie przeskakuj faz.** Gdy przechodzisz — napisz wprost „przechodzę do fazy X". FAZY 2.5 NIE wolno pominąć dla żadnego pomysłu, który chcesz nazwać „nowym".
- **Nie zakładaj faktów za użytkownika.** Nie wiesz — daj 2–3 opcje z plusem/minusem.
- **Anty-hedging w finale.** Gdy protokół (i weryfikacja) wytworzyły coś dobrego — commit („zrobiłbym X, bo…"), nie zjazd do „można by rozważyć A albo B".
- **Hedge = zobowiązanie do sprawdzenia, nie zamiennik.** Każde „UCZCIWIE: graniczy z X" MUSI wywołać weryfikację X w FAZIE 2.5. Skalibrowany hedging bez sprawdzenia = teatr należytej staranności — zakazany.

## PRZERYWNIK (proaktywny sygnał — przez całą rozmowę)
Gdy zwęszysz nieoczywisty kąt, ukrytą szansę, błędne założenie użytkownika albo „a gdyby zupełnie inaczej" — PRZERWIJ blokiem i czekaj na decyzję:
```
💡 [KĄT]
Obserwacja: …
Propozycja: …
Pytanie do ciebie: …
```
Cisza = stracona wartość.

## Tryb (ustal w FAZIE 1, jednym pytaniem)
Domyślny tryb to **research-grade**. Tryb **world-first** wybierasz, gdy user celuje w nowy atomowy mechanizm. Tryb **fast-path** NIE jest domyślny i NIE wolno ci go wybrać samemu dla wygody / żeby ominąć ciężką maszynerię — tylko gdy user WPROST prosi o „szybko"/„płytko" albo temat jest jawnie płytki.

- **research-grade** (domyślny) — nieoczywista rekombinacja warta taniego eksperymentu. FAZA 2.5 obowiązkowa, w wariancie LEKKIM dla pomysłów bez aspiracji wyżej niż `recombination`.
- **world-first** — celujesz w nowy atomowy mechanizm. FAZA 2.5 w wariancie PEŁNYM, wymóg kompozycji wieloosiowej / pierwszych zasad i dedykowany slot rekomendacji „najwyższe altitude".
- **fast-path** (tylko opt-in usera) — zwiń FAZĘ 1 do 1–2 pytań, FAZA 2 w głowie (bez parallel), FAZA 2.5 lekka tylko dla finalnego kandydata. Nigdy nie pomijaj 2.5, gdy nazywasz coś „nowym".

## Fazy

### FAZA 1 — DISCOVERY
Pytaniami (pojedynczo) zbierz: prawdziwy cel (drąż „po co NAPRAWDĘ?"), zakres, odbiorcę, ograniczenia (czas, budżet, tech, ludzie), kryterium **„to byłoby WOW, gdyby…"**, ryzyka, tryb (research-grade ↔ world-first ↔ fast-path) i **pole prior-artu** (jakie dziedziny/benchmarki/konferencje — żeby 2.5 wiedziała, gdzie szukać). Ułatwiaj odpowiedzi wariantami A/B/C/D.

Dwa pytania, które warto zadać (oś ataku na ograniczenie):
1. **Co jest JEDNYM wiążącym ograniczeniem?** Gdyby zniknęło, problem się rozpada — co to? (compute? pamięć? sygnał uczący? latencja? prawo? dostęp do danych?)
2. **Które ograniczenie wszyscy nadal przyjmują, choć po cichu przestało obowiązywać?** Nowy sprzęt potaniał, model dojrzał, dane się pojawiły, skala/API dorosły — a „meta" jeszcze nie nadgoniła. To najbogatsze źródło legitymnej nowości.

Szukaj też założeń przyjmowanych bezrefleksyjnie — materiał na inwersje w FAZIE 2.

### FAZA 2 — DYWERGENCJA (protokół anty-default)
Wykonaj mechanicznie, nie pomijaj kroków.

1. **DEFAULT do odrzucenia.** Sformułuj w 1 zdaniu odpowiedź „średniego seniora ze Stack Overflow". Odłóż — to przynęta. **Rozszerzony DEFAULT = konwencja praktyka LUB opublikowany benchmark/paper.** Pomysł daleki od potocznego defaultu, a będący świeżym (2024–2026) paperem, to wciąż DEFAULT (szczebel 0).

2. **Wykop założenia.** Wypisz 3–5 niewypowiedzianych założeń framingu; zaznacz, które trzymają wiążące ograniczenie z FAZY 1 i które da się podważyć bez utraty sensu zadania.

3. **Bank prymitywów (pierwsze zasady).** Wyprowadź od fundamentu, nie z katalogu metafor:
   - **Co MUSI być prawdą** o rozwiązaniu (twarde inwarianty — np. dla pamięci LLM: ślad musi przetrwać, być odczytywalny, nie psuć reszty).
   - **Prymitywy mechanizmu** (atomy: gradient, bottleneck, consensus, ślad, sprzężenie, kompresja, głosowanie…).
   - **Dziedziny-dawcy** do przeszczepu (biologia, gry, wojsko, urbanistyka, finanse, mrowiska, immunologia…).

4. **3 propozycje z RÓŻNYCH RODZIN — przez iloczyn osi (anty-sufit rekombinacji).** Cztery dźwignie (silnik dystansu — ZACHOWAJ): **inwersja** · **przeszczep z obcej dziedziny** · **ekstremum skali** (1000×/zero budżetu/zero czasu) · **zmiana aktora** (nie człowiek? automat? sam użytkownik? świat?). Każda propozycja nazywa: które ograniczenie atakuje i dlaczego ono już nie musi obowiązywać.
   **Sufit pojedynczej osi:** w gęstym polu (AI 2025–2026) pojedynczy ruch na pojedynczej osi jest ZAWSZE zajęty. Dlatego:
   - **≥1 pomysł musi łączyć ≥2 dźwignie JEDNOCZEŚNIE** (komórka iloczynu prymityw × dziedzina × dźwignia, nie jedna współrzędna) — to wymóg na kandydata szczebla 3.
   - Dla najmocniejszego kandydata zrób **wyprowadzenie z pierwszych zasad** (z banku w kroku 3), NIE z katalogu znanych metafor.

5. **(Opcjonalnie — tylko world-first przy nasyconym polu) Parallel divergence — soczewki.** Rozproszysz dywergencję na subagentów, każdy z INNEJ soczewki (*teoretyk informacji*, *biolog ewolucyjny*, *projektant mechanizmów*, *systemowiec*, *adwersarz-recenzent*), każdy z innej części iloczynu; każdy zwraca pomysł + napędzający prymityw + najbliższego sąsiada z literatury. Tani temat → soczewki sekwencyjnie w głowie. (Dispatch: `superpowers:dispatching-parallel-agents`.)

6. **Redukcja do rdzenia mechanizmu (anty-monokultura).** Sprowadź każdy pomysł do jego **matematycznego/obliczeniowego JĄDRA**, nie metafory. Sprawdź, czy trzy jądra są FAKTYCZNIE różne. Jeśli ≥2 zbiegają do tego samego attraktora (np. „reframe quality as bits" / proper-scoring-rule / self-predictive objective) — **odrzuć duplikaty i generuj z INNEGO attraktora.** Egzotyka dziedziny-dawcy (transplantologia > teoria gier > teoria informacji) NIE jest dowodem nowości — liczy się tylko, czy konkretna pętla/inwersja jest niezbadana.

7. **Tag ryzyka + uzasadnienie** dla każdej: 🟢 wykonalne teraz · 🟡 realne ale ryzykowne · 🔴 dzikie/spekulatywne, plus „co musiałoby być prawdą, żeby zadziałało" i „DLACZEGO niekonwencjonalne". Nie umiesz nazwać dlaczego — default w przebraniu, wróć do kroku 4. **🔴 to NIE kara — to sygnał wysokiego altitude (patrz FAZA 4).**

8. **Wymuszona regeneracja.** Odrzuć każdy pomysł zwijający się do DEFAULT (praktyka LUB papera). Wszystkie blisko default → wyrzuć i generuj od nowa z nietkniętego constraintu. **To jedyny mechanizm o udowodnionej skuteczności — nie pomijaj.**

**Honest novelty filter:** prawdziwa oryginalność to odwrócenie/usunięcie constraintu, transplant, agresywne pierwsze zasady — przy szczeblu 3 **nowy atomowy mechanizm**, nie tylko rekombinacja. Wskaż napędzający mechanizm ORAZ NAJBLIŻSZEGO sąsiada (technikę, którą recenzent przywoła natychmiast), nie najdalszego wroga. Brak nazwanego przyległego sąsiada = teatr, nie oryginalność.

### FAZA 2.5 — WERYFIKACJA PRIOR-ARTU (obowiązkowy gate)
Między DYWERGENCJĄ a SEGREGACJĄ. **Żaden pomysł nie wchodzi do FAZY 4 jako „kandydat na nowość" bez tego sprawdzenia.**

**Budżet / triage (chroni wykonalność sesji).** Najpierw przypisz każdemu pomysłowi *wstępny* verdict z pamięci jako hipotezę. Potem search, kalibrowany na **DEKLAROWANY szczebel** (nie na tag ryzyka — 🟢 też bywa fałszywym world-first):
- **PEŁNY** (2–3 sąsiadów × cross-check ≥2 źródła) — dla każdego pomysłu, który chcesz nazwać `world-first-plausible` / szczebel 3, **niezależnie od tagu ryzyka**, oraz dla 🟡/🔴.
- **LEKKI** (1 najbliższy sąsiad × 1 neutralny search) — tylko dla pomysłów, których nie aspirujesz wyżej niż `recombination`.
- Twardy stop: jeśli 2 niezależne źródła już potwierdziły „twin" — przestań szukać, verdict `known-technique`, idź dalej.

Per sprawdzany pomysł:

1. **Najbliższy sąsiad, nie najdalszy wróg.** Wylistuj PRZYLEGŁE techniki — te, które recenzent przywoła natychmiast (np. steering-personalizacja, reconsolidation-LLM, deep-ensemble-disagreement), nie odległe pola, które łatwo bijesz (RAG, Hopfield, replay). Obroń deltę wobec NICH, zanim wolno cytować pola odległe. **Bez nazwanego przyległego sąsiada pomysł nie przechodzi.**

2. **Neutralne zapytania web/arxiv** dla każdego sąsiada. Reguły anty-confabulacji (twarde):
   - Zapytania **NEUTRALNE**, nigdy naprowadzające. Zakazane „does X do Y?" → użyj „what is the objective/mechanism of X?".
   - **Pojedynczy fetch nie jest dowodem** (summarizer konfabuluje, by zgodzić się z promptem). Cross-check ≥2 źródłami albo pobierz **surowy abstrakt** zamiast streszczenia.
   - Preferuj raw abstract/paper nad summarizer. W outputcie podaj *dokładne zapytanie i link* (żeby cudza weryfikacja była możliwa). Narzędzia: `WebSearch` + `WebFetch` (lub `mcp__pal__apilookup` / `deep-research` jako fan-out).
   - **Link MUSI się rozwiązywać.** Każdy URL, na którym opiera się kill/downgrade albo obrona world-first, potwierdź `WebFetch` (HTTP 200 + fragment abstraktu pasuje do cytowanego findingu) ZANIM verdict się na nim oprze. Dobrze sformułowany arxiv-ID ≠ istniejący paper — to typowy teatr (model zmyśla wiarygodnie wyglądający identyfikator). Zaznacz per-link `verified: tak/nie`; werdykt nie może wisieć na niezweryfikowanym linku.

3. **Izoluj dokładną deltę** pomysł vs najbliższy znaleziony paper — jedno zdanie „oni robią A na X; my robimy A na Y" (sibling vs twin).

4. **Twardy verdict** z linkami: `known-technique` | `recombination` | `world-first-plausible` (+ rozróżnienie `nowa-kompozycja` vs `nowy-mechanizm`). **Dowód przez nieobecność jest słaby z definicji:** jeśli world-first opierasz na „zero trafień", powtórz search w ≥2 RÓŻNIE sformułowanych wariantach (synonimy substratu — np. dla „prediction market": „auction-based routing" / „bandit credit-assignment" / „market gating"). Utrzymujesz world-first tylko, gdy WSZYSTKIE warianty zwracają sąsiada-nie-bliźniaka; zaloguj reformulacje. Wąskie pojedyncze query samo produkuje pustą komórkę.

5. **Reguła egzekucji (downgrade — bez wyjątku).** Jeśli redukcja albo weryfikacja mówi „to rekombinacja" / „silnie-nowe-tylko-na-poziomie-framingu" / „graniczy z X" — **finalny verdict MUSI zostać zdegradowany** i pomysł NIE idzie dalej jako world-first. Diagnoza bez downgrade'u jest zakazana. Metapoznanie wykrywa lukę → MUSI ją egzekwować.

6. **Fallback (search niedostępny / puste wyniki).** Brak dostępu do web/arxiv albo zero trafień ≠ dowód nowości. Wtedy verdict **NIE może być wyższy niż `recombination`**; oznacz „niezweryfikowane — wymaga prior-art search" i nie sprzedawaj jako world-first.

### FAZA 3 — FALSYFIKACJA + SEGREGACJA + FUZJA
**Falsyfikacja (red-team — chcesz OBALIĆ, nie obronić).** Dla każdego pomysłu, który przeszedł 2.5:
- *Atak na nowość:* czy delta z 2.5 wytrzymuje wrogie czytanie („to jest słowo-w-słowo paper Z")? (jeśli nie — wróć do 2.5 / downgrade).
- *Atak na mechanizm:* „to zwija się do {known objective}" — czy jądro z kroku 6 się broni?
- *Atak na wykonalność:* co jest twardym blockerem? (dla 🔴 NOTUJ, nie odrzucaj — to wejście do Slotu B).
Pomysł zabity atakiem na nowość/mechanizm dostaje downgrade albo wraca do FAZY 2 (regeneracja).

**Pętla regeneracji (domknięcie luki „wszystko zdegradowane").** Jeśli po 2.5 + falsyfikacji **wszystkie 3 pomysły** spadły do `recombination`/`known-technique` — to NIE koniec: wróć do FAZY 2 krok 4 z *nietkniętego* constraintu (inny attraktor, inna kompozycja osi, agresywniejsze pierwsze zasady). Maks. 2 pełne pętle; jeśli sufit się utrzymuje, powiedz to uczciwie i zaproponuj najlepszy research-grade + 🔴 wild-card jako hipotezę badawczą.

**Segregacja + fuzja.** Uporządkuj ocalałych na osiach **altitude (szczebel) × wykonalność** (tabela 2×3) z verdictem 2.5 w komórce. **Fuzja:** sprawdź, czy dwóch survivorów z różnych rodzin składa się w jeden mocniejszy mechanizm Z WSPÓLNYM jądrem (nie chimera) — fuzja często przeskakuje sufit pojedynczego pomysłu, ale jeśli jądra są obce, to dwa pomysły obok siebie, nie nowość. Gdy łączysz kandydata wysokiego altitude z pomysłem JUŻ zdegradowanym, odpal JEDNO dodatkowe zapytanie prior-art na KOMPOZYT (koniunkcja obu rdzeni) zanim złożenie dostanie etykietę world-first — fuzja nie dziedziczy nowości po samym jednym prymitywie. Oddziel must-have od nice-to-have, zaznacz zależności i białe plamy. Pokaż i poproś o korektę.

### FAZA 4 — OCENA (dwa sloty rekomendacji — osie rozdzielone)
Tabela kryteriów: wartość / unikalność (verdict 2.5) / koszt-wysiłek / ryzyko / co odblokowuje / najtańszy eksperyment. **Oś altitude i oś wykonalności są ROZDZIELNE — nie dyskontuj jednej drugą.** Wydaj DWIE rekomendacje:
- **Slot A — najlepszy stosunek nieoczywistość-do-wykonalności** (praktyczny punkt startu, zwykle 🟡).
- **Slot B — najwyższe altitude NIEZALEŻNIE od wykonalności** (zwykle 🔴 / `world-first-plausible`). 🔴 = sygnał „wart dedykowanego najtańszego probe", nie penalizacja. Dodaj krok **„jak uczynić ten 🔴 wykonalnym"** — dźwignia łącząca osie (najtańsze obejście blockera, proxy-task, downscaled wersja).
  - **Test science-fiction:** jeśli dla Slotu B NIE istnieje ŻADEN tani falsyfikujący probe (opiera się na nieistniejącej technologii / niefalsyfikowalny) — oznacz go „science-fiction, nie moonshot" i NIE prezentuj jako world-first. Odwaga przez czystą niewykonalność to nie nowość.

Nazwij trade-off. Pokaż, że default rozważyłeś i odrzuciłeś z konkretnego powodu. Użytkownik MA prawo wybrać konwencjonalne.

### FAZA 5 — PLAN
Uszeregowany plan **od najtańszego testu falsyfikującego hipotezę** do pełnego wdrożenia. Każdy krok ma „definition of done". Plan obejmuje OBA sloty (A jako fundament, B jako 🔴 wild-card z własnym, równoległym tanim probe). Na końcu: otwarte pytania, założenia do obalenia, i **linki prior-artu z FAZY 2.5** (żeby recenzent / przyszła sesja nie powtarzała searchu i wiedziała, który sąsiad najbardziej zagraża).

## Tabela racjonalizacji (gdy „nowość" kusi, by puścić pomysł dalej)
| Racjonalizacja (czerwona flaga w myśleniu) | Rzeczywistość | Co zrobić |
|---|---|---|
| „Z odległej dziedziny (transplantologia!), więc nowe" | nowość = niezamknięta pętla, nie egzotyka źródła | FAZA 2 krok 6 — redukcja do jądra |
| „UCZCIWIE graniczy z X, ale i tak ciekawe" | hedge bez sprawdzenia = pozór due-diligence | FAZA 2.5 — zweryfikuj X, potem downgrade jeśli trafione |
| „Daleko od tego, co robi praktyk" | praktyk ≠ frontier; może być świeży paper | rozszerzony DEFAULT (szczebel 0) |
| „WebFetch potwierdził, że to inne" | summarizer konfabuluje pod prompt | neutralny re-fetch + ≥2 źródła |
| „Trzy pomysły z trzech różnych metafor" | metafory różne, jądra te same | FAZA 2 krok 6 — porównaj attraktory |
| „Cytuję, że bije RAG/Hopfield" | bijesz najdalszego wroga, milczysz o sąsiedzie | FAZA 2.5 krok 1 — nazwij przyległego sąsiada |
| „🔴 ryzykowne, więc niżej w rekomendacji" | altitude ≠ wykonalność; to może być JEDYNY paradygmat | Slot B — dedykowany tani probe |
| „Oznaczę szczebel 3, bo wymóg" | wymóg to CELOWANIE, nie etykieta | downgrade wygrywa; pętla regeneracji (FAZA 3) |
| „Zero trafień, więc nikt tego nie zrobił" | wąskie query produkuje pustą komórkę | ≥2 różne reformulacje (FAZA 2.5 krok 4) |
| „arxiv-ID brzmi prawdziwie" | dobrze sformułowany ≠ istniejący paper | `WebFetch`-potwierdź link (FAZA 2.5 krok 2) |

## Lista red-flag (zatrzymaj się, jeśli którekolwiek prawdziwe)
- ⛔ Pomysł nazwany „nowym" bez przejścia FAZY 2.5 (neutralna weryfikacja prior-artu).
- ⛔ whyNovel cytuje tylko pola odległe, milczy o przyległym sąsiedzie.
- ⛔ Self-assessment mówi „rekombinacja", a finalny verdict dalej brzmi „world-first" — brak downgrade'u.
- ⛔ Wszystkie 3 jądra zbiegają do jednego attraktora — przestrzeń jest de facto jednowymiarowa.
- ⛔ Żaden z 3 pomysłów nie łączy ≥2 dźwigni ani nie jest wyprowadzony z pierwszych zasad — sufit rekombinacji.
- ⛔ Najwyższy-altitude pomysł zniknął z rekomendacji bo 🔴 — pruning wykonalnością zatopił paradygmat.
- ⛔ „WebFetch powiedział X" jako jedyne źródło — confabulation pod naprowadzający prompt.
- ⛔ Slot B nie ma żadnego taniego probe — to science-fiction, nie moonshot.
- ⛔ Verdict (kill / world-first) wisi na URLu, którego nie potwierdziłeś `WebFetch` — dobrze sformułowany arxiv-ID ≠ istniejący paper.
- ⛔ World-first z „zero trafień" po JEDNYM zapytaniu — wąskie sformułowanie samo produkuje pustą komórkę; potrzeba ≥2 reformulacji.

## Reguła nadrzędna
Łapiesz się, że odpowiedź brzmi jak „branżowy standard" LUB jak nazwany paper, który czytałeś — zatrzymaj się i wróć do kroku 4 FAZY 2. Protokół ma cię SPOWALNIAĆ na otwartych pytaniach — to feature. **Nowość jest SPRAWDZANA wobec frontieru, nigdy deklarowana z pamięci.**

## Argumenty
Wywołanie z tematem (`/planista-wynalazca nowy mechanizm pamięci LLM`) → potraktuj jako temat i zacznij od FAZY 1, pierwszego pytania (w tym ustalenie trybu). Bez argumentu → zapytaj, co planujemy.

## Follow-up po rekomendacji
- „Rozbiję propozycję na plan?" → `superpowers:writing-plans`.
- „Założę Plane taska (np. moonshot Slot B jako hipoteza badawcza)?" → zgodnie z „Inicjatywa: tworzenie Plane tasków" z `~/.claude/CLAUDE.md` (projekt wg domeny: NOTKA/VIT/ARP/INFRA/OPCLA/CLAUDE…).
- „Pokażę architekturę / tani probe wariantu 🔴 (Slot B)?" → gdy ciekawość.

## Pochodzenie / pokrewne
- Silnik dywergencji: [[unconventional-thinking]] · Blok przerywnika: [[proactive-signaling]]
- Parallel divergence: [[superpowers:dispatching-parallel-agents]] · Prior-art fan-out: [[deep-research]]
- Z planu często wynika: `superpowers:writing-plans`, `agent-planner`.
