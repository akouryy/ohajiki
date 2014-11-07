# イベント一覧

socket.ioで通信するイベントの一覧です。

## server.js → monitor.js ##

### entry

```
entry :: ()
```

`entry`は、新規ゲームが開始しプレーヤーが募集されるときに発生するイベントです。
*最初(1回目)の募集でもこのイベントは発生します*。


### start

```
start :: ()
```

`start`は、プレーヤーの募集が終了し競技が開始されるときに発生するイベントです。


### result

```
result :: [int]
```

`result`は、競技が終了し結果画面が表示されるときに発生するイベントです。
情報に含まれる`int`は`score`を表します。


### reconnect

```
reconnect :: [{stones: [{sid: int, x: float, y: float}], stoneCount: int(0..StoneMax)}]
```

`reconnect`は、`monitor.js`が再接続されるときに発生するイベントです。
なお情報に`uid`は含まれていないため、`monitor.js`は独自に`uid`を計算する必要があります。
`stones`は、消滅していない石の情報のみ持ちますが、`stoneCount`は消滅した石も含めた数を返します。
*ただし、ユーザーの募集中(`entry`と`start`の間)にはこのイベントは発生しません*。


### setPlayer

```
setPlayer :: int(0...UserMax)
```

`setPlayer`は、新たなプレーヤー(人間)が参加したときに発生するイベントです。
情報に含まれる`int`は`uid`を表します。


### unsetPlayer

```
unsetPlayer :: int(0...UserMax)
```

`unsetPlayer`は、プレーヤー(人間)がゲームをやめたときに発生するイベントです。
情報に含まれる`int`は`uid`を表します。


### addStone

```
addStone :: {uid: int(0...UserMax), sid: int(0...StoneMax), x: float, y: float}
```

`addStone`は、新たな石を追加するときに発生するイベントです。


### moveStones

```
moveStones :: [[{sid: int(0...StoneMax), x: float, y: float}]]
```

`moveStones`は、石が移動するときに発生するイベントです。
移動しない石の情報は送信されません。
なお情報に`uid`は含まれていないため、`monitor.js`は独自に`uid`を計算する必要があります。


### deleteStones


```
deleteStones :: [[int(0...StoneMax)]]
```

`deleteStones`は、石が消滅するときに発生するイベントです。
消滅しない石の情報は送信されません。
情報に含まれる`int`は`sid`を表します。
なお情報に`uid`は含まれていないため、`monitor.js`は独自に`uid`を計算する必要があります。


### collided

```
collided :: [{u1id: int(0...UserMax), s1id: int(0...StoneMax), u2id: int(0...UserMax), s2id: int(0...StoneMax), x: float, y: float}]
```

`collided`は、石が衝突するときに発生するイベントです。
衝突しない石の情報は送信されません。
`x`および`y`は衝突時の中心どうしの中点の座標を示します。


### tick

```
tick :: int(0...TimeLimit)
```

`tick`は、1秒ごとに発生するイベントです。
情報に含まれる`int`は`sec`を表します。
`sec`は59から始まって1で終わります。



## monitor.js → server.js ##

## server.js → client.js ##

### start

```
start :: ()
```

`start`はゲーム開始時に発生するイベントです。
全てのクライアントに対して送信されます。

### allowShot

```
allowShot :: ()
```

`allowShot`はクライアント側からの`shot`イベントを受け付けられる状態になると発生するイベントです。
主に、クライアント側の石の表示に用います。
なお、allowShotが発生していない状態での`shot`イベントは全て無効です。

### timeup

```
timeup :: ()
```

`timeup`はゲーム終了時に発生するイベントです。
全てのクライアントに対して送信されます。

### responce

```
responce :: {result: true, state: FieldStates, id: int}
          | {result: false, message: string}
```

`responce`は、参加リクエストに対する応答イベントです。
`result`が`true`の時、
`state: FieldStates`は、`entry`(受付状態)、`playing`(ゲーム中)、`result`(結果発表中)のどれかを指し、
`id: int`はクライアント側に、自分のプレイヤー番号を伝えます。

## client.js → server.js ##

### establish

```
establish :: ()
```

`establish`は参加リクエストを送信するイベントです。

### shot

```
shot :: {speed: [x: int, y: int]}
```

`shot`は、ゲーム中に石を投げた時に発生するイベントです。
