# QA Report & Recommendations — אקדמיית הלמידה

**Scope:** the whole app: home and navigation, 3 learning modules (השלם את המילה, חשבון, עברית) and 9 games (זיכרון, אוגר, דינו, פירות, נחש, לבנים, מגדל, ארבע בשורה, מבוך).
**Build tested:** branch `claude/learning-games-app-ab4cg8` (commit after "העכבר במבוך").
**Audience assumed:** children in grades א׳–ד׳ (ages 6–10), mostly on phones.

---

## 1. How this was tested

| Method | What it covered |
|---|---|
| Code review | Every screen, hook and game-logic file (≈7,200 lines), looking for bugs, edge cases and UX gaps |
| Device sweep (Playwright/Chromium) | 22 screens × 6 devices (132 page loads): 360×640 Android, iPhone SE, Pixel 5, phone landscape 740×360, iPad Mini, desktop 1280×800. Checked horizontal overflow, whether play needs scrolling, tap-target size, JS/console errors, and took a screenshot of every screen |
| Targeted stress tests | Longest word (9 letters), largest math exercise, Hebrew levels 1–50 content vs. screen height, browser back button, deep links, invalid and locked routes |
| Accessibility scan | axe-core (WCAG 2 A/AA + best practice) on 10 key screens |
| Content audit | Emoji support levels across all source files, gendered Hebrew copy across all screens, word-bank length statistics |
| Existing test suite | 200 unit tests across 12 files; typecheck, lint and build all clean |

### What already works well ✅
- **No JavaScript errors** on any of the 132 page loads.
- **No horizontal overflow** anywhere except the one bug in השלם את המילה (C1).
- **Routing is robust.** Locked levels redirect to level select, invalid levels (`/learning/math/99`) redirect, unknown URLs go home, deep links work, and `vercel.json` rewrites are in place.
- **Game logic is well covered.** Every game's rules are pure, unit-tested modules; the AI levels are shown to be ordered by strength, and mazes are proven solvable.
- **Storage failures are handled.** Records and progress survive private mode and storage errors without crashing.
- **Visual consistency is strong.** All games share the same difficulty picker, result card, button styles and record badge.

---

## 2. Severity scale

| Level | Meaning |
|---|---|
| 🔴 **Critical** | Broken for many users in a core flow; fix before sharing the app |
| 🟠 **High** | Significant problem for the target audience or a core flow; fix soon |
| 🟡 **Medium** | Noticeable quality or consistency issue; plan it |
| 🟢 **Low** | Polish, nice-to-have, or edge case |

Effort: **S** = under an hour, **M** = a few hours, **L** = a day or more.

---

## 3. Summary of all findings

| ID | Area | Finding | Severity | Effort |
|---|---|---|---|---|
| C1 | השלם את המילה | Words of 6+ letters overflow the screen; letters are cut off and the page scrolls sideways | 🔴 Critical | S |
| H1 | השלם את המילה | Letter buttons are only 32×32 px (should be ≥48 px for kids) | 🟠 High | S |
| H2 | נחש, מבוך | On small phones the arrow pad is partly below the screen during play | 🟠 High | M |
| H3 | All 9 games | Landscape orientation: every game board needs scrolling, so it's unplayable | 🟠 High | M |
| H4 | עברית | From level 25–35 on, the answers (and later the question) are below the fold | 🟠 High | M |
| H5 | Platform | Not installable (no PWA manifest, icons, offline); must run inside a browser tab | 🟠 High | M |
| H6 | Platform | Not deployed yet, so the phone can't reach it | 🟠 High | S |
| H7 | Whole app | No sound at all: no audio feedback, no read-aloud for pre-readers | 🟠 High | M–L |
| H8 | עברית (content) | Stories for grades א׳–ב׳ have no nikud | 🟠 High | L |
| M1 | Navigation | Phone back button skips the level picker and silently discards the game | 🟡 Medium | M |
| M2 | Copy | Mixed masculine-singular and plural address ("שחק שוב" vs "געו") | 🟡 Medium | S |
| M3 | Real-time games | No pause, and the game keeps running when the app goes to the background | 🟡 Medium | M |
| M4 | Emoji | 8 very new emoji (plus 24 fairly new ones) show as empty boxes on older phones | 🟡 Medium | M |
| M5 | Stability | No error boundary: any crash shows a blank white screen | 🟡 Medium | S |
| M6 | Performance | One 564 kB JS bundle (173 kB gzip) loads every module up front | 🟡 Medium | S |
| M7 | רוץ דינו רוץ | The only game without difficulty levels | 🟡 Medium | M |
| M8 | שוברים לבנים | The last 2–3 bricks are frustratingly slow to hit | 🟡 Medium | S |
| M9 | בונים מגדל | You can't lose while the block is at full width, so early game has no tension | 🟡 Medium | S |
| M10 | Games menu | Long text list with abstract icons, hard for pre-readers to scan | 🟡 Medium | M |
| M11 | Accessibility | Completed-level tiles fail contrast (2.47:1); several grey texts are low-contrast | 🟡 Medium | S |
| M12 | Level select | "Reset progress" uses the browser's `confirm()`, which some in-app browsers block | 🟡 Medium | S |
| M13 | חשבון | Wrong answers are easy to eliminate, and some exercises are trivial (×1, ÷1, +0) | 🟡 Medium | M |
| L1 | Whole app | Back button (40 px) and secondary buttons (36 px tall) are under the 44 px minimum | 🟢 Low | S |
| L2 | השלם את המילה | The ׳ in ג׳ירפה, ג׳ודו, ג׳ויסטיק, צ׳יפס gets its own letter tile | 🟢 Low | S |
| L3 | נחש | Start text overlaps the snake; checkerboard shows odd diagonal artifacts | 🟢 Low | S |
| L4 | מבוך | Hint button label "(+5 שניות)" is cut off on iPhone SE | 🟢 Low | S |
| L5 | Home | No `<main>` landmark; needs a small scroll on iPhone SE | 🟢 Low | S |
| L6 | Accessibility | ✓/✗ feedback isn't announced to screen readers | 🟢 Low | S |
| L7 | Accessibility | `prefers-reduced-motion` is ignored | 🟢 Low | S |
| L8 | זיכרון | A third tap during the 0.9 s mismatch pause is ignored, which feels unresponsive | 🟢 Low | S |
| L9 | Navigation | No "home" shortcut inside games (2–3 back taps to get home) | 🟢 Low | S |
| L10 | עברית | Levels 1–10 have only 2 answer options (50% guess rate) | 🟢 Low | M |
| L11 | Data | Progress and records are per browser only; siblings share one profile | 🟢 Low | L |
| L12 | ארבע בשורה | The hard AI blocks the main thread (≈57 ms on desktop, more on cheap phones) | 🟢 Low | M |
| L13 | Desktop | Inconsistent keyboard support (quizzes have no keyboard answers) | 🟢 Low | S |

**Totals:** 1 Critical · 8 High · 13 Medium · 13 Low.

### Issues by module

| Module | 🔴 | 🟠 | 🟡 | 🟢 | Notes |
|---|---|---|---|---|---|
| Shell / navigation / platform | – | H5, H6, H7 | M1, M5, M6, M10, M12 | L1, L5, L9, L11 | Structural items that affect everything |
| השלם את המילה | **C1** | H1 | M4 | L2 | Needs the most work |
| חשבון | – | – | M11, M13 | L13 | Solid |
| עברית | – | H4, H8 | – | L10 | Content and layout for later levels |
| זיכרון | – | H3 | – | L8 | Solid |
| תפסו את האוגר | – | H3 | M3 | – | Solid |
| רוץ דינו רוץ | – | H3 | M3, M7 | – | Needs difficulty levels |
| חותכים פירות | – | H3 | M3 | – | Solid |
| הנחש הרעב | – | H2, H3 | M3 | L3 | Fit on small phones |
| שוברים לבנים | – | H3 | M3, M8 | – | Endgame pacing |
| בונים מגדל | – | H3 | M3, M9 | – | Early-game tension |
| ארבע בשורה | – | H3 | – | L12 | Solid |
| העכבר במבוך | – | H2, H3 | – | L4 | Fit on small phones |

---

## 4. Findings in detail

### 🔴 C1 — השלם את המילה: long words overflow the screen
**What happens.** Each letter tile has a fixed width of 56 px plus an 8 px gap, so a word needs `n×56 + (n−1)×8` px:

| Letters | Words in bank | Row width | Overflows on |
|---|---|---|---|
| 5 | 100 | 312 px | – |
| 6 | 57 | 376 px | 360 px phones |
| 7 | 29 | 440 px | every phone |
| 8 | 10 | 504 px | every phone |
| 9 | 2 (סקייטבורד, אסטרונאוט) | 568 px | every phone, some tablets in split view |

That's **98 of 513 words (19%)** overflowing a 360 px phone, and 41 words (8%) overflowing every phone. With 10 words per round:
- about **88%** of rounds on a 360 px phone include at least one overflowing word;
- about **57%** of rounds on any phone include a 7+ letter word.

In the stress test (9-letter word, 360×640), the page became 464 px wide, the letters were clipped on both sides, and the whole layout shifted sideways ([screenshot](qa-evidence/c1-long-word-overflow.png)).

**Why it matters.** It's the first learning module, and the letters, including the blank the child has to fill, can be off-screen.

**Fix.** Size the tiles from the available width instead of fixed pixels:
- give the word row `w-full`, and set each tile to `flex: 1 1 0; max-width: 56px; min-width: 0`;
- scale the font with container units (`container-type: inline-size` on the row, `font-size: min(2.25rem, 11cqw)`);
- add a unit or visual test that renders the longest word at 320 px.

### 🟠 H1 — השלם את המילה: letter buttons are 32×32 px
**What happens.** The letter grid (`grid-cols-5 w-full`) sits inside an `items-center` flex column whose parent has no width. The grid therefore shrinks to the width of the word above it. With a 2–3 letter word (אף, דג) each letter button is **32×32 px**. With a long word the buttons grow, so button size also jumps between rounds.

**Why it matters.** Children ages 6–7 need targets of at least 48 px. At 32 px there are frequent mis-taps on the wrong letter, which the game scores as a wrong answer.

**Fix.** Give the round container `w-full max-w-md`, so the grid is always about 60–65 px per letter on a phone.

### 🟠 H2 — הנחש הרעב and העכבר במבוך: arrow pad below the screen on small phones
**What happens.** The page is 692 px tall on a 360×640 phone and 652 px on an iPhone SE (568 px visible), so the "down" arrow is cut off. The board uses `touch-action: none`, so the child has to find an empty area to scroll, in the middle of a real-time game.

**Fix.**
- Cap the board by height: `width: min(100%, calc(100dvh - <header + HUD + pad>))`.
- Tighten the HUD and header on short screens.
- Or lay the pad out horizontally (◀ ▲ ▼ ▶ in one row) below 700 px of height.

### 🟠 H3 — All games: landscape is unplayable
**What happens.** Every game board sizes itself from the width (`aspect-square w-full` or a fixed aspect ratio). On a phone held sideways (740×360) every game needs 500–800 px of height; the sweep flagged all 9 games. Children rotate phones constantly.

**Fix (pick one or both).**
- Constrain boards by height as in H2, so they fit in both orientations.
- Show a friendly "סובבו את הטלפון 🔄" overlay in landscape on phones.
- Once the app is a PWA (H5), set `"orientation": "portrait"` in the manifest.

### 🟠 H4 — עברית: the question and answers drift below the fold
**What happens.** The story card stays above the question (by design), but it grows with the level:

| Level | 360×640: bottom of answers | Pixel 5: bottom of answers |
|---|---|---|
| 1–20 | 487–617 px ✓ | 487–588 px ✓ |
| 25–30 | 676 px ✗ | 646 px ✓ |
| 35 | 834 px ✗ | 806 px ✗ |
| 45 | 952 px ✗ (question itself at 632) | 952 px ✗ |
| 50 | 1099 px ✗ (question at 779 — fully off-screen) | 1040 px ✗ (question at 720) |

After each answer the next question again appears below the story, and nothing tells the child there is more below.

**Fix (recommended).** Show the story, then a "לשאלות ⬇️" button. During questions, collapse the story into a "📖 הסיפור" toggle, or pin the question panel to the bottom (sticky) with the story scrolling above it. At minimum, `scrollIntoView` the question after each answer.

### 🟠 H5 — Not installable, no offline mode
**What happens.** There's no web manifest, no app icons (apple-touch-icon, maskable), no `theme-color` and no service worker. Opened on a phone, it's a regular browser tab: the address bar takes about 15% of the screen, a child can tap into the URL bar or other tabs, and nothing works without a connection.

**Fix.** Add `vite-plugin-pwa`: manifest (name, short_name "אקדמיה", `display: standalone`, `orientation: portrait`, RTL `dir`/`lang`), 192/512/maskable icons, and a precache of the build. Then "Add to Home Screen" gives an app-like, full-screen, offline experience.

### 🟠 H6 — Not deployed
The stated goal is using the app on a phone, but there is no hosting yet. Deploying (Vercel import of this branch; `vercel.json` already handles SPA routes) unblocks real-device testing of everything in this report.

### 🟠 H7 — No sound, no read-aloud
**What happens.** The app is completely silent, and every instruction is text: the difficulty pickers use 2–3 line paragraphs, and the quiz feedback is visual only. First-graders are early readers, and audio feedback is a major part of how children this age experience games.

**Recommendations, in order of value.**
1. **Short sound effects** (correct, wrong, win, pop/hit), with a global 🔇 toggle stored in localStorage. Use small `.mp3` files or WebAudio tones.
2. **🔊 Read-aloud** using `speechSynthesis` (he-IL voice) for:
   - picker instructions;
   - the word in השלם את המילה, spoken after the answer so it reinforces reading;
   - stories and questions in עברית.
3. Say the result ("כל הכבוד!") on result screens.

### 🟠 H8 — עברית: stories without nikud for grades א׳–ב׳
Israeli first-graders learn to read with nikud (ניקוד), and unvocalized text is typically introduced gradually in grade ב׳ onward. All 50 stories are unvocalized, so the early tiers are effectively above level for the stated audience.

**Recommendation.** Add nikud to tiers 1–2 (levels 1–20) at least, and optionally a "ניקוד" on/off toggle. This is a content task; the rendering already supports it.

### 🟡 M1 — Phone back button exits the game and loses it
In every game the difficulty is React state, not part of the URL. The in-app ← goes back to the picker, but the Android back gesture or the browser back button leaves the game entirely (measured: memory board → `/games`), with no confirmation and the game lost. Learning levels are fine because their level is in the URL.

**Fix.** Put the difficulty in the route (`/games/snake/easy`) so both back actions behave the same. Optionally confirm leaving an active real-time game.

### 🟡 M2 — Inconsistent, masculine-only address
About 17 files address the child in masculine singular: "שחק שוב", "נסה שוב", "גע כדי להתחיל", "ענית", "אספת", "שברת", "בנית", "יצאת", "חתכת", "אכלת", "תפסת", "נתקעת". Others use plural: "געו", "החליקו", "לחצו", "גררו", "נסו שוב". The same result screen even says "נסו שוב!" next to a "נסה שוב" button.

For girls, masculine address is less inclusive, and the mix reads as unpolished.

**Fix.** Standardize on plural or gender-neutral forms ("משחקים שוב", "נסו שוב", "עניתם", "אספתם"), or add a one-time "מי משחק/ת?" profile choice and gender the copy.

### 🟡 M3 — Real-time games have no pause
There is no pause button in any real-time game, and no `visibilitychange` handling anywhere:
- **תפסו את האוגר** ends its round by wall clock, so switching apps for 30 s ends the round.
- **הנחש הרעב** uses `setTimeout`, which keeps ticking (throttled) in the background, so the snake can crash while the app is hidden.
- Games driven by `requestAnimationFrame` (פירות, לבנים, מגדל, דינו) stop while hidden, but resume instantly on return, without a "ready?" beat.

**Fix.** Pause on `document.hidden`, add a ⏸ button, and resume behind a short 3-2-1 countdown.

### 🟡 M4 — Emoji that older phones can't show
- **Emoji 15 (2022):** 🫏 חמור, 🫛, 🪈, 🩷, 🪿, 🪼.
- **Emoji 14:** 🫘, 🛞.
- **Emoji 13 (24 more):** e.g. 🪨 (also used as the runner's rock), 🫐, 🫒, 🪴, 🪜.

On phones a few years old these render as empty boxes. In השלם את המילה the picture is the **only clue**, so the round becomes unanswerable.

**Fix (pick one).**
- Bundle an emoji image set (Twemoji or Noto SVG), which also gives a consistent look on every phone.
- Detect support at startup (render to a canvas and measure) and drop unsupported words from the bank.

### 🟡 M5 — No error boundary
Any unexpected exception unmounts the whole tree, leaving a blank white screen with no way back. Add a route-level `ErrorBoundary` showing "אופס! משהו השתבש" with a "חזרה לתפריט" button.

### 🟡 M6 — Single large bundle
All 12 modules, plus the 513-word bank and 50 stories, ship as one 564 kB file (173 kB gzip), which is slow to start on low-end phones and weak networks. Use route-level `React.lazy` / `import()`, which Vite splits automatically. A PWA precache (H5) also makes this a one-time cost.

### 🟡 M7 — רוץ דינו רוץ has no difficulty levels
It's the only game with a single mode: the same start speed, acceleration and gaps for grades א׳ and ד׳. Add קל / בינוני / קשה (start speed, max speed, obstacle spacing), using the shared `DifficultyPicker`, and keep records per level.

### 🟡 M8 — שוברים לבנים: slow endgame
With 2–3 bricks left, hitting them depends on precise angles. A paddle-following bot went 60 s without clearing a 24-brick stage. For a 6-year-old this becomes frustrating.

**Fix.** When 3 or fewer bricks remain, gently speed up the ball or add a slight homing nudge toward the nearest brick. Alternatively, drop a "multi-ball" bonus.

### 🟡 M9 — בונים מגדל: no risk at full width
The slide range (±8 units past the edges) never fully clears a full-width tower, so a miss is impossible until the tower has narrowed. That's good for easy, but medium and hard lose tension in the opening.

**Fix.** Widen the slide range on medium and hard, e.g. let the block travel fully off the tower.

### 🟡 M10 — Games menu hard to scan for pre-readers
Nine full-width cards (about 1,170 px, 3–4 screens of scrolling) with abstract line icons. The ארבע בשורה grid and the שוברים לבנים wall icon look nearly identical.

**Fix.** Use a 2-column grid of large picture tiles (the game's own emoji or art: 🐍, 🧱, 🐭🧀, 🔴🟡) with a short name. Optionally group them: "מהירות" / "חשיבה".

### 🟡 M11 — Color contrast
- axe-core: completed-level tiles use white on `emerald-500`, at **2.47:1** (41 elements on the math level select). WCAG needs 3:1 for large text and 4.5:1 for normal text.
- `text-slate-400` on the reset button, and several `text-slate-500` hint lines, are borderline.

**Fix.** Use `emerald-600/700` for tiles and `slate-600` for hints.

### 🟡 M12 — Reset uses `window.confirm`
Native dialogs show English "OK/Cancel" on some devices, look out of place, and are blocked in some in-app browsers (WhatsApp, Facebook), where the reset silently does nothing. Replace with the app's own modal.

### 🟡 M13 — חשבון: weak distractors and trivial exercises
- Wrong options are random values within ±25% of the answer, so they're often guessable (e.g. in ×, a non-multiple of the factors; in +, a wrong last digit).
- Generators allow `×1`, `÷1` and `+0`.

**Fix.**
- Build distractors from common mistakes: off-by-one, ±10, swapped operation (a+b for a×b), a neighbouring multiple.
- Avoid ×1, ÷1 and +0 except at the lowest levels.

*(The 10/10 pass rule is a deliberate product decision and is kept. If children get stuck, consider showing partial-progress stars while still requiring 10/10 to unlock.)*

### 🟢 Low-priority items
- **L1** — The header back button is 40×40 px. "ערבוב מחדש", "החלפת רמה" and "איפוס התקדמות" are 36 px tall. Raise them to at least 44–48 px.
- **L2** — `word.split('')` puts the geresh (׳) in its own tile in 4 words, so ג׳ looks like two letters. Group a letter with a following ׳ into one tile.
- **L3** — Snake: the "החליקו או לחצו…" start text overlaps the snake and the apple. The 45° gradient checkerboard renders small diagonal artifacts (use `conic-gradient` or an SVG pattern).
- **L4** — Maze: the hint button's "(+5 שניות)" is clipped on iPhone SE. Shorten it to "+5 ש׳" or put the penalty in a tooltip.
- **L5** — Home: add `<main>` (axe landmark rule), and trim vertical spacing so it fits on an iPhone SE without scrolling.
- **L6** — FeedbackOverlay: add `role="status"` / `aria-live` text ("נכון!" / "לא נכון").
- **L7** — Honor `prefers-reduced-motion`: framer-motion's `MotionConfig reducedMotion="user"` handles most of it in one line.
- **L8** — Memory: on a third tap during the mismatch pause, flip the pair back immediately and turn the new card, instead of ignoring the tap.
- **L9** — Add a 🏠 button in the header of game and level screens.
- **L10** — עברית levels 1–10 have 2 options, so guessing passes a 2-question level 25% of the time. Consider 3 options from level 1.
- **L11** — Progress and records live in one browser. Consider simple child profiles (name + avatar) so siblings don't share, plus an export/backup.
- **L12** — The hard AI in ארבע בשורה runs a depth-5 search on the main thread (≈57 ms on desktop, likely 200–400 ms on budget phones). Move it to a Web Worker, or cap its time.
- **L13** — Desktop: add number keys 1–4 / letter keys for quiz answers, and visible focus rings for keyboard play.

---

## 5. Recommended roadmap

**Sprint 1: must-fix before sharing (≈1 day)**
1. C1 (long words) and H1 (letter button size), both in the same component.
2. H2 and H3 (fit the boards to the screen height; landscape overlay).
3. H4 (Hebrew question visibility).
4. M2 (plural or neutral copy), a quick text pass.
5. M5 (error boundary) and M11 (contrast): minutes each.

**Sprint 2: make it a real phone app (≈1–2 days)**
1. H6 deploy, then H5 PWA (manifest, icons, offline, portrait lock).
2. M1 (difficulty in the URL, consistent back button).
3. M6 (code splitting).
4. M3 (pause and background handling).

**Sprint 3: better for 6–10 year-olds (≈3–5 days)**
1. H7 (sounds + read-aloud with a mute toggle).
2. H8 (nikud for Hebrew tiers 1–2).
3. M4 (bundled emoji images).
4. M10 (picture-grid games menu).
5. M7 (runner difficulty levels).

**Sprint 4: polish**
M8, M9, M12, M13 and the Low items.

---

## 6. Evidence

Screenshots from this QA run are in [`qa-evidence/`](qa-evidence/):

| Screenshot | What it shows |
|---|---|
| [c1-long-word-overflow.png](qa-evidence/c1-long-word-overflow.png) | C1: 9-letter word overflowing a 360 px phone; the layout shifts sideways |
| [h1-small-letter-buttons.png](qa-evidence/h1-small-letter-buttons.png) | H1: 32 px letter buttons under a 2-letter word |
| [h2-snake-pad-cut-off.png](qa-evidence/h2-snake-pad-cut-off.png) | H2: snake "down" arrow below the fold (360×640) |
| [h2-maze-pad-cut-off-iphone-se.png](qa-evidence/h2-maze-pad-cut-off-iphone-se.png) | H2 / L4: maze pad and hint label cut off (iPhone SE) |
| [h3-landscape-bricks.png](qa-evidence/h3-landscape-bricks.png), [h3-landscape-snake.png](qa-evidence/h3-landscape-snake.png) | H3: boards overflowing a landscape phone |
| [h4-hebrew-level-50.png](qa-evidence/h4-hebrew-level-50.png) | H4: level 50, question and answers off-screen |
| [m10-games-menu.png](qa-evidence/m10-games-menu.png) | M10: long list of text cards with abstract icons |
