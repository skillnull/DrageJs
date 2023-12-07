# DrageJs
JS元素拖拽

#### 使用

```javascript
import Drage from '/drage'

/**
 * 启用拖拽
 * @param ref <HTMLElement> [必需]
 * @param style <Object> [非必需，默认值： {}]
 * @param setStorage <String> session(当前窗口关闭前有效，不共享) | local(持久有效，同源窗口共享)  [非必需，默认值: 'local']
 */
Drage.listen({
  ref: HTMLElement,
  style: {},
  setStorage: 'local'
})

// 删除 storage
Drage.storageHandle('remove')

// 停用拖拽
Drage.removeListen()
```