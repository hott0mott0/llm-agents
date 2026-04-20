# 賃貸調査くん (chintai-investor)

SUUMOから条件に合う賃貸物件を調査し、前回との差分があればSlackに通知するスキル。

## 処理フロー

1. **SUUMO で物件検索** — Playwright CLI を使ってスクレイピング
2. **結果を markdown に出力** — `results/` ディレクトリに保存
3. **差分チェック & Slack 通知** — 前回結果と比較し、差分があれば通知

---

## 1. 物件検索条件

| 項目 | 条件 |
|------|------|
| 最寄り駅 | 中野駅 **または** 東横線 渋谷駅〜自由が丘駅の間 |
| 家賃上限 | 23万円 |
| 間取り | 1LDK |
| 築年数 | 20年以内 |
| 部屋の向き | 南 または 東 |

## 2. SUUMO スクレイピング (Playwright CLI)

- Playwright CLI (`npx playwright`) を使用して SUUMO の検索ページを操作する
- 検索条件をフォームに入力し、検索結果一覧から各物件の情報を取得する
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

## 3. 結果出力

- 出力先: `results/chintai_latest.md`
- 前回結果のバックアップ: `results/chintai_previous.md`
- フォーマット: 物件ごとにテーブルまたはリスト形式で一覧化

## 4. 差分チェック & Slack 通知

### 差分チェック
- `results/chintai_previous.md` と `results/chintai_latest.md` を比較
- 新規物件・掲載終了物件を検出

### Slack 通知
- **通知先**: Hottomo-dev ワークスペース `#chintai-search` チャンネル
- **通知方法**: Incoming Webhook
- **Webhook URL**: 環境変数 `SLACK_INCOMING_WEBHOOK_URL` から取得
- **メンション**: `<@U014J1UDMD3>` をメッセージに含める
- **通知内容**:
  - 新着物件の一覧（物件名・家賃・最寄り駅・URL）
  - 掲載終了物件の一覧
  - 差分がない場合は通知しない
