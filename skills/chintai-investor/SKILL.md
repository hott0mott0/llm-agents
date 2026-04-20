---
name: chintai-investor
description: SUUMOから条件に合う賃貸物件を調査し、前回との差分があればSlackに通知するスキル。
metadata:
    github-path: skills/chintai-investor
    github-ref: refs/heads/main
    github-repo: https://github.com/hott0mott0/chintai-investor
    github-tree-sha: 3420a5324962a513aede31b8bfd9d020456965b7
---

# 賃貸調査くん (chintai-investor)

SUUMOから条件に合う賃貸物件を調査し、前回との差分があればSlackに通知するスキル。

## 処理フロー

1. **SUUMO で物件検索** — Playwright CLI を使ってスクレイピング
2. **結果を markdown に出力** — `results/` ディレクトリに保存
3. **差分チェック & Slack 通知** — 前回結果と比較し、差分があれば通知

---

## 0. 前提条件
- Node.js, direnv と Playwright CLI がインストールされていること
- SUUMO のサイト構造が大幅に変わっていないこと
- `direnv allow .` コマンドで環境変数を読み込むこと

## 1. 物件検索条件

| 項目 | 条件 |
|------|------|
| 最寄り駅 | 中野駅 **または** 東横線 渋谷駅〜自由が丘駅の間 |
| 家賃上限 | 23万円 |
| 間取り | 1LDK |
| 築年数 | 20年以内 |
| 部屋の向き | 南 または 東 |

## 2. SUUMO スクレイピング (Playwright CLI)

- Playwright CLI を使用して SUUMO を開く
- ただし、毎回フォームを手操作するのではなく、まず駅ページから検索 URL を固定化する
- 検索結果一覧から候補を取り、向きは詳細ページで補完確認する
- 取得する物件情報:
  - 物件名
  - 住所
  - 最寄り駅・徒歩分数
  - 家賃（管理費含む）
  - 間取り・専有面積
  - 築年数
  - 階数
  - 部屋の向き
  - 物件URL

### 最短手順

1. Playwright CLI の起動確認
   - まず `playwright-cli --help` が通ることを確認する
   - sandbox 制約で失敗する場合は、`playwright-cli` を昇格実行する
   - SUUMO 調査では `npx playwright` よりグローバル `playwright-cli` を優先する

2. 対象駅ページを開く
   - まず駅ごとの SUUMO ページを開く
   - 例: 中野駅は `https://suumo.jp/chintai/tokyo/ek_27280/`
   - 以前誤って別駅コードを踏んだため、ページタイトルで駅名を必ず確認する

3. 高度条件は UI 手入力より DOM / URL を優先する
   - `さらに条件を追加する` を開く
   - `eval` / `run-code` でフォーム内の field 名と value を確認する
   - 例:
     - 家賃上限: `ct=23.0`
     - 管理費込み: `co=1`
     - 1LDK: `md=04`
     - 築20年以内: `cn=20`
     - 南向き: `tc=0400104`
   - SUUMO の lightbox は通常 click / check が overlay に阻害されやすいので、条件が分かったら URL を直接組む

4. 検索 URL を固定化する
   - 一度遷移できた検索結果 URL を次回以降の baseline として使う
   - 中野駅の確定済み URL:
     - `https://suumo.jp/jj/chintai/ichiran/FR301FC001/?ar=030&bs=040&pc=20&smk=&po1=25&po2=99&shkr1=03&shkr2=03&shkr3=03&shkr4=03&rn=0305&ek=030527280&ra=013&cb=0.0&ct=23.0&co=1&md=04&et=9999999&mb=0&mt=9999999&cn=20&fw2=`
   - 次回以降はこの URL に直接 `goto` して一覧取得から始めてよい

5. 一覧から候補を取る
   - `div.cassetteitem` ごとに以下を取得する
     - 物件名
     - 住所
     - アクセス
     - 築年数
     - 各部屋の賃料
     - 間取り
     - 専有面積
     - 詳細 URL
   - 一覧だけでは向きが不足するため、最終判定はしない

6. 向きは詳細ページで確認する
   - 東向き / 南向きは一覧フィルタで完全には拾えない
   - 各候補の詳細ページを開いて `向き` を確認し、最終候補だけ残す
   - 実測では北向き・西向き物件が一覧に残るため、この確認は必須

### 実行メモ

- `run-code` は `async page => { ... }` 形式で渡す
- 複雑な one-liner は shell quote で壊れやすいので、`tmp/*.js` に保存して `playwright-cli -s=<session> run-code --filename=<file>` を使う
- `eval` は DOM の状態確認に向いている。`document.querySelector(...)` の結果から field 名や option value を取る
- Playwright の `click` / `check` が lightbox overlay に阻害される場合は、DOM から value / checked をセットして検索 URL を確定する方が速い
- 初回 run は `chintai-results/***/chintai_latest.md` を baseline として保存し、次回から `chintai-results/***/chintai_previous.md` との差分比較に入る

## 3. 結果出力

- 出力先(中野駅): `chintai-results/nakano/chintai_latest.md`
- 出力先(東横線): `chintai-results/toyoko/chintai_latest.md`
- 前回結果のバックアップ(中野駅): `chintai-results/nakano/chintai_previous.md`
- 前回結果のバックアップ(東横線): `chintai-results/toyoko/chintai_previous.md`
- フォーマット: 物件ごとにテーブルまたはリスト形式で一覧化

## 4. 差分チェック & Slack 通知

### 差分チェック
- `chintai-results/nakano/chintai_previous.md` と `chintai-results/nakano/chintai_latest.md` を比較
- `chintai-results/toyoko/chintai_previous.md` と `chintai-results/toyoko/chintai_latest.md` を比較
- 新規物件・掲載終了物件を検出

### Slack 通知
- **通知方法**: Incoming Webhook
- **Webhook URL**: 環境変数 `SLACK_INCOMING_WEBHOOK_URL` から取得
- **メンション**: `<@U014J1UDMD3>` をメッセージに含める
- **通知内容**:
  - 新着物件の一覧（物件名・家賃・最寄り駅・URL）
  - 掲載終了物件の一覧
  - 差分がない場合は通知しない
