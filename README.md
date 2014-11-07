# NPCA Ohajiki

2014年KOF展示

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

[protocol.md](https://github.com/akouryy/ohajiki/blob/master/protocol.md)参照
