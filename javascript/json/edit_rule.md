# page.json 編集ルール

## 基本方針

* 既存データの記述方式を優先して踏襲する
* 同系統ページの事例を必ず確認してから編集する

## books.json

* page.jsonに追加する書籍が books.json に存在しない場合は先に登録する
* IDや分類は近い事例に合わせる

## 日本語名(name\_jp)

* Limbus Company または Library of Ruina に公式日本語名が存在する場合はそれを採用する

### 参照サイト
Library of ruina
* https://tiphereth.zasz.su/

Library of ruina (JP)
* https://appmedia.jp/lor/78058895

Limbus Company (EN)
* https://soshage.com/limbus/

Limbus Company (JP)
* https://soshage.com/limbus/ja/

参照サイト先で検索をする際は、https://tiphereth.zasz.su/であればhttps://tiphereth.zasz.su/cards/?qn=exampleのような形でサイト内検索する。
https://soshage.com/limbus/ではサイト内検索ができない。


参照サイトで表層ウェブ検索をする際は、"name\_en"+"LOR"で検索する。(結果例:https://tiphereth.zasz.su/cards/501004/)
類似のページが存在しなかった場合は"name\_en"+"Limbus Company"で検索する。(結果例:https://soshage.com/limbus/skill/1040203)

LOR->Limbusへ検索を移行する目安は大体3~4回程度で。(無限ループ防止措置)
### 例

Extreme Edge

* 英語名:
https://tiphereth.zasz.su/cards/501002/

Catch Breath

* 英語名:
https://soshage.com/limbus/skill/1040203
* 日本語名:
https://soshage.com/limbus/ja/skill/1040203
* 採用名:スワッシュ

## combat\_module と status

新規効果を発見した場合

### status

* アイコンが存在するもの
* status.jsonへ追加

### combat\_module

* アイコンが存在しないもの
* combat\_module.jsonへ追加

## 編集対象

* javascript/json/book\_page/page.json
* javascript/json/book\_page/books.json
* javascript/json/combat\_module.json
* javascript/json/status.json

## 作業手順

1. page.jsonを編集
2. books.jsonに存在確認
3. name\_jpを参考サイトで確認
4. status/combat\_module確認
5. 必要なら不足データ追加
6. 既存形式と整合性チェック

## 新規追加データ

### combat\_module.json
* sloth_resonance (怠惰共鳴)
* envy_resonance (嫉妬共鳴)

### status.json
* ahn (アーン - 通貨)
* scorch_propellant_round (焼夷推進弾)
* tigermark_round (タイガーマーク弾)
* savage_tigermark_round (サベッジタイガーマーク弾)

### books.json
* capo (カポの本)
* thumb (親指の本)
* middle (ミドル協会の本)

### page.json
* capo セクション (4ページ)
* thumb セクション (5ページ)
* middle セクション (4ページ)

