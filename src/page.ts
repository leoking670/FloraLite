export function renderPage(): string {
  return String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FloraLite</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8f5;
      --panel: #ffffff;
      --text: #1b1f1a;
      --muted: #667063;
      --line: #d8ded2;
      --accent: #236b4a;
      --accent-dark: #174d35;
      --warn: #9a3412;
      --shadow: 0 10px 30px rgba(27, 31, 26, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font: 15px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    main {
      width: min(920px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 28px 0;
    }

    header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      line-height: 1.2;
      letter-spacing: 0;
    }

    .status {
      min-height: 24px;
      color: var(--muted);
      text-align: right;
    }

    .workspace {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
      gap: 18px;
      align-items: start;
    }

    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }

    .upload {
      display: grid;
      gap: 14px;
      padding: 18px;
    }

    .preview {
      display: grid;
      place-items: center;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      border: 1px dashed #b6c1b0;
      border-radius: 6px;
      background: #eef2ea;
      color: var(--muted);
    }

    .preview img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: none;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    input[type="file"] {
      max-width: 100%;
    }

    button {
      min-height: 38px;
      border: 0;
      border-radius: 6px;
      padding: 0 16px;
      background: var(--accent);
      color: #fff;
      font: inherit;
      cursor: pointer;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    button:not(:disabled):hover {
      background: var(--accent-dark);
    }

    .results {
      padding: 18px;
    }

    .results h2 {
      margin: 0 0 12px;
      font-size: 17px;
      line-height: 1.3;
      letter-spacing: 0;
    }

    ol {
      display: grid;
      gap: 10px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    li {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: center;
      min-height: 48px;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #fbfcfa;
    }

    .name {
      min-width: 0;
      overflow-wrap: anywhere;
      font-weight: 650;
    }

    .confidence {
      color: var(--accent-dark);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .error {
      color: var(--warn);
    }

    @media (max-width: 760px) {
      main {
        width: min(100vw - 24px, 920px);
        padding: 18px 0;
      }

      header {
        display: grid;
      }

      .status {
        text-align: left;
      }

      .workspace {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>FloraLite</h1>
      <div id="status" class="status">请选择图片</div>
    </header>

    <section class="workspace">
      <div class="panel upload">
        <div class="preview">
          <img id="preview" alt="">
          <span id="placeholder">未选择图片</span>
        </div>
        <div class="controls">
          <input id="file" type="file" accept="image/jpeg,image/png,image/bmp" capture="environment">
          <button id="submit" disabled>识别</button>
        </div>
      </div>

      <div class="panel results">
        <h2>识别结果</h2>
        <ol id="results"></ol>
      </div>
    </section>
  </main>

  <script>
    const MAX_SIDE = 4096;
    const MIN_SIDE = 15;
    const MAX_BASE64_LENGTH = 4 * 1024 * 1024;
    const ORIGINAL_BYTE_TARGET = Math.floor(MAX_BASE64_LENGTH * 0.72);

    const fileInput = document.getElementById("file");
    const submitButton = document.getElementById("submit");
    const preview = document.getElementById("preview");
    const placeholder = document.getElementById("placeholder");
    const status = document.getElementById("status");
    const results = document.getElementById("results");

    let selectedFile = null;

    fileInput.addEventListener("change", () => {
      selectedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      results.innerHTML = "";
      submitButton.disabled = !selectedFile;

      if (!selectedFile) {
        preview.style.display = "none";
        placeholder.style.display = "block";
        status.textContent = "请选择图片";
        return;
      }

      preview.src = URL.createObjectURL(selectedFile);
      preview.style.display = "block";
      placeholder.style.display = "none";
      status.textContent = selectedFile.name;
    });

    submitButton.addEventListener("click", async () => {
      if (!selectedFile) return;

      submitButton.disabled = true;
      status.textContent = "处理中";
      results.innerHTML = "";

      try {
        const image = await prepareImage(selectedFile);
        status.textContent = "识别中";

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
        status.textContent = "完成";
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
      status.textContent = "失败";
      results.innerHTML = "";
      const row = document.createElement("li");
      row.className = "error";
      row.textContent = message;
      results.append(row);
    }
  </script>
</body>
</html>`;
}
