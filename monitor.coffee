$ ->
  UserNum = 4
  StoneNum = 6
  StagePerCircle = 4
  StagePerStone = 40
  VirtualStageSize = 7000

  $(window).keydown (e) ->
    switch e.keyCode
      when 49 # 1
        waiting()
      when 50 # 2
        playing()
      when 51 # 3
        ranking [1000, 500, 5000, 500]
      when 73 # i
        $('body').addClass 'info'
      when 27 # ESC
        $('body').removeClass 'info'

  $('#i')             .click -> $('body').   addClass 'info'
  $('#info-container').click -> $('body').removeClass 'info'
  $('#info')          .click (ev) -> ev.stopPropagation()

  addStone = (i, j) ->
    $('.stage-view').append $('#none .stone').clone().addClassSVG('u'+i).addClassSVG('u'+i+'s'+j)
    return

  setStoneNum = (uid, s) ->
    $u = $ "#u#{uid}"
    if s == -1
      $u.data stone: $u.data('stone') - 1
    else
      $u.data stone: s
    $u.find('.user-stone .value').text $u.data 'stone'

  setStonePosition = (u, s, x, y) ->
    $s = $ '.u' + u + 's' + s
    $s.removeClass 'invisible'
    $s.data x: x, y: y
    $s.css
      left: 50 + 100/VirtualStageSize*x - 100/StagePerStone/2 + '%'
      top:  50 + 100/VirtualStageSize*y - 100/StagePerStone/2 + '%'
      display: 'block'

  socket = io.connect "http://#{location.host}/monitor", resource: 'socket.io'

  socket.on 'entry', waiting = ->
    $('body').attr id: 'waiting'
    $('#sec').removeClass('value-few').find('.value').text 60
    $('.user').each (i) ->
      $(this).find('.user-type').addClass 'no-p'
      $(this).find('.user-image').html $('#none .wait').clone()
      $(this).find('.user-type>.value').text 'Waiting...'
    $('.stage-view .stone').remove()

  socket.on 'start', playing = ->
    $('body').attr id: 'playing'
    $('.user').each (i) ->
      if $(this).find('.user-type').hasClass 'no-p'
        $(this).find('.user-image').html $('#none .ai-svg').clone()
        $(this).find('.user-type>.value').text 'Computer'
      setStoneNum i, StoneNum
      for j in [0...StoneNum]
        addStone i, j
      return

  socket.on 'result', ranking = (scores) ->
    ranks     = (0 for i in [0...UserNum])
    uniqRanks = (0 for i in [0...UserNum])
    $('#sec .value').text 0
    for i in [0...UserNum]
      for j in [0...i]
        if scores[i] > scores[j]
          uniqRanks[j]++
          ranks[j]++
        if scores[i] == scores[j]
          uniqRanks[i]++
        if scores[i] < scores[j]
          ranks[i]++
          uniqRanks[i]++
      $('#u'+i+' .user-score .value').text scores[i]
    for r, i in uniqRanks
      $('#u'+i).attr 'data-rank': r
    for r, i in ranks
      $('#u'+i+' .rank .value').text r+1
      $('#u'+i+' .rank .th').text ['st','nd','rd'][r] ? 'th'
    $('body').attr id: 'ranking'

  socket.on 'tick', (sec) ->
    $('#sec .value').text sec
    if sec == 10
      $('#sec').addClass 'value-few'

  socket.on 'addStone', (info) ->
    setStoneNum info.uid, -1
    setStonePosition info.uid, info.sid, info.x, info.y

  socket.on 'moveStones', (info) ->
    for moveList, uid in info
      for move in moveList
        setStonePosition uid, move.sid, move.x, move.y

  socket.on 'deleteStones', (sidLists) ->
    for sidList, uid in sidLists
      for sid in sidList
        $('.u'+uid+'s'+sid).remove()
    return

  socket.on 'reconnect', (stonesList) ->
    $('body').attr id: 'playing'
    $('.user').each (i) ->
      $(this).find('.user-image').html $('#none .ai-svg').clone()
    for user, uid in stonesList
      setStoneNum uid, StoneNum - user.stoneCount
      for j in [0...StoneNum]
        addStone uid, j
      for stone in user.stones
        setStonePosition uid, stone.sid, stone.x, stone.y
    $('#sec').removeClass('value-none').find('.value').text 60
    return

  socket.on 'setPlayer', (uid) ->
    $("#u#{uid} .user-image").html $('#none .player-svg').clone()
    $("#u#{uid} .user-type").removeClass 'no-p'
    $("#u#{uid} .user-type>.value").text 'Player'

  socket.on 'unsetPlayer', (uid) ->
    if $('body').is '#waiting'
      $("#u#{uid} .user-image").html $('#none .wait').clone()
      $("#u#{uid} .user-type>.value").text 'Waiting...'
    else if $('body').is '#playing'
      $("#u#{uid} .user-image").html $('#none .ai-svg').clone()
      $("#u#{uid} .user-type>.value").text 'Computer'
    $("#u#{uid} .user-type").addClass 'no-p'
