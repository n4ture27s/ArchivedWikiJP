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
* https://limbuscompany.fandom.com/wiki/
* https://www.prydwen.gg/limbus-company/

Limbus Company (JP)
* https://soshage.com/limbus/ja/
* https://gamerch.com/limbuscompany/634425/
* https://wiki3.jp/limbus_company/
* https://wikiwiki.jp/lcbwiki/（人格/囚人名/黒雲会若衆 等で各人格のスキル日本語名を確認可能）

基本的にidentity(人格)、enemy(敵)、skill(スキル)にname_enを当てはめて検索する。
サイト内検索は一気に読み込むと容量制限でエラーが出ることがあるため、少しずつ行うこと。
参照サイト先で検索をする際は、https://tiphereth.zasz.su/であれば「https://tiphereth.zasz.su/cards/?qn=検索したいname_en」のような形でサイト内検索する。
https://soshage.com/limbus/ならスキル名はhttps://soshage.com/limbus/skill、人格ならhttps://soshage.com/limbus/identityを読み込んで検索する。
tiphereth.zasz.suのカード詳細ページ(例: /cards/406006/)では左上の言語切替(EN/KR/JP)で日本語名(KR:韓国語名/JP:日本語名)が確認可能。
tiphereth.zasz.suのカード一覧(/cards/)では?qn=クエリでカード名検索可能（例: /cards/?qn=inhale）。検索結果のカードはJPタブ選択で日本語名が表示される。

### かならずLORとLimbus Companyの両方で検索すること!特にLimbus Company側は調べ不足が目立つので注意!

参照サイトで表層ウェブ検索をする際は、"検索したい名前"+"LOR"で検索する。(結果例:https://tiphereth.zasz.su/cards/501004/)
類似のページが存在しなかった場合は"検索したい名前"+"Limbus Company"で検索する。(結果例:https://soshage.com/limbus/skill/1040203)
### 例

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
* kurokumo セクション (7ページ)

### books.json
* kurokumo (黒雲会の本)

### status.json
* value_down (ダイス値減少)

### combat_module.json
* combo_starter (コンボ始動)
* combo_extender (コンボ継続)

## 確定LC公式日本語名
* Cloud Cutter → 雲の切開 (ホンルS2)
* Shadowcloud Shattercleave → 墨雲裂割 (グレゴールS3)
* Sky-clearing Cut → 快刀乱麻 (ロージャS3、tanglecleaver_flurryで既使用だが、そのまま使用。)

## 確定LoR公式日本語名 (tiphereth.zasz.su)
* Inhale → 煙吹かし (507003)
* Exhale Smoke → 噴煙 (615006)
* Loss of Senses → 感覚喪失 (507007)

### books.json
* smiling_faces (笑う顔たちの本)

### page.json
* smiling_faces セクション (3ページ)

## 括弧表記→テンプレート変換ルール (Index系ページの修正で発見)

Archived Wikiの英語ページでは `[Keyword]` 括弧表記が使われているが、page.jsonでは `{keyword}` テンプレート構文に変換する必要がある。

### 対応表
| Wiki表記 | JSONテンプレート | 備考 |
|---|---|---|
| `[Singleton]` | `{singleton}` | デッキ内全ページが異なるLight Costの条件 |
| `[Multihit]` | `{multi_hit}` | 複数回ヒット |
| `[On Last Hit]` | `{on_last_hit}` | マルチヒットの最終ヒット時 |
| `[Knockback]` | `{knock_back}` | ノックバック（combat_moduleのキーに合わせる） |
| `[Frame Three]` | `{frame_three}` | 3フレーム目実行（遅延大） |
| `[Combo Starter]` | `{combo_starter}` | コンボ始動 |
| `[When Hit]` | `{when_hit}` | 攻撃被弾時 |
| `[On Use]` | `{on_use}` | 使用時 |
| `[On Hit]` | `{on_hit}` | 的中時 |

### プレフィックス「If」の削除
`[Singleton]`の条件文で英語Wikiに`If [Singleton]`と書かれていても、日本語訳では`{singleton}が有効な場合、`とし、先頭の`If`は不要。

### 「Light Costが[X~Y]に変化」の解釈
Index系ページのSingleton条件において「Light Cost become [8~11]」は、**ダイスのダメージ値が変化**することを意味する（Light Costそのものが変わるわけではない）。正しくは`[8~11]に変化`と記述する。

### デバフ付与の表記統一
* `{keyword}を得る` → 自身へのバフ・リソース獲得
* `{keyword}を付与` → 対象へのデバフ付与（rupture, bleed, burn, tremor, sinking等）
Index系ページでは誤って`{rupture}3を得て`と書かれている箇所があるので、`{rupture}3を付与`に修正する。

### Archived Wikiのページデータ読み取り方
* ページの生テキストを表示（View source）またはテキスト形式で取得すると、各ダイスの範囲や効果が確認できる
* 同一行内に複数の`[Keyword]`が連続する場合があるので、すべて漏れなく`{keyword}`に変換する
* `[Multihit] N Times [X~Y] Damage`構造の場合、`{multi_hit}N回 [X~Y] {damage_type}`に変換する











# table_data.json 編集ルール
table_data.json は、特性やオリジンの選択肢、効果などを表形式で管理するためのファイルです。
column と trait で構成されています。
column は、表の列を定義します。
traitsやoriginsは、表の内容を定義します。
それぞれ他の書式を参考にして、翻訳してください。
columnは既に定義されている場合は、その名前をそのまま使用してください。定義されていない場合は、新しいcolumnを追加してください。
