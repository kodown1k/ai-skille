---
name: styl-ustroj
description: Use when a report, dispatch („depesza”) or status page about the fleet organism (organizm floty, flota, mcp-hub, thalamos, claude-config, rejestr organów) is to be written as a bespoke HTML artifact for ai-review-panel in the „ustrój” style — light theme „jawa” and dark theme „sen”, with reflowing HTML/CSS infographics. Triggers: "styl ustrój", "depesza o flocie", "raport o organizmie", "jasny i ciemny motyw raportu", "infografiki do raportu ARP", "depesza z ikonografikami". Do NOT use for Markdown artifacts rendered by arp-report-create's dark `.doc` theme, nor for DORA dashboards.
---

# Styl ustrój — depesza o organizmie floty (jawa / sen)

## Po co

Raporty o flocie czyta się na telefonie, wieczorem, często po ciemku — i na monitorze w dzień. Styl „ustrój”
(ustrój = organizm i zarazem porządek) daje **jedną stronę z dwoma motywami**: `jawa` (jasny, kość i atrament)
i `sen` (ciemny, głębina z bioluminescencją). Motyw idzie za systemem (`prefers-color-scheme`), a przycisk w pasku
pozwala przełączyć i zapamiętać wybór (localStorage, w try/catch — piaskownica `/r/:token` bywa bez pamięci).

Pierwszy użyty raport: **754 „Depesza: uzdrowienie organizmu floty — plan, wykonanie, pomiar”** (projekt 8,
`kodowniki/reports`), kopia w [`przyklady/depesza-754-uzdrowienie-organizmu.html`](przyklady/depesza-754-uzdrowienie-organizmu.html).

## Paleta — role, nie kolory

| rola | znaczenie | jawa | sen |
|---|---|---|---|
| `--ground` | tło strony | `#F4EFE6` | `#0B1217` |
| `--surface` | karty, bloki | `#FFFDF8` | `#121C23` |
| `--ink` / `--muted` | tekst / tekst drugorzędny | `#1E2228` / `#5C6670` | `#E8E4DB` / `#93A0AA` |
| `--line` | linie, obramowania | `#D9D2C5` | `#253039` |
| `--tetno` | **dowód**, życie, pozytyw (puls EKG) | `#0E8A6E` | `#3DDBB0` |
| `--gest` | **w ruchu**, czeka na rękę | `#B7791F` | `#F2C14E` |
| `--brak` | **brak dowodu**, ściana, odmowa | `#B42318` | `#FF6B6B` |
| `--bol` | ból, alarm | `#C2410C` | `#FF8A4C` |
| `--nerw` | kanały, szyna, linki | `#2F5D9A` | `#7FB2FF` |

Reguła: kolor niesie **stan pomiaru** (dowód / w ruchu / brak / nie zmierzono = pusty), nigdy ozdobę.
„Nie zmierzono” to zawsze pusta kropka z obrysem `--ink` — zero nie udaje zieleni.

## Typografia

- Narracja: szeryf systemowy (`Iowan Old Style`, Palatino, Georgia) 17 px / 1.6; na telefonie 16 px.
- Etykiety, nagłówki depeszy, liczby, „zapis nasłuchu”: `ui-monospace`, małe, wersaliki z rozstrzelonym światłem.
- Nagłówek odczytu: numer monospace w kolorze `--tetno` nad tytułem szeryfowym.
- Bez fontów z sieci (CSP strony `/r/` i brak zależności).

## Szkielet dokumentu (kolejność obowiązkowa)

1. `.pasek` — „depesza · styl ustrój” + przycisk `#motyw`.
2. `h1` + `.lead` (jedno zdanie: o czym i skąd patrzy nadawca).
3. `dl.depesza` — **Nadawca / Adresat / Dotyczy / Źródła / Stan na** (godzina pomiaru!).
4. Separator `.puls` (linia EKG w `--tetno`) przed każdym odczytem.
5. `section.odczyt` ×N: `.num` („Odczyt 1”), `h2`, `.pod` (kursywa, jedno zdanie), `.kanal` (Nadawca → Odbiorca,
   Kanał, Opóźnienie), treść, infografika, `.zapis` (zapis nasłuchu: liczby, polecenia, godziny), `.lustro`
   (analogia + **gdzie kłamie**), na końcu ostatniego odczytu `.wnosi` („Co stacja z tego wnosi”).
6. Odczyt „Odnośniki” (tabela nr · raport · link) i `.stopka` z godziną pomiaru, nazwą stylu i zasadą nadpisywania.

Zasady treści, odziedziczone po stylu mimoid i raportach 725/731: liczba zawsze z godziną i źródłem pomiaru;
„pomiar rejestru, nie meldunek sesji” pisać wprost; każda analogia ma akapit „kłamie w…”; werdykt o zdrowiu
to tabela kryteriów z dowodem (polecenie + wynik + godzina) albo „nie zmierzono” — nigdy „zrobione”.

## Infografiki — HTML/CSS, nie SVG z tekstem

Na telefonie SVG z `viewBox` 760 skaluje tekst do nieczytelności. Dlatego diagramy są z elementów, które
się **przelewają** (grid/flex), a SVG zostaje tylko tam, gdzie jest kształtem: pierścień werdyktu, puls.

| klasa | do czego | zachowanie na telefonie |
|---|---|---|
| `.diagram.sciany` (`.dnode`, `.dwalls > .dwall`, `.darrow`, `.dout > .dchip`) | przepływ „skąd patrzę”: węzeł → ściany (czerwona kreska przerywana) → okno (`--tetno`) → wyniki | ściany jedna pod drugą |
| `ol.oscz > li.(tetno|brak)` | oś czasu: kropka na linii, godzina mono, opis | pionowa z natury |
| `.tablica > .cell.c-(dowod|ruch|brak|niezmierzone)` | tablica kryteriów (Z1–Z9), kropka + kod + stan + nazwa | 2 kolumny |
| `.diagram.topo` (`.ciala > .cialo > .sesje > .ses`, `.szyna`, `.flow`) | ciała floty, sesje, szyna, przepływ MR | ciała jedno pod drugim |
| `.werdykt` (`svg.ring` + `.wtekst`) | pierścień 9 segmentów (kolor = stan) + werdykt słowny | pierścień nad tekstem |
| `.zapis` | blok pomiarów, lewa listwa `--tetno`, mono | przewijany poziomo |
| `.lustro` | analogia z sekcją „kłamie” | — |

Pierścień: 9 segmentów po `2πr/9`, każdy `stroke-dasharray="seg-4 circ-seg+4"` z przesunięciem `-i*seg`,
klasa `s-tetno|s-gest|s-brak|s-line`; w środku `N/9` i słowo „dowodów”.

## Jak zbudować i wgrać

1. Skopiuj `templates/ustroj.css` do `<style>` i `templates/motyw.js` do `<script>` na końcu `<body>`
   (strona jest **samowystarczalna**: bez zewnętrznych skryptów, fontów i obrazków poza inline SVG).
2. Treść wg szkieletu wyżej; liczby z żywego pomiaru (mapa floty 735, cc-panel, `organy-floty`, `bus_facts`) —
   z godziną. Zdjęcie stanu, które ma zostać nadpisane, oznacz w stopce („nadpisywana pod tym samym kluczem”).
3. Sprawdź oba motywy headless (Playwright, `colorScheme: 'light' | 'dark'`, szerokość 390–420 px) — zero błędów JS,
   przycisk `#motyw` pokazuje „☼ jawa” / „☾ sen”.
4. Wgraj jako bespoke `.html` przez `arp-report-create`:
   `node scripts/cli.mjs --type=artifact --content=/tmp/depesza.html --title="…" --project=8 --target=local --public`
   albo bez CLI: `POST /api/projects/<id>/reports` z `{type:'artifact', key, title, html, public:true}`.
   **Aktualizacja = ten sam `key`** (upsert nadpisuje całość, publiczny link zostaje).
5. Limit publicznego hosta: nginx 1 MB — depesza ze wszystkim mieści się w ~40 KB.

## Czego styl nie robi

- Nie koloruje nastroju: zieleń jest tylko tam, gdzie jest dowód.
- Nie używa `alert`, pobierania ani `window.open` (piaskownica).
- Nie wkleja sekretów ani tokenów w „zapisie nasłuchu” — nazwy, liczby i godziny wystarczą.
- Nie udaje mimoidu: to osobny styl; raporty 725/731/735 zostają w mimoidzie, depesze operacyjne idą w ustroju.
