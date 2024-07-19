<div align="center" >
  <h1>DrageJs</h1>
  <a href="http://www.skillnull.com"><img src="http://skillnull.com/others/images/brand/MIT.svg" alt="License MIT"></a>
  <br>
  <br>
</div>

#### JS元素拖拽

> CDN
```html
使用 UMD 格式
<script src="https://www.unpkg.com/@skillnull/drage-js@0.0.3/dist/drage.js"></script>
# or
<script src="https://cdn.jsdelivr.net/npm/@skillnull/drage-js@0.0.3/dist/drage.js"></script>


使用 ES 格式
<script src="https://www.unpkg.com/@skillnull/drage-js@0.0.3/dist/drage.es.js" type="module"></script>
# or
<script src="https://cdn.jsdelivr.net/npm/@skillnull/drage-js@0.0.3/dist/drage.es.js" type="module"></script>
``` 

> #### 安装

```shell
# NPM or YARN

yarn add @skillnull/drage-js

# or with npm

npm install @skillnull/drage-js
```

> #### 调用

```javascript
// 使用 CDN 引用时，无需 import 
import Drage from '@skillnull/drage-js'

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
