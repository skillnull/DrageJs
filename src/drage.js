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
      position: "fixed",
      zIndex: '999999'
    }
    this.setStorage
    this.animationFrame
    this.clientW = document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
    this.clientH = document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
    // 贴到左边时，向左移动的距离
    this.xLeftTmp = 0
    // 贴到右边时，向右移动的距离
    this.xRightTmp = this.clientW
    // 贴到顶部时，向上移动的距离
    this.yTopTmp = 0
    // 贴到底部时，向下移动的距离
    this.yBottomTmp = this.clientH
  }

  /**
   * 启用拖拽
   * @param ref <HTMLElement> [必需]
   * @param style <Object> [非必需，默认值： {}]
   * @param setStorage <String> session(当前窗口关闭前有效，不共享) | local(持久有效，同源窗口共享)  [非必需，默认值: 'local']
   */
  listen({ref, style = {}, setStorage = 'local'}) {
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

    this.ref && this.ref.setAttribute('draggable', false)

    this.ref && this.ref.addEventListener('touchstart', _ => this.onStart(_, this))
    this.ref && this.ref.addEventListener('mousedown', _ => this.onStart(_, this))

    document.addEventListener('touchend', _ => this.onEnd(_, this))
    document.addEventListener('mouseup', _ => this.onEnd(_, this))
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
    this.ref.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`
  }

  onStart(event, _this) {
    _this.draggingFlag = true

    let _event = event.type === 'mousedown' ? event : event.changedTouches && event.changedTouches[0]

    _this.initX = _event.clientX - _this.offsetX
    _this.initY = _event.clientY - _this.offsetY
    _this.pageX = _event.pageX
    _this.pageY = _event.pageY

    document.addEventListener('touchmove', _ => _this.onMove(_, _this), {passive: false})
    document.addEventListener('mousemove', _ => _this.onMove(_, _this), {passive: false})
  }

  onMove(event, _this) {
    if (!_this.draggingFlag || !event) return

    event.preventDefault()

    let _event = event.type === 'mousemove' ? event : event.changedTouches && event.changedTouches[0]

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }

    this.animationFrame = requestAnimationFrame(() => {
      _this.currentX = _event.clientX - _this.initX
      _this.currentY = _event.clientY - _this.initY

      // pageX > 0 往右划，pageX < 0 往左划
      const pageX = _event.pageX - _this.pageX
      // pageY < 0 往上划，pageY > 0 往下划
      const pageY = _event.pageY - _this.pageY

      const {top, bottom, left, right} = _this.ref.getBoundingClientRect()

      // 是否到达左边缘
      if (left <= 0) {
        if (left < 0) {
          this.xLeftTmp = _event.pageX
        }
        // 到达左边缘后是否向右拖动
        if (_event.pageX - this.xLeftTmp > 0) {
          _this.offsetX = _this.currentX
        } else {
          _this.offsetX -= left
          _this.currentX = _this.offsetX
        }
      } else {
        // 是否到达右边缘
        if (right >= this.clientW) {
          if (_event.pageX > this.clientW) {
            this.xRightTmp = _event.pageX
          }
          // 到达右边缘后是否向左拖动
          if (_event.pageX - this.xRightTmp < 0) {
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
        if (top < 0) {
          this.yTopTmp = _event.pageY
        }
        // 到达上边缘后是否往下划
        if (_event.pageY - this.yTopTmp > 0) {
          _this.offsetY = _this.currentY
        } else {
          _this.offsetY -= top
          _this.currentY = _this.offsetY
        }
      } else {
        // 是否到达下边缘
        if (bottom >= this.clientH) {
          if (_event.pageY > this.clientH) {
            this.yBottomTmp = _event.pageY
          }
          // 到达下边缘后是否往上划
          if (_event.pageY - this.yBottomTmp < 0) {
            _this.offsetY = _this.currentY
          } else {
            _this.currentY = _this.offsetY
          }
        } else {
          _this.offsetY = _this.currentY
        }
      }

      _this.setRef()
    })
  }

  onEnd(event, _this) {
    _this.draggingFlag = false
    document.removeEventListener('touchmove', _ => _this.onMove(_, _this))
    document.removeEventListener('mousemove', _ => _this.onMove(_, _this))
    _this.storageHandle('set')
  }

  removeListen(ref) {
    const _ref = ref ? ref : this.ref || document
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

// window.Drage = Drage
//
// export default Drage
