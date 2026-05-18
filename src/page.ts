export function renderPage(): string {
  return String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#ede4cf">
  <title>FloraLite — 植物图鉴</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400;500&display=swap">
  <style>
    :root {
      color-scheme: light;
      --paper: #ede4cf;
      --paper-2: #f6efdb;
      --paper-3: #faf5e6;
      --ink: #1a2618;
      --ink-2: #2c3a26;
      --moss: #3d5a2e;
      --moss-deep: #243a18;
      --clay: #a55a3a;
      --clay-soft: #c97a55;
      --sage: #8b9a78;
      --line: #c8bea0;
      --line-soft: #ddd3b3;
      --warn: #8a2e1a;

      --font-display: 'Fraunces', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
      --font-body: 'Instrument Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, 'Cascadia Code', Menlo, monospace;

      --radius: 2px;
      --shadow-soft: 0 1px 0 rgba(26, 38, 24, 0.04), 0 12px 32px -18px rgba(26, 38, 24, 0.25);
    }

    * { box-sizing: border-box; }

    html, body { height: 100%; }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.55;
      letter-spacing: 0.005em;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-image:
        radial-gradient(1200px 600px at 85% -10%, rgba(61, 90, 46, 0.08), transparent 60%),
        radial-gradient(900px 500px at -10% 110%, rgba(165, 90, 58, 0.07), transparent 55%),
        url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.10  0 0 0 0 0.13  0 0 0 0 0.09  0 0 0 0.045 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
      background-attachment: fixed;
    }

    .frame {
      width: min(1180px, 100%);
      margin: 0 auto;
      padding: clamp(20px, 4vw, 56px) clamp(18px, 4vw, 48px);
      display: flex;
      flex-direction: column;
      gap: clamp(22px, 3.4vw, 44px);
      min-height: 100vh;
    }

    /* ---------- Masthead ---------- */
    .masthead {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: clamp(12px, 2vw, 24px);
      padding-bottom: clamp(14px, 2vw, 22px);
      border-bottom: 1px solid var(--line);
      animation: fade-up 700ms cubic-bezier(0.22, 0.61, 0.36, 1) 60ms both;
    }

    .mark {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--moss-deep);
    }

    .mark svg {
      width: 28px;
      height: 28px;
      display: block;
    }

    .wordmark {
      font-family: var(--font-display);
      font-weight: 380;
      font-style: italic;
      font-size: clamp(28px, 4.4vw, 44px);
      line-height: 1;
      letter-spacing: -0.012em;
      color: var(--ink);
      font-variation-settings: "opsz" 120;
    }

    .wordmark em {
      font-style: normal;
      color: var(--moss);
    }

    .tagline {
      justify-self: center;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--ink-2);
      opacity: 0.72;
      max-width: 280px;
    }

    .meta {
      justify-self: end;
      text-align: right;
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-2);
      opacity: 0.7;
    }

    .meta b {
      display: block;
      font-weight: 500;
      color: var(--clay);
      opacity: 0.95;
    }

    /* ---------- Hero strip ---------- */
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: end;
      gap: clamp(14px, 3vw, 32px);
      animation: fade-up 800ms cubic-bezier(0.22, 0.61, 0.36, 1) 140ms both;
    }

    .hero-title {
      margin: 0;
      font-family: var(--font-display);
      font-weight: 320;
      font-size: clamp(38px, 7vw, 78px);
      line-height: 0.95;
      letter-spacing: -0.028em;
      color: var(--ink);
      font-variation-settings: "opsz" 144;
    }

    .hero-title i {
      font-style: italic;
      color: var(--moss);
      font-weight: 300;
    }

    .ornament {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--clay);
      padding-bottom: 8px;
    }

    .ornament .dot {
      width: 5px;
      height: 5px;
      background: var(--clay);
      border-radius: 999px;
    }

    .ornament .bar {
      width: 1px;
      height: clamp(28px, 5vw, 64px);
      background: linear-gradient(to bottom, transparent, var(--line) 20%, var(--line) 80%, transparent);
    }

    .hero-note {
      justify-self: end;
      text-align: right;
      max-width: 360px;
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--ink-2);
      padding-bottom: 10px;
    }

    .hero-note strong {
      display: block;
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--clay);
      margin-bottom: 6px;
      font-weight: 500;
    }

    /* ---------- Workspace ---------- */
    .workspace {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
      gap: clamp(16px, 2.4vw, 28px);
      align-items: start;
    }

    .card {
      position: relative;
      background: var(--paper-2);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow-soft);
      overflow: hidden;
    }

    .card::before {
      content: "";
      position: absolute;
      inset: 6px;
      pointer-events: none;
      border: 1px solid var(--line-soft);
      border-radius: 1px;
    }

    .card-head {
      position: relative;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 14px;
      padding: 16px clamp(16px, 2.4vw, 24px) 12px;
      border-bottom: 1px solid var(--line-soft);
    }

    .card-head h2 {
      margin: 0;
      font-family: var(--font-display);
      font-weight: 420;
      font-size: 17px;
      letter-spacing: -0.005em;
      color: var(--ink);
    }

    .card-head .idx {
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--clay);
    }

    /* ---------- Upload panel ---------- */
    .upload { animation: fade-up 820ms cubic-bezier(0.22, 0.61, 0.36, 1) 220ms both; }

    .upload-body {
      position: relative;
      padding: clamp(14px, 2.4vw, 22px);
      display: grid;
      gap: 16px;
    }

    .preview {
      position: relative;
      display: grid;
      place-items: center;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      background:
        linear-gradient(135deg, rgba(61, 90, 46, 0.04), rgba(165, 90, 58, 0.04)),
        var(--paper-3);
      border: 1px dashed var(--line);
      border-radius: 1px;
      transition: border-color 280ms ease, background 320ms ease;
    }

    .preview.has-image { border-style: solid; border-color: var(--line-soft); background: #fdf9eb; }

    .preview::before, .preview::after {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      border: 1px solid var(--clay);
      opacity: 0.55;
    }
    .preview::before { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
    .preview::after { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }

    .preview img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: none;
      mix-blend-mode: multiply;
    }

    .preview .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--sage);
      text-align: center;
      padding: 0 24px;
    }

    .placeholder svg {
      width: 36px;
      height: 36px;
      opacity: 0.8;
    }

    .placeholder span {
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--ink-2);
      opacity: 0.6;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: stretch;
    }

    /* Hidden but accessible file input */
    .sr-only {
      position: absolute !important;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0);
      white-space: nowrap; border: 0;
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 46px;
      padding: 0 22px;
      border-radius: 999px;
      border: 1px solid var(--moss-deep);
      background: var(--ink);
      color: var(--paper-3);
      font: 500 13.5px/1 var(--font-body);
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: transform 180ms ease, background 220ms ease, color 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
      text-decoration: none;
      flex: 1 1 auto;
    }

    .btn .arrow {
      display: inline-block;
      transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .btn:not(:disabled):hover {
      background: var(--moss-deep);
      border-color: var(--moss-deep);
      box-shadow: 0 8px 22px -10px rgba(36, 58, 24, 0.55);
    }

    .btn:not(:disabled):hover .arrow { transform: translateX(4px); }

    .btn:not(:disabled):active { transform: translateY(1px); }

    .btn--ghost {
      background: transparent;
      color: var(--ink);
      border-color: var(--line);
    }

    .btn--ghost:hover {
      background: var(--paper-3);
      border-color: var(--moss);
      color: var(--moss-deep);
    }

    .btn:disabled {
      cursor: not-allowed;
      opacity: 0.45;
      box-shadow: none;
    }

    .file-name {
      flex-basis: 100%;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.06em;
      color: var(--ink-2);
      opacity: 0.72;
      overflow-wrap: anywhere;
      min-height: 14px;
    }

    /* ---------- Status ---------- */
    .status-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px clamp(16px, 2.4vw, 24px);
      border-top: 1px solid var(--line-soft);
      background: linear-gradient(to bottom, transparent, rgba(61, 90, 46, 0.025));
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--sage);
      flex: none;
      box-shadow: 0 0 0 3px rgba(139, 154, 120, 0.18);
      transition: background 220ms ease, box-shadow 220ms ease;
    }

    .status-row[data-state="busy"] .status-dot {
      background: var(--clay);
      box-shadow: 0 0 0 3px rgba(165, 90, 58, 0.22);
      animation: pulse 1.2s ease-in-out infinite;
    }
    .status-row[data-state="ok"] .status-dot {
      background: var(--moss);
      box-shadow: 0 0 0 3px rgba(61, 90, 46, 0.22);
    }
    .status-row[data-state="error"] .status-dot {
      background: var(--warn);
      box-shadow: 0 0 0 3px rgba(138, 46, 26, 0.22);
    }

    .status-text {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ink-2);
    }

    /* ---------- Results ---------- */
    .results-panel { animation: fade-up 820ms cubic-bezier(0.22, 0.61, 0.36, 1) 320ms both; }

    .results-body {
      padding: clamp(14px, 2.4vw, 22px);
      min-height: 200px;
    }

    .results-list {
      display: grid;
      gap: 10px;
      padding: 0;
      margin: 0;
      list-style: none;
      counter-reset: rk;
    }

    .results-list li {
      counter-increment: rk;
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 14px;
      align-items: baseline;
      padding: 14px 16px 14px 14px;
      background: var(--paper-3);
      border: 1px solid var(--line-soft);
      border-radius: 1px;
      transition: border-color 220ms ease, transform 220ms ease, box-shadow 220ms ease;
      animation: fade-up 520ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .results-list li:nth-child(1) { animation-delay: 40ms; }
    .results-list li:nth-child(2) { animation-delay: 120ms; }
    .results-list li:nth-child(3) { animation-delay: 200ms; }

    .results-list li:hover {
      border-color: var(--moss);
      transform: translateX(2px);
    }

    .results-list li::before {
      content: counter(rk, decimal-leading-zero);
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.18em;
      color: var(--clay);
      align-self: center;
    }

    .results-list .name {
      min-width: 0;
      overflow-wrap: anywhere;
      font-family: var(--font-display);
      font-weight: 440;
      font-size: 17px;
      letter-spacing: -0.005em;
      color: var(--ink);
    }

    .results-list .confidence {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--moss-deep);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      letter-spacing: 0.04em;
      padding: 3px 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(61, 90, 46, 0.05);
    }

    .results-list li.error {
      grid-template-columns: auto 1fr;
      color: var(--warn);
      border-color: rgba(138, 46, 26, 0.35);
      background: rgba(138, 46, 26, 0.05);
    }

    .results-list li.error::before {
      content: "!";
      color: var(--warn);
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      color: var(--ink-2);
      opacity: 0.55;
    }

    .empty-line {
      width: 36px;
      height: 1px;
      background: var(--line);
    }

    .empty-text {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
    }

    .empty-hint {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 18px;
      color: var(--ink-2);
      opacity: 0.8;
      max-width: 32ch;
      line-height: 1.35;
      letter-spacing: -0.003em;
    }

    /* ---------- Footer ---------- */
    .footer {
      margin-top: auto;
      padding-top: clamp(16px, 2vw, 26px);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid var(--line);
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ink-2);
      opacity: 0.65;
      animation: fade-up 800ms cubic-bezier(0.22, 0.61, 0.36, 1) 420ms both;
    }

    .footer .glyph {
      letter-spacing: 0;
      font-family: var(--font-display);
      font-style: italic;
      text-transform: none;
      font-size: 14px;
      color: var(--moss);
      opacity: 0.9;
    }

    /* ---------- Animations ---------- */
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.18); opacity: 0.78; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
    }

    /* ---------- Responsive ---------- */
    @media (max-width: 880px) {
      .workspace { grid-template-columns: 1fr; }
      .hero { grid-template-columns: 1fr; align-items: start; gap: 18px; }
      .ornament { display: none; }
      .hero-note { justify-self: start; text-align: left; padding-bottom: 0; }
      .masthead { grid-template-columns: auto auto; }
      .tagline { display: none; }
    }

    @media (max-width: 560px) {
      body { font-size: 14.5px; }
      .masthead { grid-template-columns: 1fr; row-gap: 12px; }
      .meta { justify-self: start; text-align: left; }
      .controls .btn { min-height: 50px; flex-basis: 100%; }
      .results-list li {
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        row-gap: 6px;
      }
      .results-list .confidence {
        grid-column: 2;
        justify-self: start;
      }
      .hero-title { font-size: clamp(40px, 12vw, 56px); }
    }

    @media (hover: none) {
      .results-list li:hover { transform: none; }
    }
  </style>
</head>
<body>
  <div class="frame">
    <header class="masthead">
      <a class="mark" href="#" aria-label="FloraLite home">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 28 V14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M16 18 C 10 17, 7 13, 7 7 C 13 7, 16 11, 16 18 Z" fill="currentColor" opacity="0.18"/>
          <path d="M16 18 C 10 17, 7 13, 7 7 C 13 7, 16 11, 16 18" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          <path d="M16 20 C 22 19, 25 16, 25 11 C 19 11, 16 14, 16 20 Z" fill="currentColor" opacity="0.28"/>
          <path d="M16 20 C 22 19, 25 16, 25 11 C 19 11, 16 14, 16 20" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
        <span class="wordmark">Flora<em>Lite</em></span>
      </a>
      <span class="tagline">A field guide for the curious eye</span>
      <span class="meta">Edition · <b>植物图鉴 / 01</b></span>
    </header>

    <section class="hero" aria-hidden="true">
      <h1 class="hero-title">叶脉之间，<br><i>识万千生灵</i></h1>
      <div class="ornament">
        <span class="dot"></span>
        <span class="bar"></span>
        <span class="dot"></span>
      </div>
      <p class="hero-note"><strong>使用指南 · How to</strong>上传一张清晰的植物照片，FloraLite 将给出三项最可能的物种及置信度。</p>
    </section>

    <section class="workspace">
      <article class="card upload" aria-label="上传图片">
        <div class="card-head">
          <h2>样本采集 · Specimen</h2>
          <span class="idx">§ 01</span>
        </div>

        <div class="upload-body">
          <div class="preview" id="previewWrap">
            <img id="preview" alt="">
            <div class="placeholder" id="placeholder">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="6.5" y="9.5" width="35" height="29" rx="1" stroke="currentColor" stroke-width="1.2"/>
                <path d="M6.5 30 L18 21 L26 28 L33 23 L41.5 31" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                <circle cx="33" cy="17" r="2.4" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              <span>等待样本 · Awaiting specimen</span>
            </div>
          </div>

          <div class="controls">
            <label class="btn btn--ghost" for="file">
              <span>选择图片</span>
              <span aria-hidden="true">＋</span>
            </label>
            <input id="file" class="sr-only" type="file" accept="image/jpeg,image/png,image/bmp">
            <button id="submit" class="btn" disabled>
              <span>识别物种</span>
              <span class="arrow" aria-hidden="true">→</span>
            </button>
            <span id="fileName" class="file-name" aria-live="polite"></span>
          </div>
        </div>

        <div id="statusRow" class="status-row" data-state="idle">
          <span class="status-dot" aria-hidden="true"></span>
          <span id="status" class="status-text">请选择图片</span>
        </div>
      </article>

      <article class="card results-panel" aria-label="识别结果">
        <div class="card-head">
          <h2>识别结果 · Findings</h2>
          <span class="idx">§ 02</span>
        </div>
        <div class="results-body">
          <ol id="results" class="results-list"></ol>
          <div id="empty" class="empty">
            <span class="empty-line"></span>
            <span class="empty-text">No findings yet</span>
            <span class="empty-hint">尚无识别记录，等待第一份样本。</span>
          </div>
        </div>
      </article>
    </section>

    <footer class="footer">
      <span>FloraLite</span>
      <span class="glyph">❦</span>
      <span>Edition · MMXXVI</span>
    </footer>
  </div>

  <script>
    const MAX_SIDE = 4096;
    const MIN_SIDE = 15;
    const MAX_BASE64_LENGTH = 4 * 1024 * 1024;
    const ORIGINAL_BYTE_TARGET = Math.floor(MAX_BASE64_LENGTH * 0.72);

    const fileInput = document.getElementById("file");
    const submitButton = document.getElementById("submit");
    const preview = document.getElementById("preview");
    const previewWrap = document.getElementById("previewWrap");
    const placeholder = document.getElementById("placeholder");
    const status = document.getElementById("status");
    const statusRow = document.getElementById("statusRow");
    const results = document.getElementById("results");
    const emptyState = document.getElementById("empty");
    const fileName = document.getElementById("fileName");

    let selectedFile = null;

    function setStatus(text, state) {
      status.textContent = text;
      statusRow.dataset.state = state || "idle";
    }

    function clearResults() {
      results.innerHTML = "";
      emptyState.style.display = "flex";
    }

    function showEmpty(show) {
      emptyState.style.display = show ? "flex" : "none";
    }

    fileInput.addEventListener("change", () => {
      selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      clearResults();
      submitButton.disabled = !selectedFile;

      if (!selectedFile) {
        preview.style.display = "none";
        placeholder.style.display = "flex";
        previewWrap.classList.remove("has-image");
        fileName.textContent = "";
        setStatus("请选择图片", "idle");
        return;
      }

      preview.src = URL.createObjectURL(selectedFile);
      preview.style.display = "block";
      placeholder.style.display = "none";
      previewWrap.classList.add("has-image");
      fileName.textContent = selectedFile.name;
      setStatus("待识别", "idle");
    });

    submitButton.addEventListener("click", async () => {
      if (!selectedFile) return;

      submitButton.disabled = true;
      setStatus("处理中", "busy");
      clearResults();

      try {
        const image = await prepareImage(selectedFile);
        setStatus("识别中", "busy");

        const form = new URLSearchParams();
        form.set("image", image);

        const response = await fetch(location.pathname.replace(/\/$/, "") + "/identify", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: form.toString()
        });

        const data = await response.json();
        if (!data.ok) {
          showError(data.reason || "识别失败");
          return;
        }

        showResults(data.results || []);
        setStatus("完成", "ok");
      } catch (error) {
        showError(error instanceof Error ? error.message : "处理失败");
      } finally {
        submitButton.disabled = !selectedFile;
      }
    });

    async function prepareImage(file) {
      const meta = await loadImage(file);

      if (Math.min(meta.width, meta.height) < MIN_SIDE) {
        throw new Error("图片尺寸过小");
      }

      if (
        file.size <= ORIGINAL_BYTE_TARGET &&
        Math.max(meta.width, meta.height) <= MAX_SIDE &&
        /image\/(jpeg|png|bmp)/i.test(file.type)
      ) {
        const original = await fileToBase64(file);
        if (original.length <= MAX_BASE64_LENGTH) return original;
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("浏览器无法处理图片");

      let targetSide = Math.min(MAX_SIDE, Math.max(meta.width, meta.height));

      for (let scaleAttempt = 0; scaleAttempt < 7; scaleAttempt += 1) {
        const scale = targetSide / Math.max(meta.width, meta.height);
        const width = Math.max(1, Math.round(meta.width * scale));
        const height = Math.max(1, Math.round(meta.height * scale));

        if (Math.min(width, height) < MIN_SIDE) break;

        canvas.width = width;
        canvas.height = height;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(meta.image, 0, 0, width, height);

        for (let quality = 0.86; quality >= 0.46; quality -= 0.08) {
          const blob = await canvasToBlob(canvas, "image/jpeg", quality);
          const base64 = await fileToBase64(blob);
          if (base64.length <= MAX_BASE64_LENGTH) return base64;
        }

        targetSide = Math.floor(targetSide * 0.85);
      }

      throw new Error("图片过大，请先手动压缩");
    }

    function loadImage(file) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve({ image, width: image.naturalWidth, height: image.naturalHeight });
        };

        image.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("图片无法读取"));
        };

        image.src = url;
      });
    }

    function fileToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const value = String(reader.result || "");
          const comma = value.indexOf(",");
          resolve(comma >= 0 ? value.slice(comma + 1) : value);
        };
        reader.onerror = () => reject(new Error("图片读取失败"));
        reader.readAsDataURL(blob);
      });
    }

    function canvasToBlob(canvas, type, quality) {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("图片压缩失败"));
        }, type, quality);
      });
    }

    function showResults(items) {
      if (!items.length) {
        showError("未识别到植物结果");
        return;
      }

      results.innerHTML = "";
      showEmpty(false);
      for (const item of items.slice(0, 3)) {
        const row = document.createElement("li");
        const name = document.createElement("span");
        const confidence = document.createElement("span");
        name.className = "name";
        confidence.className = "confidence";
        name.textContent = item.name || "未知";
        confidence.textContent = item.confidence_text || "-";
        row.append(name, confidence);
        results.append(row);
      }
    }

    function showError(message) {
      setStatus("失败", "error");
      results.innerHTML = "";
      showEmpty(false);
      const row = document.createElement("li");
      row.className = "error";
      const text = document.createElement("span");
      text.className = "name";
      text.textContent = message;
      row.append(text);
      results.append(row);
    }
  </script>
</body>
</html>`;
}
