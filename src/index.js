class Watermark {
  constructor() {
    this.clientW = document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
    this.clientH = document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
    this.mark = null
    this.init = this.init.bind(this)
  }

  init(params) {
    const _mark = document.querySelector('#skillnull_watermark_container')
    if (_mark) {
      _mark.parentElement.removeChild(_mark)
    }
    // 水印容器
    this.mark = document.createElement('canvas')
    this.mark.id = 'skillnull_watermark_container'
    this.mark.height = params.height || this.clientH
    this.mark.width = params.width || this.clientW
    // 水印内容
    const mark_text = this.mark.getContext('2d')
    mark_text.font = params.mark_text_font || '14px serif'
    mark_text.fillStyle = params.mark_text_font_color || '#434a56ab'
    mark_text.textBaseline = params.mark_text_baseline || 'hanging'
    const _gap = params.gaps || [100, 100]
    const _density = params.density || [150, 150]
    for (let i = 0; i < _density[0]; i++) {
      for (let j = 0; j < _density[1]; j++) {
        mark_text.save()
        mark_text.translate(i * _gap[0], j * _gap[1])
        mark_text.rotate((params.mark_text_rotate || 15) * Math.PI / 180)
        mark_text.fillText(params.mark_text || '水印', i * _gap[0], j * _gap[1])
        mark_text.restore()
      }
    }
    // 要添加水印元素
    const mark_target = document.querySelector(params.target)
    mark_target.appendChild(this.mark)
  }
}

new Watermark().init({
  target: '#watermark_box', // 必须，被添加水印元素
  height: '', // 水印容器高，默认页面高
  weight: '', // 水印容器宽，默认页面宽
  mark_text: 'SKILLNULL', // 水印内容，默认 '水印'
  mark_text_font: '300 12px Arial', // 水印字体样式，默认 '14px serif'
  mark_text_font_color: "#434a56ab", // 水印字体颜色，默认 '#434a56ab'
  mark_text_baseline: '', // 文字基线位置，默认 'hanging'
  mark_text_rotate: 20, // 文字旋转角度，默认 15
  gaps: [100, 100], // [x间隔, y间隔]， 默认 [100, 100]
  density: [150, 150] // [x数量, y数量]，默认 [150, 150]
})

const list_box = document.querySelector('.drag-box')

Drage.listen({
  ref: list_box,
  style: {},
  setStorage: 'local'
})
