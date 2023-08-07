class Drage {
  constructor() {
    this.ref
    this.draggingFlag = false
    this.initX
    this.initY
    this.currentX
    this.currentY
    this.offsetX = 0
    this.offsetY = 0
    this.pageX
    this.pageY
    this.style = `z-index: 999999;`
  }

  listen(ref, style) {
    this.ref = ref
    if (style) {
      this.style = style
    }

    this.ref && this.ref.setAttribute('draggable', 'true')

    this.ref && this.ref.addEventListener('touchstart', _ => this.onStart(_, this))
    this.ref && this.ref.addEventListener('mousedown', _ => this.onStart(_, this))

    this.ref && this.ref.addEventListener('touchend', _ => this.onEnd(_, this))
    this.ref && this.ref.addEventListener('mouseup', _ => this.onEnd(_, this))
    this.ref && this.ref.addEventListener('mouseout', _ => this.onEnd(_, this))
  }

  onStart(event, _this) {

    if (event.changedTouches && event.changedTouches[0]) {
      _this.initX = event.changedTouches[0].clientX - _this.offsetX
      _this.initY = event.changedTouches[0].clientY - _this.offsetY
      _this.pageX = event.changedTouches[0].pageX
      _this.pageY = event.changedTouches[0].pageY
    }

    _this.ref && _this.ref.addEventListener('touchmove', _ => _this.onMove(_, _this))
    _this.ref && _this.ref.addEventListener('mousemove', _ => _this.onMove(_, _this))

    _this.draggingFlag = true
  }

  onMove(event, _this) {
    if (_this.draggingFlag) {
      event.preventDefault()
      if (event.changedTouches && event.changedTouches[0]) {

        _this.currentX = event.changedTouches[0].clientX - _this.initX
        _this.currentY = event.changedTouches[0].clientY - _this.initY

        // pageX > 0 往右划，pageX < 0 往左划
        const pageX = event.changedTouches[0].pageX - _this.pageX
        // pageY < 0 往上划，pageY > 0 往下划
        const pageY = event.changedTouches[0].pageY - _this.pageY

        const {top, bottom, left, right} = _this.ref.getBoundingClientRect()

        const clientW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const clientH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 是否到达左边缘
        if (left <= 0) {
          // 到达左边缘后是否向右拖动
          if (pageX > 0) {
            _this.offsetX = _this.currentX
          } else {
            _this.offsetX -= left
            _this.currentX = _this.offsetX
          }
        } else {
          // 是否到达右边缘
          if (right >= clientW) {
            // 到达右边缘后是否向左拖动
            if (pageX < 0) {
              _this.offsetX = _this.currentX
            } else {
              _this.currentX = _this.offsetX
            }
          } else {
            _this.offsetX = _this.currentX
          }
        }


        // 是否到达上边缘
        if (top <= 0) {
          // 到达上边缘后是否往下划
          if (pageY > 0) {
            _this.offsetY = _this.currentY
          } else {
            _this.offsetY -= top
            _this.currentY = _this.offsetY
          }
        } else {
          // 是否到达下边缘
          if (bottom >= clientH) {
            // 到达下边缘后是否往上划
            if (pageY < 0) {
              _this.offsetY = _this.currentY
            } else {
              _this.currentY = _this.offsetY
            }
          } else {
            _this.offsetY = _this.currentY
          }
        }


        if (_this.ref) {
          _this.ref.style = `
            ${_this.style}
            transform: translate(${_this.currentX}px, ${_this.currentY}px);
          `
        }

      }
    }
  }

  onEnd(event, _this) {
    _this.ref && _this.ref.removeEventListener('touchmove', _ => _this.onMove(_, _this))
    _this.ref && _this.ref.removeEventListener('mousemove', _ => _this.onMove(_, _this))
    _this.draggingFlag = false
  }

  removeListen(ref) {
    const _ref = ref ? ref : this.ref
    if (!_ref) return
    _ref.removeEventListener('touchmove', _ => this.onMove(_, this))
    _ref.removeEventListener('mousemove', _ => this.onMove(_, this))
    _ref.removeEventListener('touchstart', _ => this.onStart(_, this))
    _ref.removeEventListener('mousedown', _ => this.onStart(_, this))
    _ref.removeEventListener('touchend', _ => this.onEnd(_, this))
    _ref.removeEventListener('mouseup', _ => this.onEnd(_, this))
    _ref.removeEventListener('mouseout', _ => this.onEnd(_, this))
  }
}

export default new Drage()