# CSC500 deck authoring spec

Every week deck is a single `.html` file in `slides/`, named `week-NN.html`.
It links the shared assets — **never** inline CSS or JS, and **never** copy
styles into the file. One stylesheet (`assets/csc500.css`) controls all 16 decks.

---

## 1. Required file skeleton

Copy this exactly. Only the marked spots change per week.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CSC500 — Week N: TOPIC</title>

  <link rel="stylesheet" href="assets/reveal/reset.css">
  <link rel="stylesheet" href="assets/reveal/reveal.css">
  <link rel="stylesheet" href="assets/hljs-github-dark.css">
  <link rel="stylesheet" href="assets/csc500.css">
</head>
<body>

<div class="reveal">
  <div class="slides">

    <!-- ============ SLIDES GO HERE ============ -->

  </div>
</div>

<div class="deck-footer">
  <strong>CSC500</strong><span class="sep">|</span>Week N — TOPIC
</div>

<!-- ============ MODAL TEMPLATES GO HERE (see §5) ============ -->

<script src="assets/reveal/reveal.js"></script>
<script src="assets/reveal/plugin/highlight/highlight.js"></script>
<script src="assets/reveal/plugin/notes/notes.js"></script>
<script src="assets/reveal/plugin/zoom/zoom.js"></script>
<script src="assets/reveal/plugin/search/search.js"></script>
<script src="assets/csc500.js"></script>
<script>CSC500.boot();</script>
</body>
</html>
```

---

## 2. Deck structure (fixed order)

1. **Title slide** (`.title-slide`)
2. **Learning objectives** — one slide, or two if there are more than 9 objectives
3. **Roadmap** — the Parts of the week as a numbered list
4. The body, organised into **6–12 sections**:
   - a **part divider** slide (`.part-divider`) opening each section
   - the content slides for that section

   The source notes use many fine-grained `# Part …` headings (Week 1 has 40).
   **Do not emit one divider per source Part** — that buries the deck in
   dividers. Group adjacent Parts into 6–12 coherent teaching sections and give
   each one divider. Number them `Part I`, `Part II`, … in *your* numbering, and
   title them for the theme (e.g. "Variables and Types", "Arithmetic and
   Expressions"), not verbatim from the source headings. Aim for **at most one
   divider per 8 content slides**.
5. **Key takeaways** — 5–8 bullets
6. **Vocabulary** — a table of the week's terms (only terms actually introduced)
7. **Lab / practice** — what students do this week (from the notes' exercises)
8. **Looking ahead** — one slide pointing to next week

Title slide:

```html
<section class="title-slide" data-state="title">
  <span class="course-tag">CSC500 · Programming Fundamentals</span>
  <h1>Loops and Iteration</h1>
  <p class="subtitle">Week 3 — repeating work without repeating yourself</p>
  <p class="meta"><strong>Northern Kentucky University</strong> &nbsp;·&nbsp; Lecture slides &nbsp;·&nbsp; Press <code>S</code> for speaker notes, <code>O</code> for overview, <code>F</code> for fullscreen</p>
</section>
```

Part divider:

```html
<section class="part-divider">
  <p class="part-num">Part III</p>
  <h2>The <code>for</code> Loop</h2>
  <p class="part-sub">Counting loops, and why the three-part header exists.</p>
</section>
```

---

## 3. Content slides — the rules that matter

**Slides are 1280×800, top-aligned, not vertically centred.** Content must fit
without scrolling when accordions are closed. Concretely:

- **Max ~7 bullets** per slide, each ideally one line, never more than two.
- **Max ~22 lines of code** on a slide. Longer programs go in a modal, or get
  split across slides with `<!-- .element -->` fragments or a `.cols` layout.
- If a source section is too big, **split it into 2–3 slides** rather than
  shrinking the type.
- Every slide starts with `<h2>`. Use `<h4>` for sub-labels inside a slide.
- Prose from the notes that does not fit becomes **speaker notes** (§4) or an
  **accordion** (§6) or a **modal** (§5). Do not delete it.

Slide shell:

```html
<section>
  <h2>Integer Division</h2>
  ...
  <aside class="notes">…full prose from the notes…</aside>
</section>
```

### Code blocks

Always give the language class so highlighting works:

```html
<pre><code class="language-java" data-trim data-noescape>
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
</code></pre>
```

- Java code → `class="language-java"`
- Program output / console text → `class="language-text"` (renders as a terminal block)
- Anything else → the matching hljs language (`language-python`, `language-bash`, …)
- **Escape `<` and `>` as `&lt;` / `&gt;` inside code** (e.g. `ArrayList&lt;String&gt;`).
  `data-noescape` is on, so raw `<` will break the page.
- **Do not indent the code relative to the HTML.** Start each line at column 0
  inside the `<code>` element; `data-trim` removes the surrounding blank lines.
- To walk through code line by line, add
  `data-line-numbers="1|3-5|7"` — each `|` is one click.

### Layouts

```html
<div class="cols">      <!-- 50/50 -->
<div class="cols-53">   <!-- wide left, narrow right -->
<div class="cols-38">   <!-- narrow left, wide right -->
<div class="cols-3">    <!-- three equal -->
```

Use `.cols` for *code beside explanation* and for *before/after* comparisons.

### Emphasis components

```html
<div class="def"><span class="term">Algorithm:</span> a finite sequence of
well-defined steps for solving a problem.</div>

<div class="box key"><span class="box-title">Key idea</span>…</div>
<div class="box note"><span class="box-title">Note</span>…</div>
<div class="box warn"><span class="box-title">Watch out</span>…</div>
<div class="box pitfall"><span class="box-title">Common error</span>…</div>
<div class="box good"><span class="box-title">Do this</span>…</div>

<span class="tag ok">Correct</span>      <!-- label above a good code block -->
<span class="tag no">Wrong</span>        <!-- label above a broken code block -->
<span class="pill">O(n log n)</span>

<div class="chain">
  <span>Problem</span><span class="sep">→</span>
  <span>Algorithm</span><span class="sep">→</span>
  <span>Program</span>
</div>
```

Math (there is very little): use `<span class="math">A = w <span class="op">×</span> h</span>`
with Unicode operators (× ÷ ≤ ≥ ≠ ⌊ ⌋ √ Σ). **Never** leave raw LaTeX like `\[ … \]`
in the output.

---

## 4. Speaker notes

Every content slide gets `<aside class="notes">`. This is where the lecturer's
script lives — the connective prose you cut from the slide body. Write it as 2–5
short paragraphs of the *actual explanatory text from the notes*, lightly edited.
Press `S` in the browser to see it. This is how the density of the original
notes is preserved.

---

## 5. Modals — for concept deep-dives

Use a modal when a concept deserves a full explanation that would swamp the
slide: a long worked example, a full program, a derivation, a comparison table,
a "why does Java do it this way" digression.

**Trigger** (on the slide):

```html
<div class="mbtn-row">
  <span class="mbtn" data-modal="m3-scope" tabindex="0">Scope rules in detail</span>
  <span class="mbtn" data-modal="m3-trace" tabindex="0">Full execution trace</span>
</div>
```

Or inline in a sentence: `<span class="mlink" data-modal="m3-scope" tabindex="0">scope</span>`.

**Template** (near the bottom of `<body>`, before the scripts):

```html
<template class="csc-modal-tpl" id="m3-scope"
          data-kicker="Deep dive" data-title="Scope and the call stack">
  <h4>What scope means</h4>
  <p>…</p>
  <pre><code class="language-java">…</code></pre>
  <h4>Why it matters</h4>
  <ul><li>…</li></ul>
</template>
```

Rules:

- `id` must be unique **within the file**; prefix with the week number
  (`m7-…`) to keep them tidy.
- Every trigger's `data-modal` must match an existing template `id`.
- Modal bodies may be long — they scroll. This is the right home for the
  full-length prose, big programs, and extra worked examples from the notes.
- Aim for **8–20 modals per deck**, spread across the week.
- Code inside a modal is highlighted automatically; still set `class="language-java"`.
- Do **not** put a modal trigger inside an `<aside class="notes">`.

---

## 6. Accordions — for inline expandable detail

Use an accordion when the extra material belongs *right here on this slide* and
is short (a few lines, a small table, a short snippet): a clarification, an edge
case, a "show me the output", a rule's exceptions.

```html
<details class="acc">
  <summary>Why does <code>5 / 2</code> give 2?</summary>
  <div class="acc-body">
    <p>Both operands are <code>int</code>, so Java performs integer division and
    discards the fractional part.</p>
    <pre><code class="language-java">int a = 5 / 2;      // 2
double b = 5 / 2;   // 2.0  — division happened first
double c = 5.0 / 2; // 2.5</code></pre>
  </div>
</details>
```

Rules:

- The inner `<div class="acc-body">` wrapper is **required**.
- Closed by default (no `open` attribute) so the slide fits.
- 1–3 accordions per slide at most; a slide with 4+ wants a modal instead.
- Accordion vs. modal: **accordion = short, in place. modal = long, focused.**
- Aim for **20–40 accordions per deck**.

---

## 7. Fidelity rules

- **All code examples from the notes are kept verbatim.** Fix nothing except
  obvious typos; do not reformat or rename variables.
- **No content is invented.** Everything on a slide, in an accordion, in a
  modal, or in speaker notes comes from the source `.md` for that week.
- **Nothing is silently dropped.** If prose does not fit on the slide, it goes
  to speaker notes, an accordion, or a modal.
- Keep the notes' terminology and their order of presentation.
- Exercises / review questions at the end of the notes become the
  "Lab / practice" slide (and a modal with the full list if long).

---

## 7b. Gotchas learned from the pilot deck

- A slide scrolls if its content exceeds the 1280×800 stage, but a slide that
  needs scrolling *when its accordions are closed* is a slide you should have
  split. Check the tall ones.
- `.part-divider` and `.title-slide` are vertically centred by the stylesheet.
  Give them nothing but the elements shown in §2 — no code blocks, no accordions.
- Program output, shell commands and ASCII diagrams all use
  `class="language-text"`; they render as terminal blocks with no language chip.
  Only give a real language class to real source code.
- Do not put a modal trigger or an accordion inside `.part-divider`.

## 8. Size target

Roughly **70–110 slides per week**, plus accordions and modals. A deck file
lands around 120–250 KB. That is expected.

---

## 9. Self-check before finishing

- [ ] Every `data-modal="X"` has a `<template id="X">`; no orphan templates.
- [ ] No raw `<` or `>` inside `<code>` blocks (must be `&lt;` `&gt;`).
- [ ] Every `<pre><code>` has a `language-*` class.
- [ ] Every `details.acc` contains a `div.acc-body`.
- [ ] No `<style>` or inline `style="…"` anywhere in the file.
- [ ] No LaTeX (`\[`, `\(`, `$$`) survives in the output.
- [ ] The file starts with `<!doctype html>` and ends with `</html>`.
- [ ] `CSC500.boot();` is the last script.
