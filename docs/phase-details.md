# ペルソナ切り替え機能 — フェーズ別詳細計画書

各フェーズの具体的な変更内容を、対象ファイル・変更箇所（行番号）・コード差分レベルで記述する。

---

## Phase 1: 回転ボタン設置 + 状態管理基盤

### 目標
- 右上に回転ボタンが表示される
- クリックで `data-persona` が `textile` ⇔ `manga` にトグルする
- `localStorage` で状態が永続化される
- まだ見た目の変化はなし（DevTools で確認）

### 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `src/layouts/BaseLayout.astro` | FOUC防止スクリプト + 切替ボタン追加 |
| `src/styles/global.css` | ボタンCSS + 回転アニメーション |

### 変更詳細

#### 1-1. `src/layouts/BaseLayout.astro`

**変更箇所A: `<html>` タグ (L22)**
```diff
- <html class="light" lang="ja">
+ <html class="light" lang="ja" data-persona="textile">
```

**変更箇所B: `<head>` 内末尾 (L28の後)**
```html
<!-- Persona FOUC Prevention -->
<script is:inline>
  (function() {
    var p = localStorage.getItem("persona") || "textile";
    document.documentElement.dataset.persona = p;
  })();
</script>
```

**変更箇所C: `<body>` 内の先頭 (L31の直前)**
```html
<!-- Persona Switch Button -->
<button
  id="persona-switch-btn"
  class="persona-switch-btn"
  aria-label="エッセイ漫画モードに切り替え"
  title="エッセイ漫画モードに切り替え"
>
  <span class="material-symbols-outlined text-lg">autorenew</span>
</button>
```

**変更箇所D: `</body>` の直前 (L45の後)**
```html
<!-- Persona Switch Script -->
<script>
  const btn = document.getElementById("persona-switch-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const html = document.documentElement;
      const current = html.dataset.persona || "textile";
      const next = current === "textile" ? "manga" : "textile";

      // ボタン回転アニメーション
      btn.classList.add("switching");
      btn.addEventListener("animationend", () => {
        btn.classList.remove("switching");
      }, { once: true });

      // 状態切替
      html.dataset.persona = next;
      localStorage.setItem("persona", next);

      // aria-label 更新
      const label = next === "textile"
        ? "エッセイ漫画モードに切り替え"
        : "染織造形モードに切り替え";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    });
  }
</script>
```

#### 1-2. `src/styles/global.css`

**末尾に追加:**
```css
/* ============================
   Persona Switch Button
   ============================ */
.persona-switch-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 70;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid #d1d1d1;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d2d2d;
  transition: border-color 0.3s, transform 0.3s;
}

.dark .persona-switch-btn {
  background: rgba(26, 26, 26, 0.9);
  border-color: #555;
  color: #e5e5e5;
}

.persona-switch-btn:hover {
  border-color: var(--color-primary, #0505c7);
  transform: rotate(180deg);
}

.persona-switch-btn.switching {
  animation: persona-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes persona-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(720deg); }
}

/* モーション軽減 */
@media (prefers-reduced-motion: reduce) {
  .persona-switch-btn {
    transition: none;
  }
  .persona-switch-btn:hover {
    transform: none;
  }
  .persona-switch-btn.switching {
    animation: none;
  }
}
```

### 確認チェックリスト
- [ ] 右上にボタンが丸く表示される
- [ ] ホバーで180°回転する
- [ ] クリックで720°（2回転）スピンする
- [ ] DevTools Elements で `<html data-persona="manga">` に切り替わる
- [ ] ページリロードしても `data-persona` が保持される
- [ ] モバイルでもボタンが見える（MobileHeader z-50 より上の z-70）
- [ ] ダークモードでもボタンが見える

---

## Phase 2: Sidebar / MobileHeader のコンテンツ切替

### 目標
- サイドバーの名前・肩書きがパタパタアニメーションで切り替わる
- モバイルヘッダーも同様に切り替わる
- スタガード（時間差）で順番にパタパタする

### 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `src/components/Sidebar.astro` | 名前(L30)・肩書き(L31) をデュアル化 |
| `src/components/MobileHeader.astro` | 名前(L22)・肩書き(L23) をデュアル化 |
| `src/styles/global.css` | パタパタアニメーションCSS追加 |
| `src/layouts/BaseLayout.astro` | 切替スクリプトにスタガード機能追加 |

### 変更詳細

#### 2-1. `src/styles/global.css` — パタパタアニメーション追加

```css
/* ============================
   Persona Content Swap
   ============================ */

/* デュアルコンテンツの基本構造 */
.swap-container {
  position: relative;
  perspective: 600px;
}

.persona-content {
  backface-visibility: hidden;
  transform-origin: center center;
}

/* 非アクティブなペルソナを非表示 */
[data-persona="textile"] .persona-content[data-persona="manga"] {
  display: none;
}
[data-persona="manga"] .persona-content[data-persona="textile"] {
  display: none;
}

/* パタパタ: 消える側 */
@keyframes flipOut {
  0%   { opacity: 1; transform: rotateX(0deg); }
  100% { opacity: 0; transform: rotateX(90deg); }
}

/* パタパタ: 現れる側 */
@keyframes flipIn {
  0%   { opacity: 0; transform: rotateX(-90deg); }
  100% { opacity: 1; transform: rotateX(0deg); }
}

.swap-container.flipping-out .persona-content:not([style*="display: none"]) {
  animation: flipOut 0.25s ease-in forwards;
}

.swap-container.flipping-in .persona-content:not([style*="display: none"]) {
  animation: flipIn 0.25s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .swap-container.flipping-out .persona-content,
  .swap-container.flipping-in .persona-content {
    animation: none;
  }
}
```

#### 2-2. `src/components/Sidebar.astro` — L29-32 を変更

**現在 (L29-32):**
```html
<a href={`${base}/`} class="flex flex-col gap-1">
  <h1 class="font-serif text-2xl font-bold tracking-widest text-text-main dark:text-white">{settings.artist_name}</h1>
  <p class="text-primary text-xs font-medium tracking-[0.2em] uppercase mt-2">{settings.artist_subtitle}</p>
</a>
```

**変更後:**
```html
<a href={`${base}/`} class="flex flex-col gap-1">
  <div class="swap-container" data-swap-index="0">
    <h1 class="persona-content font-serif text-2xl font-bold tracking-widest text-text-main dark:text-white" data-persona="textile">{settings.artist_name}</h1>
    <h1 class="persona-content font-serif text-2xl font-bold tracking-widest text-text-main dark:text-white" data-persona="manga">{settings.artist_name}</h1>
  </div>
  <div class="swap-container" data-swap-index="1">
    <p class="persona-content text-primary text-xs font-medium tracking-[0.2em] uppercase mt-2" data-persona="textile">{settings.artist_subtitle}</p>
    <p class="persona-content text-primary text-xs font-medium tracking-[0.2em] uppercase mt-2" data-persona="manga">エッセイ漫画作者</p>
  </div>
</a>
```

> 注: `manga` 側のテキストは Phase 5 で CMS データに差し替え。Phase 2 ではハードコード仮データ。

#### 2-3. `src/components/MobileHeader.astro` — L21-24 を変更

**現在 (L21-24):**
```html
<a href={`${base}/`} class="flex flex-col min-w-0">
  <h1 class="font-serif text-lg font-bold tracking-wider text-text-main dark:text-white truncate">{settings.artist_name}</h1>
  <span class="text-xs text-primary uppercase tracking-widest mt-1 truncate">{settings.artist_subtitle}</span>
</a>
```

**変更後:**
```html
<a href={`${base}/`} class="flex flex-col min-w-0">
  <div class="swap-container" data-swap-index="0">
    <h1 class="persona-content font-serif text-lg font-bold tracking-wider text-text-main dark:text-white truncate" data-persona="textile">{settings.artist_name}</h1>
    <h1 class="persona-content font-serif text-lg font-bold tracking-wider text-text-main dark:text-white truncate" data-persona="manga">{settings.artist_name}</h1>
  </div>
  <div class="swap-container" data-swap-index="1">
    <span class="persona-content text-xs text-primary uppercase tracking-widest mt-1 truncate" data-persona="textile">{settings.artist_subtitle}</span>
    <span class="persona-content text-xs text-primary uppercase tracking-widest mt-1 truncate" data-persona="manga">エッセイ漫画作者</span>
  </div>
</a>
```

#### 2-4. `src/layouts/BaseLayout.astro` — 切替スクリプトを拡張

Phase 1 のスクリプトを以下に差し替え:

```html
<script>
  const btn = document.getElementById("persona-switch-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const html = document.documentElement;
      const current = html.dataset.persona || "textile";
      const next = current === "textile" ? "manga" : "textile";

      // ボタン回転アニメーション
      btn.classList.add("switching");
      btn.addEventListener("animationend", () => {
        btn.classList.remove("switching");
      }, { once: true });

      // パタパタ: スタガードアニメーション
      const containers = document.querySelectorAll(".swap-container");
      const staggerDelay = 80; // ms

      containers.forEach((container, i) => {
        setTimeout(() => {
          // Step 1: 現在のコンテンツを flip out
          container.classList.add("flipping-out");

          setTimeout(() => {
            // Step 2: コンテンツ切替
            container.classList.remove("flipping-out");
            // data-persona 切替は全体で1回だけ（最初の要素のとき）
            if (i === 0) {
              html.dataset.persona = next;
              localStorage.setItem("persona", next);
            }

            // Step 3: 新しいコンテンツを flip in
            container.classList.add("flipping-in");
            setTimeout(() => {
              container.classList.remove("flipping-in");
            }, 250);
          }, 250);
        }, i * staggerDelay);
      });

      // aria-label 更新
      const label = next === "textile"
        ? "エッセイ漫画モードに切り替え"
        : "染織造形モードに切り替え";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    });
  }
</script>
```

### 確認チェックリスト
- [ ] サイドバーの名前が「パタン」とめくれて切り替わる
- [ ] 肩書きが少し遅れて（80ms後）パタパタする
- [ ] MobileHeader でも同様に動作する
- [ ] 切替後、テキストが正しく表示される
- [ ] アニメーション中にレイアウトがずれない

---

## Phase 3: トップページ（index.astro）の切替

### 目標
- Hero画像がパタパタで切り替わる
- About セクションのプロフィール画像・名前・テキストが切り替わる
- News / Works / Projects セクションヘッダーの日本語サブテキストが切り替わる

### 変更ファイル一覧

| ファイル | 変更箇所 | 内容 |
|---|---|---|
| `src/components/HeroSection.astro` | L14-19 背景画像 | デュアル背景画像 |
| `src/components/AboutSection.astro` | L23-33 画像, L37-39 名前, L41-44 テキスト | プロフィールデュアル化 |
| `src/components/NewsSection.astro` | L24 サブテキスト | 「最新情報」→ 切替 |
| `src/components/WorksSection.astro` | L17 サブテキスト | 「作品」→ 切替 |
| `src/components/ResearchSection.astro` | L17 サブテキスト | 「プロジェクト」→ 切替 |

### 変更詳細

#### 3-1. `src/components/HeroSection.astro`

**現在 (L14-19): Hero背景画像**
```html
{heroImageUrl ? (
  <div
    class="w-full h-full bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
    style={`background-image: linear-gradient(to right, rgba(249,249,247,0.2), rgba(249,249,247,0.1)), url("${heroImageUrl}?w=1920&q=80");`}
  />
) : (
```

**変更後:**
```html
{heroImageUrl ? (
  <div class="swap-container w-full h-full" data-swap-index="2">
    <div
      class="persona-content w-full h-full bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
      data-persona="textile"
      style={`background-image: linear-gradient(to right, rgba(249,249,247,0.2), rgba(249,249,247,0.1)), url("${heroImageUrl}?w=1920&q=80");`}
    />
    <div
      class="persona-content absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
      data-persona="manga"
      style={`background-image: linear-gradient(to right, rgba(249,249,247,0.2), rgba(249,249,247,0.1)), url("${heroImageUrl}?w=1920&q=80");`}
    />
  </div>
) : (
```
> 注: manga 側の画像URLは Phase 5 で CMS データに差し替え。Phase 3 では同じ画像を仮設定。

#### 3-2. `src/components/AboutSection.astro`

**名前部分 (L37-39):**
```diff
  <div class="flex flex-col gap-3 border-l-[3px] border-primary pl-6">
-   <span class="font-serif text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-widest">{settings.artist_name}</span>
-   <span class="text-sm font-display tracking-[0.25em] text-primary uppercase">Yuna Tanaka</span>
+   <div class="swap-container" data-swap-index="3">
+     <span class="persona-content font-serif text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-widest" data-persona="textile">{settings.artist_name}</span>
+     <span class="persona-content font-serif text-2xl md:text-3xl font-bold text-text-main dark:text-white tracking-widest" data-persona="manga">{settings.artist_name}</span>
+   </div>
+   <div class="swap-container" data-swap-index="4">
+     <span class="persona-content text-sm font-display tracking-[0.25em] text-primary uppercase" data-persona="textile">Yuna Tanaka</span>
+     <span class="persona-content text-sm font-display tracking-[0.25em] text-primary uppercase" data-persona="manga">Yuna Tanaka</span>
+   </div>
  </div>
```

**About テキスト部分 (L41-44):**
```diff
  {settings.about_text && (
-   <div class="font-serif text-base leading-[2] text-text-main dark:text-gray-200 text-left md:text-justify rich-content line-clamp-6">
-     <Fragment set:html={settings.about_text} />
-   </div>
+   <div class="swap-container" data-swap-index="5">
+     <div class="persona-content font-serif text-base leading-[2] text-text-main dark:text-gray-200 text-left md:text-justify rich-content line-clamp-6" data-persona="textile">
+       <Fragment set:html={settings.about_text} />
+     </div>
+     <div class="persona-content font-serif text-base leading-[2] text-text-main dark:text-gray-200 text-left md:text-justify rich-content line-clamp-6" data-persona="manga">
+       <p>エッセイ漫画の仮テキスト（Phase 5 で CMS に差し替え）</p>
+     </div>
+   </div>
  )}
```

#### 3-3. セクションヘッダー — WorksSection.astro (L16-17 付近)

```diff
  <div class="flex items-end gap-4 mb-2">
    <h2 class="font-serif text-3xl font-bold tracking-tight text-text-main dark:text-white">Works</h2>
-   <span class="text-sm text-primary font-medium mb-1 tracking-wider opacity-80">作品</span>
+   <div class="swap-container inline-flex" data-swap-index="6">
+     <span class="persona-content text-sm text-primary font-medium mb-1 tracking-wider opacity-80" data-persona="textile">作品</span>
+     <span class="persona-content text-sm text-primary font-medium mb-1 tracking-wider opacity-80" data-persona="manga">漫画作品</span>
+   </div>
  </div>
```

同様に NewsSection.astro (L24), ResearchSection.astro (L17) も変更。

| ファイル | 現在の日本語 | textile | manga |
|---|---|---|---|
| NewsSection | 最新情報 | 最新情報 | 最新情報 |
| WorksSection | 作品 | 作品 | 漫画作品 |
| ResearchSection | プロジェクト | プロジェクト | プロジェクト |

### 確認チェックリスト
- [ ] Hero 画像が切り替わる（Phase 5 まで同じ画像だが仕組みは動作）
- [ ] About の名前・テキストがパタパタで切り替わる
- [ ] Works セクションの「作品」→「漫画作品」が切り替わる
- [ ] スタガードで上から順番にパタパタする
- [ ] スクロール位置がリセットされない
- [ ] モバイルでも正常表示

---

## Phase 4: 下層ページ + Footer の切替

### 目標
- About ページのプロフィール画像・テキスト・CV が切り替わる
- Contact ページの説明文が切り替わる
- Footer / FooterMinimal の著作権テキストが切り替わる

### 変更ファイル一覧

| ファイル | 変更箇所 | 内容 |
|---|---|---|
| `src/pages/about.astro` | L13 画像, L26 名前, L30-32 テキスト, L44 CV | 全セクションデュアル化 |
| `src/pages/contact.astro` | L20-22 説明文 | 説明テキストデュアル化 |
| `src/components/Footer.astro` | L54 著作権 | copyright デュアル化 |
| `src/components/FooterMinimal.astro` | L14 著作権 | copyright デュアル化 |

### 変更詳細

#### 4-1. `src/pages/about.astro`

**画像 (L11-17):**
```diff
  <section class="w-full py-12 md:py-20 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
-   {settings.profile_image && (
-     <img
-       src={`${settings.profile_image.url}?w=1920&q=80`}
-       alt={settings.artist_name}
-       class="max-h-[50vh] md:max-h-[65vh] w-auto max-w-full object-contain grayscale-[30%]"
-     />
-   )}
+   <div class="swap-container" data-swap-index="0">
+     {settings.profile_image && (
+       <img
+         class="persona-content max-h-[50vh] md:max-h-[65vh] w-auto max-w-full object-contain grayscale-[30%]"
+         data-persona="textile"
+         src={`${settings.profile_image.url}?w=1920&q=80`}
+         alt={settings.artist_name}
+       />
+     )}
+     {settings.profile_image && (
+       <img
+         class="persona-content max-h-[50vh] md:max-h-[65vh] w-auto max-w-full object-contain grayscale-[30%]"
+         data-persona="manga"
+         src={`${settings.profile_image.url}?w=1920&q=80`}
+         alt={`${settings.artist_name} - エッセイ漫画`}
+         loading="lazy"
+       />
+     )}
+   </div>
  </section>
```
> 注: manga 側画像は Phase 5 で差し替え。

**名前 (L25-28):**
```diff
  <div class="flex flex-col gap-3 border-l-[3px] border-primary pl-6">
-   <h1 class="font-serif text-3xl md:text-5xl font-bold text-text-main dark:text-white tracking-widest leading-tight">{settings.artist_name}</h1>
-   <span class="text-sm font-display tracking-[0.25em] text-primary uppercase mt-1">Yuna Tanaka</span>
+   <div class="swap-container" data-swap-index="1">
+     <h1 class="persona-content font-serif text-3xl md:text-5xl font-bold text-text-main dark:text-white tracking-widest leading-tight" data-persona="textile">{settings.artist_name}</h1>
+     <h1 class="persona-content font-serif text-3xl md:text-5xl font-bold text-text-main dark:text-white tracking-widest leading-tight" data-persona="manga">{settings.artist_name}</h1>
+   </div>
+   <div class="swap-container" data-swap-index="2">
+     <span class="persona-content text-sm font-display tracking-[0.25em] text-primary uppercase mt-1" data-persona="textile">Yuna Tanaka</span>
+     <span class="persona-content text-sm font-display tracking-[0.25em] text-primary uppercase mt-1" data-persona="manga">Yuna Tanaka</span>
+   </div>
  </div>
```

**About テキスト (L29-33):**
```diff
  {settings.about_text && (
-   <div class="font-serif text-base md:text-lg leading-[1.8] text-text-main dark:text-gray-300 space-y-8 text-left md:text-justify mt-4 rich-content">
-     <Fragment set:html={settings.about_text} />
-   </div>
+   <div class="swap-container" data-swap-index="3">
+     <div class="persona-content font-serif text-base md:text-lg leading-[1.8] text-text-main dark:text-gray-300 space-y-8 text-left md:text-justify mt-4 rich-content" data-persona="textile">
+       <Fragment set:html={settings.about_text} />
+     </div>
+     <div class="persona-content font-serif text-base md:text-lg leading-[1.8] text-text-main dark:text-gray-300 space-y-8 text-left md:text-justify mt-4 rich-content" data-persona="manga">
+       <p>エッセイ漫画の自己紹介（Phase 5 で CMS に差し替え）</p>
+     </div>
+   </div>
  )}
```

**CV (L39-47):**
```diff
  {settings.cv_list && (
    <div class="flex flex-col gap-12">
      <h2 class="font-serif text-2xl text-text-main dark:text-white tracking-widest flex items-center gap-4">
        略歴 <span class="text-xs font-display text-primary tracking-wider uppercase opacity-80 pt-1">Biography</span>
      </h2>
-     <div class="font-serif text-base leading-[1.8] text-text-main dark:text-gray-300 rich-content">
-       <Fragment set:html={settings.cv_list} />
-     </div>
+     <div class="swap-container" data-swap-index="4">
+       <div class="persona-content font-serif text-base leading-[1.8] text-text-main dark:text-gray-300 rich-content" data-persona="textile">
+         <Fragment set:html={settings.cv_list} />
+       </div>
+       <div class="persona-content font-serif text-base leading-[1.8] text-text-main dark:text-gray-300 rich-content" data-persona="manga">
+         <p>漫画関連の経歴（Phase 5 で CMS に差し替え）</p>
+       </div>
+     </div>
    </div>
  )}
```

#### 4-2. `src/pages/contact.astro` — L18-23 説明文

```diff
  {settings.contact_description && (
    <div class="mb-16 max-w-2xl mx-auto text-center">
-     <p class="font-serif text-text-main dark:text-gray-200 leading-loose text-sm md:text-base">
-       {settings.contact_description}
-     </p>
+     <div class="swap-container" data-swap-index="0">
+       <p class="persona-content font-serif text-text-main dark:text-gray-200 leading-loose text-sm md:text-base" data-persona="textile">
+         {settings.contact_description}
+       </p>
+       <p class="persona-content font-serif text-text-main dark:text-gray-200 leading-loose text-sm md:text-base" data-persona="manga">
+         エッセイ漫画に関するお問い合わせ（Phase 5 で CMS に差し替え）
+       </p>
+     </div>
    </div>
  )}
```

#### 4-3. `src/components/Footer.astro` — L54 著作権

```diff
  <div class="mt-12 md:mt-24 pt-4 border-t border-gray-200 dark:border-gray-800">
-   <p class="text-[10px] text-gray-400 uppercase tracking-widest">{settings.copyright_text}</p>
+   <div class="swap-container" data-swap-index="99">
+     <p class="persona-content text-[10px] text-gray-400 uppercase tracking-widest" data-persona="textile">{settings.copyright_text}</p>
+     <p class="persona-content text-[10px] text-gray-400 uppercase tracking-widest" data-persona="manga">{settings.copyright_text}</p>
+   </div>
  </div>
```

#### 4-4. `src/components/FooterMinimal.astro` — L14 著作権

```diff
- <p>{settings.copyright_text}</p>
+ <div class="swap-container inline" data-swap-index="99">
+   <span class="persona-content" data-persona="textile">{settings.copyright_text}</span>
+   <span class="persona-content" data-persona="manga">{settings.copyright_text}</span>
+ </div>
```

### 確認チェックリスト
- [ ] About ページでプロフィール画像がパタパタ切替
- [ ] About ページで自己紹介文・CVが切替
- [ ] Contact ページで説明文が切替
- [ ] Footer の著作権テキストが切替
- [ ] ページ遷移しても選択ペルソナが維持される
- [ ] 全ページで切替ボタンが動作する

---

## Phase 5: MicroCMS 連携

### 目標
- ハードコードの仮データを CMS データに差し替え
- マンガペルソナ用フィールドを MicroCMS に追加

### 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| MicroCMS 管理画面 | `global_settings` にフィールド追加 |
| `src/types/microcms.ts` | `GlobalSettings` に manga_ フィールド追加 |
| 各コンポーネント | 仮テキストを `settings.manga_xxx` に差し替え |

### 変更詳細

#### 5-1. MicroCMS 管理画面 — `global_settings` にフィールド追加

| フィールドID | 表示名 | 種類 | 必須 |
|---|---|---|---|
| `manga_artist_subtitle` | 漫画_肩書き | テキストフィールド | × |
| `manga_hero_image` | 漫画_ヒーロー画像 | 画像 | × |
| `manga_profile_image` | 漫画_プロフィール画像 | 画像 | × |
| `manga_about_text` | 漫画_About文 | リッチエディタ | × |
| `manga_about_subtitle` | 漫画_Aboutサブタイトル | テキストフィールド | × |
| `manga_cv_list` | 漫画_略歴 | リッチエディタ | × |
| `manga_contact_description` | 漫画_お問い合わせ説明 | テキストフィールド | × |
| `manga_copyright_text` | 漫画_著作権表記 | テキストフィールド | × |

> `manga_artist_name` は不要（同一人物なので名前は同じ）

#### 5-2. `src/types/microcms.ts` — GlobalSettings に追加

```diff
  export interface GlobalSettings {
    // 既存フィールド（変更なし）
    site_title: string;
    artist_name: string;
    artist_subtitle: string;
    // ... 省略 ...
    copyright_text: string;
+
+   // マンガペルソナ用フィールド（全て optional）
+   manga_artist_subtitle?: string;
+   manga_hero_image?: MicroCMSImage;
+   manga_profile_image?: MicroCMSImage;
+   manga_about_text?: string;
+   manga_about_subtitle?: string;
+   manga_cv_list?: string;
+   manga_contact_description?: string;
+   manga_copyright_text?: string;
  }
```

#### 5-3. 各コンポーネントの仮データ差し替え

**例: Sidebar.astro の肩書き**
```diff
- <p class="persona-content ..." data-persona="manga">エッセイ漫画作者</p>
+ <p class="persona-content ..." data-persona="manga">{settings.manga_artist_subtitle || settings.artist_subtitle}</p>
```

**例: HeroSection.astro の画像**
```diff
- style={`background-image: ... url("${heroImageUrl}?w=1920&q=80");`}
+ style={`background-image: ... url("${(settings.manga_hero_image?.url || heroImageUrl)}?w=1920&q=80");`}
```

同様のパターンで全ての仮データを差し替え。フォールバックとして textile 側のデータを使用する。

### 確認チェックリスト
- [ ] MicroCMS にフィールドが正しく追加された
- [ ] `npm run build` で型エラーがない
- [ ] CMS に仮データを入力して動作確認
- [ ] manga_ フィールド未入力でも textile 側が表示される（フォールバック）
- [ ] Webhook でデプロイが正常に動く

---

## Phase 6: 仕上げ・最適化

### 目標
- カラーテーマの切替（任意）
- 画像の遅延読み込み最適化
- ページタイトルの動的切替
- アクセシビリティ最終調整
- テスト

### 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `tailwind.config.mjs` | カラーテーマ追加（任意） |
| `src/styles/global.css` | ペルソナ別カスタムプロパティ |
| `src/layouts/BaseLayout.astro` | `<title>` 動的切替スクリプト |
| 全コンポーネント | manga 側 `<img>` に `loading="lazy"` |

### 変更詳細

#### 6-1. カラーテーマ（任意）

`src/styles/global.css` に追加:
```css
/* ペルソナ別カラー */
[data-persona="textile"] {
  --color-primary: #0505c7;
}
[data-persona="manga"] {
  --color-primary: #e84393; /* 例: ピンク */
}
```

`tailwind.config.mjs` の primary を CSS 変数に:
```diff
  colors: {
-   primary: "#0505c7",
+   primary: "var(--color-primary, #0505c7)",
  }
```

#### 6-2. ページタイトル動的切替

`src/layouts/BaseLayout.astro` のスクリプトに追加:
```javascript
// <title> 更新
const currentTitle = document.title;
if (next === "manga") {
  document.title = currentTitle.replace("染織造形作家", "エッセイ漫画作者");
} else {
  document.title = currentTitle.replace("エッセイ漫画作者", "染織造形作家");
}
```

#### 6-3. 画像遅延読み込み

非アクティブペルソナの画像に `data-src` パターン:
```html
<!-- manga 側は初期非表示なので lazy -->
<img
  class="persona-content ..."
  data-persona="manga"
  data-src="{mangaImageUrl}?w=800&q=80"
  src=""
  loading="lazy"
/>
```

初回切替時に `data-src` → `src` に変換するスクリプト:
```javascript
let mangaImagesLoaded = false;
// 初回 manga 切替時
if (next === "manga" && !mangaImagesLoaded) {
  document.querySelectorAll('[data-persona="manga"][data-src]').forEach(img => {
    img.src = img.dataset.src;
  });
  mangaImagesLoaded = true;
}
```

#### 6-4. アクセシビリティ最終チェック

- [ ] `prefers-reduced-motion` でアニメーション無効確認
- [ ] キーボード操作（Tab → Enter）で切替可能
- [ ] スクリーンリーダーでボタンの role と label が読み上げられる
- [ ] フォーカス可視（ボタンに `:focus-visible` リング）

#### 6-5. テストマトリクス

| テスト項目 | デスクトップ | モバイル |
|---|---|---|
| トップページ切替 | [ ] | [ ] |
| About ページ切替 | [ ] | [ ] |
| News 一覧ページ | [ ] | [ ] |
| Works 一覧ページ | [ ] | [ ] |
| Projects 一覧ページ | [ ] | [ ] |
| Contact ページ切替 | [ ] | [ ] |
| 詳細ページ（News） | [ ] | [ ] |
| 詳細ページ（Works） | [ ] | [ ] |
| 詳細ページ（Projects） | [ ] | [ ] |
| ページ遷移後の状態維持 | [ ] | [ ] |
| リロード後の状態維持 | [ ] | [ ] |
| ダークモード共存 | [ ] | [ ] |

### 確認チェックリスト
- [ ] カラーテーマが切り替わる（実装する場合）
- [ ] manga 画像が初回切替時にのみ読み込まれる
- [ ] ページタイトルが切り替わる
- [ ] 全テストマトリクスがパス
- [ ] Lighthouse スコアに大きな低下がない
