/* ==========================================================================
 * svg-util.js —— SVG 共享工具（独立模块，避免循环依赖）
 *
 * 提供：
 *   1. 创建 SVG 容器（viewBox 1000x1000）
 *   2. 创建 SVG 命名空间元素
 *   3. 根据格子尺寸计算字号
 * ========================================================================== */
import { NUMBER_COLORS, clamp } from './config';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var VIEW_SIZE = 1000;

  export const svgUtil = {
    NS: SVG_NS,
    VIEW: 1000,

    /** 创建 SVG 命名空间元素 */
    el: function (tag, attrs) {
      var node = document.createElementNS(SVG_NS, tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (k) {
          node.setAttribute(k, attrs[k]);
        });
      }
      return node;
    },

    /**
     * 创建一个带数字文本的可点击格子组：
     * <g class="cell svg-cell" data-num="x">
     *   <path/polygon class="cell-shape"> ...
     *   <text class="cell-text">x</text>
     * </g>
     * @returns {SVGGElement}
     */
    createCell: function (num, x, y, fontSize, fillColor) {
      var g = this.el('g', { 'class': 'cell svg-cell', 'data-num': num });
      var text = this.el('text', {
        'class': 'cell-text',
        'x': x.toFixed(2),
        'y': y.toFixed(2),
        'font-size': fontSize.toFixed(1),
        'fill': fillColor || NUMBER_COLORS[(num - 1) % NUMBER_COLORS.length]
      });
      text.textContent = String(num);
      g._cellText = text;   // 暂存，等形状构造完再统一 append
      return g;
    },

    /**
     * 创建一个 1000×1000 的基础 svg 画布并挂上皮肤 class。
     * @param {HTMLElement} container 容器
     * @param {string} skinClass 皮肤 class（skin-irregular / skin-honey / ...）
     * @returns {SVGSVGElement}
     */
    createSvg: function (container, skinClass) {
      container.classList.add('board--svg', skinClass);
      var svg = this.el('svg', {
        viewBox: '0 0 1000 1000',
        role: 'img'
      });
      container.appendChild(svg);
      return svg;
    },

    /**
     * 依据“外接参考尺寸”计算格子数字字号。
     * 目标：数字约占格子宽度的 42%，并限制上下限保证 9×9 不挤、4×4 不憨。
     * @param {number} ref 格子参考边长（如多边形等效直径、六边形宽、扇区弧长）
     * @returns {number}
     */
    fontSizeFor: function (ref) {
      return clamp(ref * 0.42, 30, 150);
    },

    /**
     * 将一组点从原包围盒等比缩放平移进 viewBox 的内框（保持比例居中）。
     * 用于蜂巢等先在“自然坐标”里生成、再统一适配画布的形态。
     * @param {Array<{x:number,y:number}>} pts
     * @param {{minX:number,minY:number,maxX:number,maxY:number}} bbox
     * @param {number} [pad=30] 内框边距
     * @returns {Array<{x:number,y:number}>}
     */
    fitPoints: function (pts, bbox, pad) {
      if (pad == null) pad = 30;
      var w = bbox.maxX - bbox.minX;
      var h = bbox.maxY - bbox.minY;
      var scale = Math.min((this.VIEW - pad * 2) / w, (this.VIEW - pad * 2) / h);
      var usedW = w * scale;
      var usedH = h * scale;
      var ox = (this.VIEW - usedW) / 2 - bbox.minX * scale;
      var oy = (this.VIEW - usedH) / 2 - bbox.minY * scale;
      return pts.map(function (p) {
        return { x: p.x * scale + ox, y: p.y * scale + oy };
      });
    },

    /**
     * 计算点集包围盒。
     * @param {Array<{x:number,y:number}>} pts
     * @returns {{minX:number,minY:number,maxX:number,maxY:number}}
     */
    bboxOf: function (pts) {
      var bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      pts.forEach(function (p) {
        bbox.minX = Math.min(bbox.minX, p.x);
        bbox.minY = Math.min(bbox.minY, p.y);
        bbox.maxX = Math.max(bbox.maxX, p.x);
        bbox.maxY = Math.max(bbox.maxY, p.y);
      });
      return bbox;
    }
  };
