# DrageJs
JS元素拖拽

#### 使用
```js
import Drage from '/drage'

const ref = <your dom>

/** 
 * 启用拖拽 
 * @param ref <HTMLElement>
 * @param style <String>
 * @param setStorage <String> session(当前窗口关闭前有效，不共享) | local(持久有效，同源窗口共享) 
 */
  
Drage.listen(ref, '', 'local')

// 删除 storage
Drage.storageHandle('remove')
  
// 停用拖拽
Drage.removeListen()
```