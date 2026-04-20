# 賃貸調査くんの要件

- 以下の条件に合う物件を SUUMO で調査する。
  - 最寄り駅が「中野駅」 or 「東横線 渋谷駅〜自由が丘駅の間」
  - 家賃の上限は23万
  - 間取りは1LDK
  - 築年数は20年以内
  - 部屋の向きは 南 or 東向きのみ
- SUUMO の調査には Playwrite CLI Skill を用いる
- 調査結果は markdown ファイルにまとめる
- 前回調査の markdown ファイルと差分がある場合、Slack に通知する
  - Slack API を呼び出して、Http リクエストで Hottomo-dev ワークスペースの #idea-board チャンネルに通知する
