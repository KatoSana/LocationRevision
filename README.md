# LocationRevision

LocationRevisiomは鳥取大学工学部にて研究・開発が行われている障がい者支援施設向け見守りシステムの機能の一つです。
TrackingSystemの動作環境前提です。新しい環境で導入する際はTrackingSystemを先に導入してください。

## Running
ルートディレクトリに以下のように.envファイルを作成してください。
このとき、設定はTrackingSystemに合わせてください（同一のDBを使用するため）
ReadMe作成時点では.envもCodeにありますが削除予定です。

```dotenv
# 実行するポート設定
PORT = 3000  #設定しなければデフォルトで3000番ポートで実行されます

# mongoDB設定
DB_NAME = tracking #利用するmongoDB名
DB_URL = mongodb://localhost:27017/ #利用するmongoDBのアドレス

# MongoExpress(DBViewer)の設定
MONGO_EXPRESS_AVAILABLE = 1 #Viewerを有効化するかどうか
ME_CONFIG_MONGODB_AUTH_DATABASE = tracking #Viewerが参照するDB名(システム本体の利用するDBと同一)
ME_CONFIG_BASICAUTH_USERNAME = tracking #Viewerにアクセスする際のユーザー名
ME_CONFIG_BASICAUTH_PASSWORD = fugafuga #Viewerにアクセスする際のPW
```

上記の設定ファイルは一例です。適宜書き換えて利用してください。
そして以下のコマンドで依存ライブラリのインストールと実行を行ってください。

```npm
npm install
node index.js
```

## Compatibility
TrackingSystemで下記ファイルに変更があった場合はLocationRevisionでも変更を適用してください。
+ Tracker/TrackerRepository.js
+ DetectionData/DetectionDataRepository.js
+ Location/LocationRepository.js
+ FixMapLocation/FixMapLocationRepository
+ Map/MapRepository.js
