isArray = (x) -> x instanceof Array

@each = (x, f) ->
  if isArray x
    f v, i for v, i in x
  else
    f v, k for k, v of x
  return

@map = (x, f) ->
  if isArray x
    f v, i for v, i in x
  else
    o = {}
    o[k] = f v, k for k, v of x
    o

@filter = (x, f) ->
  if isArray x
    v for v, i in x when f v, i
  else
    o = {}
    o[k] = v for k, v of x when f v, k
    o
@filterNot = (x, f) ->
  if isArray x
    v for v, i in x when not f v, i
  else
    o = {}
    o[k] = v for k, v of x when not f v, k
    o

@find = (x, y) ->
  if isArray x
    return v for v, i in x when y?(v, i) ? y == v
  else
    return v for k, v of x when y?(v, k) ? y == v
@findKey = (x, f) ->
  if isArray x
    return v for v, i in x when y?(i, v) ? y == i
  else
    return v for k, v of x when y?(k, v) ? y == k

String.prototype.replaceAll = (from, to) ->
  return this.replace ///#{from}///, to

$.fn.addClassSVG = (c) ->
  $(this).attr 'class', (_, old_classes) -> old_classes + ' ' + c
  this

$.fn.removeClassSVG = (c) ->
  $(this).attr 'class', (_, old_classes) ->
    old_classes.replaceAll c, ''
  this
