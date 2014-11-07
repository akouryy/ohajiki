# NPCA Curling

2014年文化祭展示

## 処理の流れ

```
    |      |
    |      v
    |    entry <------------------------------------------------
    |      |                                                   |
    |      v                                                   |
    |    start                                                 |
    |      |                                                   |
    |      v                                                   |
    |      |<------------------------------------------------  |
    |      |                                                |  |
reconnect  |----------|------------|-----------|-------|    |  |
    |      |          |            |           |       |    |  |
    |   addStone  moveStones  deleteStones  collided  tick  |  |
    |      |          |            |           |       |    |  |
    |      v          v            v           v       v    |  |
    ------>+------------------------------------------------|  |
           |                                                   |
           v                                                   |
         timeup                                                |
           |                                                   |
           v                                                   |
         result                                                |
           |                                                   |
           ----------------------------------------------------|

```

### イベント一覧

[protocol.md](https://gitlab.npca.jp/poteticalbee/curling/blob/master/protocol.md)参照
