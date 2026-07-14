/**
 * DrageJs - 跨平台拖拽库
 * 支持：浏览器 / 微信小程序 / Node.js / React Native
 */

declare const wx: any
declare const getCurrentPages: any
declare const global: any
declare const require: any

export type DragePlatform = 'browser' | 'weixin' | 'node' | 'rn'

export type DrageStorageType = 'local' | 'session' | 'none'

export type DrageStorageOperation = 'get' | 'set' | 'remove'

export interface DrageStyle {
  [key: string]: string | number
}

export interface DrageListenOptions {
  ref: HTMLElement | string | Record<string, any> | null
  style?: DrageStyle
  setStorage?: DrageStorageType
  platform?: DragePlatform
}

class DrageJs {
  [key: string]: any

  ref: HTMLElement | string | Record<string, any> | null
  platform: DragePlatform
  draggingFlag: boolean
  initX: number | undefined
  initY: number | undefined
  currentX: number
  currentY: number
  offsetX: number
  offsetY: number
  pageX: number | undefined
  pageY: number | undefined
  style: DrageStyle
  setStorage: DrageStorageType
  animationFrame: number | null
  clientW: number
  clientH: number
  _wxBindEvents: Record<string, (event: any) => void> | null

  constructor() {
    this.ref = null
    this.draggingFlag = false
    this.initX = undefined
    this.initY = undefined
    this.currentX = 0
    this.currentY = 0
    this.offsetX = 0
    this.offsetY = 0
    this.pageX = undefined
    this.pageY = undefined
    this.style = {
      position: "fixed",
      zIndex: '999999'
    }
    this.setStorage = 'local'
    this.animationFrame = null

    // 平台检测
    this._detectPlatform()

    // 初始化平台适配器
    this._initAdapter()
  }

  /**
   * 检测运行平台
   */
  _detectPlatform() {
    // 微信小程序 / 微信环境
    if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') {
      this.platform = 'weixin'
    }
    // React Native
    else if (typeof global !== 'undefined' && global.__DEV__) {
      // RN 的 __DEV__ 全局变量
      try {
        const rn = require('react-native')
        if (rn.Platform) {
          this.platform = 'rn'
          this.Platform = rn.Platform
          this.Dimensions = rn.Dimensions
        }
      } catch (e) {
        this.platform = 'browser'
      }
    }
    // Node.js (无 window)
    else if (typeof window === 'undefined' || window === null) {
      this.platform = 'node'
    }
    // 浏览器
    else {
      this.platform = 'browser'
    }
  }

  /**
   * 初始化平台适配器
   */
  _initAdapter() {
    switch (this.platform) {
      case 'browser':
        this._initBrowser()
        break
      case 'weixin':
        this._initWeixin()
        break
      case 'node':
        this._initNode()
        break
      case 'rn':
        this._initRN()
        break
    }
  }

  /* ==================== 浏览器适配器 ==================== */
  _initBrowser() {
    this._getClientSize = () => ({
      w: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      h: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    })

    this._getElementRect = (el) => el.getBoundingClientRect()

    this._setElementPosition = (el, x, y) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    this._bindEvent = (el, type, handler, opts) => {
      el.addEventListener(type, handler, opts)
    }

    this._unbindEvent = (el, type, handler) => {
      el.removeEventListener(type, handler)
    }

    this._bindDocEvent = (type, handler, opts) => {
      document.addEventListener(type, handler, opts)
    }

    this._unbindDocEvent = (type, handler) => {
      document.removeEventListener(type, handler)
    }

    this._raf = (fn) => requestAnimationFrame(fn)
    this._cancelRaf = (id) => cancelAnimationFrame(id)

    this._storage = {
      get: (key) => { try { return localStorage.getItem(key) } catch(e) { return null } },
      set: (key, val) => { try { localStorage.setItem(key, val) } catch(e) {} },
      remove: (key) => { try { localStorage.removeItem(key) } catch(e) {} },
      getSession: (key) => { try { return sessionStorage.getItem(key) } catch(e) { return null } },
      setSession: (key, val) => { try { sessionStorage.setItem(key, val) } catch(e) {} },
      removeSession: (key) => { try { sessionStorage.removeItem(key) } catch(e) {} }
    }

    this._onResize = () => {
      this.clientW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
      this.clientH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.resetPosition()
    }
    window.addEventListener('resize', this._onResize)

    const size = this._getClientSize()
    this.clientW = size.w
    this.clientH = size.h
  }

  /* ==================== 微信小程序适配器 ==================== */
  _initWeixin() {
    let pages = getCurrentPages()
    let currentPage = pages[pages.length - 1]
    let pageCtx = currentPage ? currentPage.$page : null

    this._getClientSize = () => {
      const sys = wx.getSystemInfoSync()
      return { w: sys.windowWidth, h: sys.windowHeight }
    }

    this._getElementRect = (selector) => new Promise((resolve) => {
      const query = wx.createSelectorQuery().in(pageCtx)
      query.select(selector).boundingClientRect((rect) => {
        if (rect) {
          resolve(rect)
        } else {
          resolve({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 })
        }
      }).exec()
    })

    this._setElementPosition = (ctx, x, y) => {
      ctx.setData({
        dragStyle: {
          transform: `translate3d(${x}px, ${y}px, 0)`
        }
      })
    }

    this._bindEvent = (ctx, eventKey, handler) => {
      ctx[eventKey] = handler
    }

    this._unbindEvent = (ctx, eventKey) => {
      ctx[eventKey] = null
    }

    // 小程序没有 document，使用全局事件绑定
    this._bindDocEvent = (type, handler) => {
      this._globalHandlers = this._globalHandlers || {}
      this._globalHandlers[type] = handler
    }

    this._unbindDocEvent = (type) => {
      if (this._globalHandlers) {
        this._globalHandlers[type] = null
      }
    }

    this._raf = (fn) => {
      // 小程序中没有 requestAnimationFrame，使用 setData 驱动
      fn()
    }
    this._cancelRaf = (id) => {}

    this._storage = {
      get: (key) => { try { return wx.getStorageSync(key) } catch(e) { return null } },
      set: (key, val) => { try { wx.setStorageSync(key, val) } catch(e) {} },
      remove: (key) => { try { wx.removeStorageSync(key) } catch(e) {} },
      getSession: (key) => { try { return wx.getStorageSync(key) } catch(e) { return null } },
      setSession: (key, val) => { try { wx.setStorageSync(key, val) } catch(e) {} },
      removeSession: (key) => { try { wx.removeStorageSync(key) } catch(e) {} }
    }

    this._onResize = () => {
      wx.onWindowResize((res) => {
        this.clientW = res.windowWidth
        this.clientH = res.windowHeight
      })
    }

    const size = this._getClientSize()
    this.clientW = size.w
    this.clientH = size.h
  }

  /* ==================== Node.js 适配器 ==================== */
  _initNode() {
    this._getClientSize = () => ({ w: 1920, h: 1080 })

    this._getElementRect = (el) => ({
      top: el._top || 0,
      bottom: (el._top || 0) + (el._height || 0),
      left: el._left || 0,
      right: (el._left || 0) + (el._width || 0)
    })

    this._setElementPosition = (el, x, y) => {
      el._x = x
      el._y = y
      el.style = el.style || {}
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    this._bindEvent = () => {}
    this._unbindEvent = () => {}
    this._bindDocEvent = () => {}
    this._unbindDocEvent = () => {}

    this._raf = (fn) => { fn() }
    this._cancelRaf = () => {}

    this._storage = {
      get: () => null,
      set: () => {},
      remove: () => {},
      getSession: () => null,
      setSession: () => {},
      removeSession: () => {}
    }

    this._onResize = () => {}
    const size = this._getClientSize()
    this.clientW = size.w
    this.clientH = size.h
  }

  /* ==================== React Native 适配器 ==================== */
  _initRN() {
    let dimSubscription = null

    this._getClientSize = () => {
      try {
        const dim = this.Dimensions.get('window')
        return { w: dim.width, h: dim.height }
      } catch (e) {
        return { w: 375, h: 667 }
      }
    }

    this._getElementRect = (ref) => new Promise((resolve) => {
      try {
        if (ref && ref.measure) {
          ref.measure((fx, fy, width, height, px, py) => {
            resolve({ top: py, bottom: py + height, left: px, right: px + width })
          })
        } else {
          resolve({ top: 0, bottom: 0, left: 0, right: 0 })
        }
      } catch (e) {
        resolve({ top: 0, bottom: 0, left: 0, right: 0 })
      }
    })

    // RN 中使用 left/top 代替 transform
    this._setElementPosition = (ref, x, y) => {
      try {
        if (ref && ref.setNativeProps) {
          ref.setNativeProps({ style: { left: x, top: y } })
        }
      } catch (e) {}
    }

    this._bindEvent = (ref, handler) => {
      try {
        if (ref && ref.attachRef) {
          ref.attachRef('drageRef', handler)
        }
      } catch (e) {}
    }

    this._unbindEvent = () => {}
    this._bindDocEvent = () => {}
    this._unbindDocEvent = () => {}

    this._raf = (fn) => { fn() }
    this._cancelRaf = () => {}

    this._storage = {
      get: (key) => {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage')
          return AsyncStorage.getItem(key)
        } catch (e) { return null }
      },
      set: (key, val) => {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage')
          AsyncStorage.setItem(key, val)
        } catch (e) {}
      },
      remove: (key) => {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage')
          AsyncStorage.removeItem(key)
        } catch (e) {}
      },
      getSession: (key) => {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage')
          return AsyncStorage.getItem(key)
        } catch (e) { return null }
      },
      setSession: (key, val) => {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage')
          AsyncStorage.setItem(key, val)
        } catch (e) {}
      },
      removeSession: (key) => {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage')
          AsyncStorage.removeItem(key)
        } catch (e) {}
      }
    }

    this._onResize = () => {
      try {
        dimSubscription = this.Dimensions.addEventListener('change', (size) => {
          this.clientW = size.window.width
          this.clientH = size.window.height
        })
      } catch (e) {}
    }

    const size = this._getClientSize()
    this.clientW = size.w
    this.clientH = size.h
  }

  /* ==================== 存储适配 ==================== */
  _getStorage(type) {
    const s = this._storage
    if (type === 'local') {
      return { get: s.get, set: s.set, remove: s.remove }
    }
    return { get: s.getSession, set: s.setSession, remove: s.removeSession }
  }

  storageHandle(operation: DrageStorageOperation) {
    if (operation === 'get') {
      const store = this._getStorage(this.setStorage)
      let storage = store.get('DrageJS_INFO')
      try {
        storage = JSON.parse(storage)
        if (!storage) return
        this.currentX = storage.currentX || 0
        this.initX = storage.currentX || 0
        this.offsetX = storage.currentX || 0
        this.currentY = storage.currentY || 0
        this.initY = storage.currentY || 0
        this.offsetY = storage.currentY || 0
        this.setRef()
      } catch (err) {
        // silent
      }
    }
    if (operation === 'set') {
      const store = this._getStorage(this.setStorage)
      store.set('DrageJS_INFO', JSON.stringify({
        currentX: this.currentX,
        currentY: this.currentY
      }))
    }
    if (operation === 'remove') {
      const storeLocal = this._getStorage('local')
      const storeSession = this._getStorage('session')
      storeLocal.remove('DrageJS_INFO')
      storeSession.remove('DrageJS_INFO')
    }
  }

  resetPosition() {
    this.currentX = 0
    this.currentY = 0
    this.initX = 0
    this.initY = 0
    this.offsetX = 0
    this.offsetY = 0
    this.storageHandle('remove')
    this.setRef()
  }

  /* ==================== 公共接口 ==================== */

  /**
   * 启用拖拽
   * @param {Object} options
   * @param {HTMLElement|String|Function} options.ref - 浏览器: HTMLElement / 小程序: 选择器字符串 / RN: ref 回调
   * @param {Object} [options.style={}] - 自定义样式
   * @param {String} [options.setStorage='local'] - 'local' | 'session' | 'none'
   * @param {String} [options.platform] - 强制指定平台: 'browser' | 'weixin' | 'node' | 'rn'
   */
  listen({ref, style = {}, setStorage = 'local', platform}: DrageListenOptions) {
    // 允许运行时覆盖平台
    if (platform && platform !== this.platform) {
      this.platform = platform
      this._initAdapter()
    }

    this.ref = ref
    this.setStorage = setStorage

    if (style && Object.keys(style).length > 0) {
      this.style = style
    }

    if (setStorage && setStorage !== 'none') {
      this.storageHandle('get')
    }

    // 根据平台绑定事件
    switch (this.platform) {
      case 'browser':
        this._listenBrowser(ref)
        break
      case 'weixin':
        this._listenWeixin(ref)
        break
      case 'node':
        this._listenNode(ref)
        break
      case 'rn':
        this._listenRN(ref)
        break
    }
  }

  /**
   * 移除拖拽监听
   * @param {HTMLElement|String|Function} [ref]
   */
  removeListen(ref?: DrageListenOptions['ref']) {
    this.draggingFlag = false

    switch (this.platform) {
      case 'browser':
        this._removeBrowser(ref)
        break
      case 'weixin':
        this._removeWeixin(ref)
        break
      case 'node':
        // Node 无需清理
        break
      case 'rn':
        this._removeRN(ref)
        break
    }

    if (this._onResize) {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('resize', this._onResize)
      }
    }
    if (this.platform === 'rn' && this._dimSubscription) {
      try { this._dimSubscription.remove() } catch(e) {}
    }
  }

  setRef() {
    if (!this.ref) return

    // 应用用户自定义样式
    if (this.platform === 'browser' && typeof this.ref !== 'string') {
      for (let item in this.style) {
        this.ref.style[item] = this.style[item]
      }
    }

    this._setElementPosition(this.ref, this.currentX, this.currentY)
  }

  /* ==================== 浏览器事件绑定 ==================== */
  _listenBrowser(ref) {
    if (!ref) return
    ref.setAttribute('draggable', false)

    this._onTouchStart = (e) => this.onStart(e)
    this._onMouseDown = (e) => this.onStart(e)
    this._onTouchEnd = (e) => this.onEnd(e)
    this._onMouseUp = (e) => this.onEnd(e)
    this._onTouchMove = (e) => this.onMove(e)
    this._onMouseMove = (e) => this.onMove(e)

    this._bindEvent(ref, 'touchstart', this._onTouchStart, { passive: false })
    this._bindEvent(ref, 'mousedown', this._onMouseDown, { passive: false })
    this._bindDocEvent('touchend', this._onTouchEnd)
    this._bindDocEvent('mouseup', this._onMouseUp)
  }

  _removeBrowser(ref) {
    const target = ref || this.ref || document
    if (!target) return
    if (this._onTouchStart) target.removeEventListener('touchstart', this._onTouchStart)
    if (this._onMouseDown) target.removeEventListener('mousedown', this._onMouseDown)
    if (this._onTouchEnd) document.removeEventListener('touchend', this._onTouchEnd)
    if (this._onMouseUp) document.removeEventListener('mouseup', this._onMouseUp)
    if (this._onTouchMove) document.removeEventListener('touchmove', this._onTouchMove)
    if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove)
  }

  /* ==================== 微信小程序事件绑定 ==================== */
  _listenWeixin(selector) {
    this._refSelector = selector

    // 小程序中通过 bind:touchstart 等绑定到页面上
    // 这里提供一个方法让调用方在 WXML 中绑定
    this._handlers = {
      touchstart: (e) => this.onStart(e),
      touchmove: (e) => this.onMove(e),
      touchend: (e) => this.onEnd(e)
    }

    // 存储 handler 供外部在 WXML 中绑定
    this._wxBindEvents = {
      onTouchstart: (e) => this._handlers.touchstart(e),
      onTouchmove: (e) => this._handlers.touchmove(e),
      onTouchend: (e) => this._handlers.touchend(e)
    }
  }

  _removeWeixin(ref?: DrageListenOptions['ref']) {
    this._wxBindEvents = null
    this._handlers = null
  }

  /* ==================== Node.js 事件绑定 ==================== */
  _listenNode(ref) {
    // Node 环境下无真实 DOM，仅做内存模拟
    if (ref) {
      ref._top = ref._top || 0
      ref._left = ref._left || 0
      ref._width = ref._width || 100
      ref._height = ref._height || 100
    }
  }

  /* ==================== React Native 事件绑定 ==================== */
  _listenRN(ref) {
    this._rnRef = ref
  }

  _removeRN(ref?: DrageListenOptions['ref']) {
    this._rnRef = null
  }

  /* ==================== 拖拽核心逻辑 ==================== */
  onStart(event: any) {
    this.draggingFlag = true

    let clientX, clientY
    if (this.platform === 'browser') {
      const touch = event.touches ? event.touches[0] : (event.changedTouches ? event.changedTouches[0] : event)
      clientX = touch.clientX
      clientY = touch.clientY
    } else if (this.platform === 'weixin') {
      clientX = event.touches ? event.touches[0].clientX : 0
      clientY = event.touches ? event.touches[0].clientY : 0
    } else {
      clientX = event.clientX || 0
      clientY = event.clientY || 0
    }

    this.initX = clientX - this.offsetX
    this.initY = clientY - this.offsetY

    // 绑定移动/结束事件
    if (this.platform === 'browser') {
      this._bindDocEvent('touchmove', this._onTouchMove, { passive: false })
      this._bindDocEvent('mousemove', this._onMouseMove, { passive: false })
    } else if (this.platform === 'weixin') {
      // 小程序事件已在 WXML 中绑定，不需要额外操作
    }
  }

  onMove(event: any) {
    if (!this.draggingFlag || !event) return

    let clientX, clientY
    if (this.platform === 'browser') {
      const touch = event.touches ? event.touches[0] : (event.changedTouches ? event.changedTouches[0] : event)
      clientX = touch.clientX
      clientY = touch.clientY
    } else if (this.platform === 'weixin') {
      clientX = event.touches ? event.touches[0].clientX : 0
      clientY = event.touches ? event.touches[0].clientY : 0
    } else {
      clientX = event.clientX || 0
      clientY = event.clientY || 0
    }

    this.currentX = clientX - this.initX
    this.currentY = clientY - this.initY

    const moveX = this.currentX - this.offsetX
    const moveY = this.currentY - this.offsetY

    // 获取元素位置信息
    let rect
    if (this.platform === 'browser') {
      rect = this._getElementRect(this.ref)
    } else if (this.platform === 'weixin') {
      // 小程序异步获取，这里用缓存值
      rect = this._cachedRect || { top: 0, bottom: 0, left: 0, right: 0 }
    } else {
      rect = this._getElementRect(this.ref)
    }

    const { top, bottom, left, right } = rect

    // 边界处理 - 左/上
    if (left <= 0) {
      if (moveX <= 0) {
        this.offsetX -= left
        this.currentX = this.offsetX
      }
    } else if (right >= this.clientW) {
      if (moveX >= 0) {
        this.offsetX -= (right - this.clientW)
        this.currentX = this.offsetX
      }
    } else {
      this.offsetX = this.currentX
    }

    if (top <= 0) {
      if (moveY <= 0) {
        this.offsetY -= top
        this.currentY = this.offsetY
      }
    } else if (bottom >= this.clientH) {
      if (moveY >= 0) {
        this.offsetY -= (bottom - this.clientH)
        this.currentY = this.offsetY
      }
    } else {
      this.offsetY = this.currentY
    }

    // 缓存矩形用于小程序
    if (this.platform === 'weixin') {
      this._cachedRect = rect
    }

    this._raf(() => {
      this.setRef()
    })
  }

  onEnd(event: any) {
    this.draggingFlag = false

    if (this.platform === 'browser') {
      this._unbindDocEvent('touchmove', this._onTouchMove)
      this._unbindDocEvent('mousemove', this._onMouseMove)
    }

    this.storageHandle('set')
  }
}

/* ==================== 多环境导出 ==================== */
const Drage = new DrageJs()

// 浏览器 UMD 导出
if (typeof window !== 'undefined' && window !== null) {
  ;(window as any).Drage = Drage
}

// ES Module 导出
export default Drage
