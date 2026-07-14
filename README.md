<div align="center">
  <img src="http://skillnull.com/others/images/DrageJs.png" width="300px" alt="DrageJs">
</div>
<br>
<div align="center" >
  <a href="http://www.skillnull.com"><img src="http://skillnull.com/others/images/brand/MIT.svg" alt="License MIT"></a>
</div>

#### JS元素拖拽

> **支持平台：** 浏览器 · 微信小程序 · Node.js · React Native

---

## CDN

```html
<!-- UMD 格式 -->
<script src="https://www.unpkg.com/@skillnull/drage-js@1.0.1/dist/drage.js"></script>
<!-- 或 -->
<script src="https://cdn.jsdelivr.net/npm/@skillnull/drage-js@1.0.1/dist/drage.js"></script>

<!-- ES 格式 -->
<script src="https://www.unpkg.com/@skillnull/drage-js@1.0.1/dist/drage.es.js" type="module"></script>
<!-- 或 -->
<script src="https://cdn.jsdelivr.net/npm/@skillnull/drage-js@1.0.1/dist/drage.es.js" type="module"></script>
```

## 安装

```shell
# NPM / YARN / PNPM

yarn add @skillnull/drage-js
npm install @skillnull/drage-js
pnpm add @skillnull/drage-js
```

## 快速开始

### JavaScript

```javascript
import Drage from '@skillnull/drage-js'

/**
 * 启用拖拽
 * @param ref   <HTMLElement>   [必需]
 * @param style <Object>        [非必需，默认值： {}]
 * @param setStorage <String>   session(当前窗口关闭前有效) | local(持久有效) [非必需，默认值: 'local']
 */
Drage.listen({
  ref: HTMLElement,
  style: {},
  setStorage: 'local'
})

// 删除存储的位置数据
Drage.storageHandle('remove')

// 停用拖拽
Drage.removeListen()
```

### TypeScript

```typescript
import Drage, { type DrageListenOptions } from '@skillnull/drage-js'

const options: DrageListenOptions = {
  ref: document.querySelector('.drag-box'),
  style: { position: 'fixed', zIndex: 999999 },
  setStorage: 'local',
  platform: 'browser'
}

Drage.listen(options)
```

## 各平台用法

### 浏览器

```html
<div id="draggable" style="position:fixed;">拖拽我</div>
<script src="dist/drage.js"></script>
<script>
  Drage.listen({
    ref: document.getElementById('draggable'),
    style: { position: 'fixed', zIndex: '999999' },
    setStorage: 'local'  // 'local' | 'session' | 'none'
  })
</script>
```

### 微信小程序

在 WXML 中绑定事件：

```html
<view 
  bind:touchstart="{{ onTouchstart }}"
  bind:touchmove="{{ onTouchmove }}"
  bind:touchend="{{ onTouchend }}"
  style="{{ dragStyle }}">
  拖拽我
</view>
```

在 JS 中初始化：

```javascript
const Drage = require('../../dist/drage').default

Page({
  data: { dragStyle: {} },

  onLoad() {
    Drage.listen({
      ref: '.drag-box',       // 小程序选择器
      setStorage: 'local',
      platform: 'weixin'
    })

    // 将事件处理器绑定到页面
    Object.assign(this, Drage._wxBindEvents)
  }
})
```

### Node.js

```javascript
const Drage = require('./dist/drage').default

// 模拟 DOM 对象
const mockEl = {
  _top: 0, _left: 0, _width: 100, _height: 100,
  style: {}
}

Drage.listen({
  ref: mockEl,
  setStorage: 'none',  // Node 环境不支持存储
  platform: 'node'
})
```

### React Native

```jsx
import React, { useRef } from 'react'
import { View, Text } from 'react-native'
import Drage from '@skillnull/drage-js'

export default function DraggableComponent() {
  const ref = useRef(null)

  React.useEffect(() => {
    Drage.listen({
      ref: ref.current,
      setStorage: 'none',
      platform: 'rn'
    })
  }, [])

  return (
    <View
      ref={ref}
      onTouchStart={(e) => Drage.onStart(e.nativeEvent)}
      onTouchMove={(e) => Drage.onMove(e.nativeEvent)}
      onTouchEnd={(e) => Drage.onEnd(e.nativeEvent)}
      style={{ position: 'absolute', zIndex: 999999 }}>
      <Text>拖拽我</Text>
    </View>
  )
}
```

## API

### `listen(options)`

启用拖拽。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ref` | `HTMLElement` / `String` / `Function` | ✅ | 浏览器: DOM 元素 · 小程序: 选择器字符串 · RN: ref 回调 |
| `style` | `Object` | ❌ | 自定义样式，默认 `{ position: 'fixed', zIndex: '999999' }` |
| `setStorage` | `String` | ❌ | `'local'` · `'session'` · `'none'`，默认 `'local'` |
| `platform` | `String` | ❌ | 强制指定平台：`'browser'` · `'weixin'` · `'node'` · `'rn'` |

### `removeListen(ref?)`

移除拖拽监听。

### `storageHandle(operation)`

手动操作存储。

| 操作 | 说明 |
|------|------|
| `'get'` | 从存储读取位置 |
| `'set'` | 将当前位置写入存储 |
| `'remove'` | 清除存储 |

## 注意事项

1. **小程序**：需要在 WXML 中绑定 `bind:touchstart`、`bind:touchmove`、`bind:touchend` 事件
2. **React Native**：使用 `left`/`top` 定位而非 `transform: translate3d`
3. **Node.js**：纯内存模拟，无实际 UI 渲染
4. **存储**：小程序使用 `wx.setStorageSync`，RN 使用 `AsyncStorage`，Node 环境不支持

