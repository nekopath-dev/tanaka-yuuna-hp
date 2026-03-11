# ペルソナ切り替え機能 実装計画書

## 概要

右上の回転ボタンを押すと、サイト全体が「染織造形作家」から「エッセイ漫画作者」のHPにパタパタとアニメーション付きで切り替わる機能を実装する。

レイアウト構造はそのまま維持し、画像・テキスト・色などのコンテンツのみが入れ替わる。

---

## 技術方針

### アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│  <html data-persona="textile">                  │
│                                                 │
│  ┌─ <head> ──────────────────────────────────┐  │
│  │  is:inline script (FOUC防止)              │  │
│  │  → localStorage から persona 読み取り     │  │
│  │  → 即座に data-persona 属性をセット       │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─ 切替ボタン (fixed, 右上) ────────────────┐  │
│  │  クリック → 360°回転アニメーション        │  │
│  │  → data-persona を toggle                 │  │
│  │  → localStorage に保存                    │  │
│  │  → パタパタアニメーション発火             │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─ コンテンツ領域 ─────────────────────────┐   │
│  │                                           │   │
│  │  <div class="swap-container">             │   │
│  │    <span data-persona="textile">染織…</span>│  │
│  │    <span data-persona="manga">漫画…</span> │  │
│  │  </div>                                   │   │
│  │                                           │   │
│  │  CSS: 非アクティブ側は                    │   │
│  │  opacity:0 + position:absolute +          │   │
│  │  rotateX(90deg) で非表示                  │   │
│  │                                           │   │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 状態管理

| 項目 | 方式 |
|---|---|
| 状態の保持場所 | `document.documentElement.dataset.persona` (`"textile"` or `"manga"`) |
| 永続化 | `localStorage.setItem("persona", value)` |
| FOUC防止 | `<head>` 内の `<script is:inline>` で即座にセット |
| CSS切替 | `[data-persona="textile"]` / `[data-persona="manga"]` セレクタ |

### アニメーション方式

```
ボタンクリック
  │
  ├─ ボタン: 360° 回転 (0.8s, cubic-bezier)
  │
  ├─ 各コンテンツ要素: スタガード・パタパタ
  │   ├─ 0ms:   サイドバー名前
  │   ├─ 80ms:  肩書き
  │   ├─ 160ms: プロフィール写真
  │   ├─ 240ms: メインコンテンツ
  │   ├─ 320ms: ...
  │   └─ 順番にすべて切り替わる
  │
  └─ 各要素のアニメーション (0.5s):
      ├─ 前半: 現在のコンテンツが rotateX(0→90deg) + opacity(1→0)
      └─ 後半: 新しいコンテンツが rotateX(-90→0deg) + opacity(0→1)
```

### CSS アニメーション詳細

```css
/* パタパタ（split-flap）アニメーション */
.swap-container {
  perspective: 600px;
  position: relative;
}

.persona-content {
  transition: opacity 0.25s, transform 0.25s;
  transform-origin: center center;
  backface-visibility: hidden;
}

/* 非アクティブなペルソナのコンテンツ */
[data-persona="textile"] .persona-content[data-persona="manga"],
[data-persona="manga"] .persona-content[data-persona="textile"] {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  transform: rotateX(90deg);
  pointer-events: none;
}

/* パタパタ実行中のクラス */
.swap-container.flipping .persona-content {
  animation: flipOut 0.25s ease-in forwards;
}
.swap-container.flip-in .persona-content {
  animation: flipIn 0.25s ease-out forwards;
}

@keyframes flipOut {
  from { opacity: 1; transform: rotateX(0deg); }
  to   { opacity: 0; transform: rotateX(90deg); }
}

@keyframes flipIn {
  from { opacity: 0; transform: rotateX(-90deg); }
  to   { opacity: 1; transform: rotateX(0deg); }
}
```

### 回転ボタン CSS

```css
.persona-switch-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.persona-switch-btn:hover {
  transform: rotate(180deg);
}

.persona-switch-btn.switching {
  animation: spin360 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes spin360 {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* アクセシビリティ: モーション軽減 */
@media (prefers-reduced-motion: reduce) {
  .persona-switch-btn,
  .persona-content,
  .swap-container * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 参考事例・リソース

### 実在の参考サイト

| サイト | 特徴 |
|---|---|
| **Olivier Ifrah's Portfolio** | 「Work」と「Play」のトグル切替。レイアウトは同一、コンテンツのみ入替。**最も近い実例** |
| **Lynn Fisher (lynnandtonic.com)** | ブラウザ幅に応じてデザインが変形するクリエイティブポートフォリオ |
| **Cyd Stumpel (Awwwards SOTD 2025)** | CSS View Transitions API による劇的なページ遷移 |

→ デュアルペルソナの完全切替サイトは非常にレア。**差別化の強い要素になる**。

### アニメーション実装の選択肢

| 手法 | 適性 | 備考 |
|---|---|---|
| **CSS 3D Card Flip** | ★★★ | `perspective` + `rotateX/Y` + `backface-visibility`。依存なし |
| **View Transitions API** | ★★★ | ブラウザネイティブ。Astro 組み込みサポートあり。85%+カバレッジ(2025時点) |
| **Split-Flap ライブラリ** | ★★☆ | [HotFX Split Flap](https://fx.hot.page/split-flap)(Web Component), [masteryder/splitflap](https://github.com/masteryder/splitflap)(vanilla JS) |
| **GSAP Flip Plugin** | ★★☆ | FLIP原則で高品質。ただしライブラリ追加が必要 |
| **CSS content-visibility** | ★★☆ | 非表示ペルソナを `content-visibility: hidden` にすると再表示が高速 |

### 推奨スタック（リサーチ結論）

1. **メイン**: CSS 3D Flip（`rotateX` + `backface-visibility`）でパタパタ演出
2. **強化**: View Transitions API を `document.startViewTransition()` でラップ（対応ブラウザで高品質化、非対応は自動フォールバック）
3. **状態管理**: Vanilla JS + localStorage + `data-persona` 属性（Astro SSG に最適）
4. **パフォーマンス**: 非アクティブペルソナ画像は `data-src` で遅延読み込み、`requestIdleCallback` でプリロード

### View Transitions API 統合コード例

```javascript
// View Transitions API 対応ブラウザで自動的に高品質トランジション
document.querySelector(".persona-switch-btn").addEventListener("click", () => {
  const next = document.documentElement.dataset.persona === "textile" ? "manga" : "textile";

  if (document.startViewTransition) {
    document.startViewTransition(() => {
      document.documentElement.dataset.persona = next;
      localStorage.setItem("persona", next);
    });
  } else {
    // フォールバック: CSS アニメーションのみ
    document.documentElement.dataset.persona = next;
    localStorage.setItem("persona", next);
  }
});
```

```css
/* View Transitions カスタムアニメーション */
::view-transition-old(hero-image) {
  animation: flip-out 0.4s ease-in forwards;
}
::view-transition-new(hero-image) {
  animation: flip-in 0.4s ease-out 0.4s forwards;
}
```

### 詳細リファレンス

- [MDN - View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Astro - View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [Desandro - CSS 3D Transforms: Card Flip](https://3dtransforms.desandro.com/card-flip)
- [W3Schools - Flip Card](https://www.w3schools.com/howto/howto_css_flip_card.asp)
- [GSAP Flip Plugin](https://gsap.com/docs/v3/Plugins/Flip/)
- [web.dev - content-visibility](https://web.dev/articles/content-visibility)
- [CodePen - Split Flap Display](https://codepen.io/branlok/pen/qBQEGJy)
- [CodePen - CSS Card Flip](https://codepen.io/gregh/pen/PWozML)

---

## MicroCMS 対応方針

### 方式: global_settings にマンガ用フィールドを追加

既存の `global_settings`（オブジェクト型）に `manga_` プレフィックス付きフィールドを追加する。

```
既存フィールド (textile)         追加フィールド (manga)
─────────────────────────────    ─────────────────────────────
artist_name                  →  manga_artist_name
artist_subtitle              →  manga_artist_subtitle
hero_image                   →  manga_hero_image
profile_image                →  manga_profile_image
about_text                   →  manga_about_text
about_subtitle               →  manga_about_subtitle
cv_list                      →  manga_cv_list
statement                    →  manga_statement (任意)
```

### Works / News / Projects の扱い

**Phase 5 以降で検討。選択肢:**

| 方式 | メリット | デメリット |
|---|---|---|
| A. 既存APIに `persona` フィールド追加 | API数が増えない | フィルタリングが必要 |
| B. 別APIを新設 (`manga_works` 等) | 完全に独立管理 | API数が増える (無料プラン制限) |
| C. マンガ側は Works/Projects なし | 最もシンプル | コンテンツが限定される |

→ まずは **方式C**（グローバル設定のみ切替）で始め、必要に応じて拡張。

---

## 実装フェーズ

### Phase 1: 回転ボタン設置 + 状態管理基盤

**目標**: ボタンが表示され、クリックで回転し、状態が切り替わる（見た目の変化はまだなし）

**対象ファイル**:
- `src/layouts/BaseLayout.astro` — ボタンHTML + FOUC防止スクリプト追加
- `src/styles/global.css` — ボタン + アニメーションCSS追加

**実装内容**:
1. `<head>` 内に `is:inline` スクリプト追加（localStorage → data-persona）
2. `<body>` 末尾に固定位置の切替ボタン追加
3. ボタンクリック時:
   - ボタンが360°回転
   - `data-persona` をトグル
   - `localStorage` に保存
   - `aria-label` を動的更新
4. ボタンのCSS（固定位置、回転アニメーション、ホバー、reduced-motion）

**確認ポイント**:
- [ ] ボタンが右上に表示される
- [ ] クリックでくるりん回転する
- [ ] DevTools で `<html data-persona="manga">` に切り替わる
- [ ] ページリロードしても状態が保持される
- [ ] モバイルでもボタンが表示される（MobileHeaderと干渉しない）

---

### Phase 2: Sidebar / MobileHeader のコンテンツ切替

**目標**: 名前・肩書き・写真がパタパタとアニメーション付きで切り替わる

**対象ファイル**:
- `src/components/Sidebar.astro` — デュアルコンテンツ + swap-container
- `src/components/MobileHeader.astro` — 同上
- `src/styles/global.css` — パタパタアニメーションCSS
- `src/lib/microcms.ts` — （Phase 5 まではハードコード仮データ）

**実装内容**:
1. Sidebar の名前表示部分を `swap-container` でラップ
   ```html
   <div class="swap-container">
     <span class="persona-content" data-persona="textile">{settings.artist_name}</span>
     <span class="persona-content" data-persona="manga">田中優菜</span>  <!-- 仮 -->
   </div>
   ```
2. 肩書き、写真も同様にデュアル化
3. パタパタCSS アニメーション実装
4. ボタンクリック時のスタガードJS追加
5. MobileHeader にも同様の対応

**確認ポイント**:
- [ ] 名前がパタパタとめくれて切り替わる
- [ ] 肩書きが少し遅れてパタパタ
- [ ] 写真も切り替わる
- [ ] アニメーションが自然に見える

---

### Phase 3: トップページ（index.astro）の切替

**目標**: Hero画像、About、各セクションが順番にパタパタと切り替わる

**対象ファイル**:
- `src/pages/index.astro`
- `src/components/HeroSection.astro` — Hero画像デュアル化
- `src/components/AboutSection.astro` — プロフィール画像+テキストデュアル化
- `src/components/NewsSection.astro` — セクション見出し程度
- `src/components/WorksSection.astro` — 同上
- `src/components/ResearchSection.astro` — 同上

**実装内容**:
1. HeroSection: 2つの hero_image を配置、切替アニメーション
2. AboutSection: プロフィール画像 + about_text の切替
3. 各セクション: まずは見出しサブテキストの切替程度
4. スタガードアニメーションの調整（セクション単位で順番にパタパタ）

**確認ポイント**:
- [ ] Hero画像が切り替わる
- [ ] About セクションの画像・テキストが切り替わる
- [ ] 上から順に連鎖的にパタパタする
- [ ] スクロール位置が保持される

---

### Phase 4: 下層ページ + Footer の切替

**目標**: about.astro、contact.astro、Footer の切替

**対象ファイル**:
- `src/pages/about.astro` — プロフィール画像、自己紹介文、CV
- `src/pages/contact.astro` — 連絡先テキスト
- `src/components/Footer.astro` — 著作権表記
- `src/components/FooterMinimal.astro` — 同上

**実装内容**:
1. about.astro: profile_image, artist_name, about_text, cv_list のデュアル化
2. contact.astro: contact_description のデュアル化
3. Footer: copyright_text のデュアル化
4. ナビラベルの変更検討（「作品」→「漫画」等、必要であれば）

**確認ポイント**:
- [ ] About ページで切り替えが動作する
- [ ] Contact ページで切り替えが動作する
- [ ] Footer の著作権表記が切り替わる
- [ ] ページ遷移後も選択したペルソナが維持される

---

### Phase 5: MicroCMS 連携

**目標**: ハードコード仮データを CMS データに差し替え

**対象ファイル**:
- MicroCMS 管理画面 — `global_settings` にフィールド追加
- `src/types/microcms.ts` — 型定義に manga_ フィールド追加
- `src/lib/microcms.ts` — （変更不要、既存の getGlobalSettings で取得可能）
- 各コンポーネント — 仮データを `settings.manga_xxx` に差し替え

**MicroCMS 追加フィールド一覧**:
| フィールドID | 表示名 | 種類 |
|---|---|---|
| `manga_artist_name` | 漫画ペルソナ名前 | テキスト |
| `manga_artist_subtitle` | 漫画ペルソナ肩書き | テキスト |
| `manga_hero_image` | 漫画ヒーロー画像 | 画像 |
| `manga_profile_image` | 漫画プロフィール画像 | 画像 |
| `manga_about_text` | 漫画About文 | リッチエディタ |
| `manga_about_subtitle` | 漫画Aboutサブタイトル | テキスト |
| `manga_cv_list` | 漫画CV/経歴 | リッチエディタ |

**確認ポイント**:
- [ ] MicroCMS からデータが正しく取得される
- [ ] 型エラーがない
- [ ] CMS でコンテンツ更新 → 自動デプロイ → 反映される

---

### Phase 6: 仕上げ・最適化

**目標**: パフォーマンス、アクセシビリティ、デザインの仕上げ

**実装内容**:

1. **カラーテーマ切替**（任意）
   - 染織: 現在の `primary: #0505c7`（ブルー）
   - 漫画: 別の primary カラー（例: ピンク、オレンジ等）
   - CSS カスタムプロパティで切替
   ```css
   [data-persona="textile"] { --color-primary: #0505c7; }
   [data-persona="manga"]   { --color-primary: #e84393; }
   ```

2. **画像遅延読み込み**
   - マンガ側の画像は初期表示不要なので `loading="lazy"` 確保
   - ボタンホバー時にプリロード開始

3. **アクセシビリティ**
   - `aria-label` 動的更新（「エッセイ漫画モードに切り替え」⇔「染織造形モードに切り替え」）
   - `prefers-reduced-motion` 対応（アニメーション無効化）
   - キーボード操作対応（Tab + Enter）

4. **Works / News / Projects の拡張**（任意）
   - マンガ側にもコンテンツを表示する場合の方針決定
   - CMS API 追加 or フィルタリング

5. **ページタイトル (`<title>`) 切替**
   - 染織: `田中優菜 Yuna Tanaka | 染織造形作家`
   - 漫画: `田中優菜 Yuna Tanaka | エッセイ漫画作者`
   - JS で動的に書き換え

6. **テスト**
   - 全ページで切替動作確認
   - モバイル / デスクトップ両方で確認
   - ダークモードとの共存確認
   - 複数ブラウザで動作確認

---

## ファイル変更一覧（全Phase合計）

| ファイル | Phase | 変更内容 |
|---|---|---|
| `src/layouts/BaseLayout.astro` | 1 | ボタン追加、FOUC防止スクリプト |
| `src/styles/global.css` | 1,2 | ボタンCSS、パタパタアニメーション |
| `src/components/Sidebar.astro` | 2 | デュアルコンテンツ化 |
| `src/components/MobileHeader.astro` | 2 | デュアルコンテンツ化 |
| `src/components/HeroSection.astro` | 3 | Hero画像デュアル化 |
| `src/components/AboutSection.astro` | 3 | プロフィールデュアル化 |
| `src/components/NewsSection.astro` | 3 | 見出し切替（軽微） |
| `src/components/WorksSection.astro` | 3 | 見出し切替（軽微） |
| `src/components/ResearchSection.astro` | 3 | 見出し切替（軽微） |
| `src/pages/index.astro` | 3 | （コンポーネント経由で対応） |
| `src/pages/about.astro` | 4 | プロフィール・CVデュアル化 |
| `src/pages/contact.astro` | 4 | 連絡先テキストデュアル化 |
| `src/components/Footer.astro` | 4 | 著作権テキストデュアル化 |
| `src/components/FooterMinimal.astro` | 4 | 著作権テキストデュアル化 |
| `src/types/microcms.ts` | 5 | manga_ フィールド型追加 |
| `tailwind.config.mjs` | 6 | カラーテーマ追加（任意） |

---

## リスクと対策

| リスク | 対策 |
|---|---|
| FOUC（切替前の一瞬チラつき） | `<head>` 内 `is:inline` スクリプトで即座にセット |
| 画像読み込みによるレイアウトシフト | 両ペルソナで同じアスペクト比を維持、`width`/`height` 属性指定 |
| MicroCMS 無料プラン API数制限 | 既存 `global_settings` にフィールド追加（新API不要） |
| ダークモードとの干渉 | `data-persona` と `dark:` クラスは独立動作、競合しない |
| SEO への影響 | デフォルトは textile（検索エンジンは textile 版をインデックス） |
| モバイルでのボタン位置 | MobileHeader の z-index と調整、十分な余白確保 |

---

## 未決定事項（要相談）

1. **マンガペルソナの肩書き**: 「エッセイ漫画作者」で確定？
2. **マンガ側の仮コンテンツ**: Phase 1-4 で使う仮テキスト・仮画像
3. **カラーテーマ**: マンガ側の primary カラーを変えるか？変えるなら何色？
4. **ナビラベル**: マンガ側で「作品」→「漫画作品」等に変更するか？
5. **Works/News/Projects**: マンガ側にも独自コンテンツを持たせるか？
6. **ボタンのアイコン**: Material Symbols `autorenew`（回転矢印）or カスタムアイコン？
7. **切替ボタンの表示テキスト**: アイコンのみ？ツールチップ付き？

---

## スケジュール目安

| Phase | 内容 | 規模 |
|---|---|---|
| Phase 1 | ボタン + 状態管理 | 小 |
| Phase 2 | Sidebar / MobileHeader | 中 |
| Phase 3 | トップページ | 中 |
| Phase 4 | 下層ページ + Footer | 中 |
| Phase 5 | MicroCMS 連携 | 中 |
| Phase 6 | 仕上げ・最適化 | 小〜大（範囲による） |
