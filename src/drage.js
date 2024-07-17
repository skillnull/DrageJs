class DrageJs {
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
    this.style = {
      zIndex: '999999'
    }
    this.setStorage
  }

  /**
   * 启用拖拽
   * @param ref <HTMLElement> [必需]
   * @param style <Object> [非必需，默认值： {}]
   * @param setStorage <String> session(当前窗口关闭前有效，不共享) | local(持久有效，同源窗口共享)  [非必需，默认值: 'local']
   */
  listen({ ref, style = {}, setStorage = 'local' }) {
    window.onresize = () => {
      this.storageHandle('remove')
    }
    this.ref = ref
    if (style) {
      this.style = style
    }
    if (setStorage) {
      this.setStorage = setStorage
      this.storageHandle('get')
    }

    this.ref && this.ref.setAttribute('draggable', 'true')

    this.ref && this.ref.addEventListener('touchstart', _ => this.onStart(_, this))
    this.ref && this.ref.addEventListener('mousedown', _ => this.onStart(_, this))

    this.ref && this.ref.addEventListener('touchend', _ => this.onEnd(_, this))
    this.ref && this.ref.addEventListener('mouseup', _ => this.onEnd(_, this))
    this.ref && this.ref.addEventListener('mouseout', _ => this.onEnd(_, this))
  }

  storageHandle(operation) {
    if (operation === 'get') {
      let storage
      if (this.setStorage === 'local') {
        storage = localStorage.getItem('DrageJS_INFO')
      }
      if (this.setStorage === 'session') {
        storage = sessionStorage.getItem('DrageJS_INFO')
      }
      try {
        storage = JSON.parse(storage)
        if (!storage) return
        this.currentX = storage.currentX
        this.initX = storage.currentX
        this.offsetX = storage.currentX
        this.currentY = storage.currentY
        this.initY = storage.currentY
        this.offsetY = storage.currentY
        this.setRef()
      } catch (err) {
        console.log(err)
      }
    }
    if (operation === 'set') {
      if (this.setStorage === 'local') {
        localStorage.setItem('DrageJS_INFO', JSON.stringify({
          currentX: this.currentX,
          currentY: this.currentY
        }))
      }
      if (this.setStorage === 'session') {
        sessionStorage.setItem('DrageJS_INFO', JSON.stringify({
          currentX: this.currentX,
          currentY: this.currentY
        }))
      }
    }
    if (operation === 'remove') {
      localStorage.removeItem('DrageJS_INFO')
      sessionStorage.removeItem('DrageJS_INFO')
    }
  }

  setRef() {
    if (!this.ref) return
    for (let item in this.style) {
      this.ref.style[item] = this.style[item]
    }
    this.ref.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`
  }

  onStart(event, _this) {
    let _event = event.type === 'mousedown' ? event : event.changedTouches && event.changedTouches[0]

    _this.initX = _event.clientX - _this.offsetX
    _this.initY = _event.clientY - _this.offsetY
    _this.pageX = _event.pageX
    _this.pageY = _event.pageY

    _this.ref && _this.ref.addEventListener('touchmove', _ => _this.onMove(_, _this))
    _this.ref && _this.ref.addEventListener('mousemove', _ => _this.onMove(_, _this))

    _this.draggingFlag = true
  }

  onMove(event, _this) {
    if (!_this.draggingFlag) return
    event.preventDefault()

    let _event = event.type === 'mousemove' ? event : event.changedTouches && event.changedTouches[0]

    _this.currentX = _event.clientX - _this.initX
    _this.currentY = _event.clientY - _this.initY

    // pageX > 0 往右划，pageX < 0 往左划
    const pageX = _event.pageX - _this.pageX
    // pageY < 0 往上划，pageY > 0 往下划
    const pageY = _event.pageY - _this.pageY

    const { top, bottom, left, right } = _this.ref.getBoundingClientRect()

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

    _this.setRef()
  }

  onEnd(event, _this) {
    _this.ref && _this.ref.removeEventListener('touchmove', _ => _this.onMove(_, _this))
    _this.ref && _this.ref.removeEventListener('mousemove', _ => _this.onMove(_, _this))
    _this.draggingFlag = false
    _this.storageHandle('set')
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

const Drage = new DrageJs()

window.Drage = Drage

export default Drage
