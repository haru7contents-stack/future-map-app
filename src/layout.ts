import { Result } from './generate'

export const MAP_W = 1055
export const MAP_H = 1491
export const FONT = '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif'
const BROWN = '#4a3a30'
const WHITE = '#ffffff'

export type TextItem = {
  kind: 'text'
  text: string
  x: number
  y: number // vertical center
  size: number
  weight: 500 | 700
  color: string
  anchor: 'start' | 'middle'
}
export type RectItem = { kind: 'rect'; x: number; y: number; size: number; color: string }
export type Item = TextItem | RectItem
export type Measure = (text: string, size: number, weight: 500 | 700) => number

const NO_HEAD = '、。，．・」』）!?！？ー…,.'

function wrap(text: string, maxW: number, size: number, weight: 500 | 700, m: Measure): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let cur = ''
    for (const ch of Array.from(para)) {
      if (cur && m(cur + ch, size, weight) > maxW && !NO_HEAD.includes(ch)) {
        out.push(cur)
        cur = ch
      } else cur += ch
    }
    out.push(cur)
  }
  return out
}

type Box = { x: number; y: number; w: number; h: number }
type Para = { text: string; box?: boolean }

function fitBlock(
  paras: Para[],
  box: Box,
  m: Measure,
  o: { size: number; min: number; lh?: number; align?: 'start' | 'middle'; weight?: 500 | 700; color?: string; gap?: number; valign?: 'top' | 'middle' },
): Item[] {
  const lh = o.lh ?? 1.35
  const weight = o.weight ?? 500
  const color = o.color ?? BROWN
  const gap = o.gap ?? 0
  const align = o.align ?? 'start'
  for (let size = o.size; size >= o.min - 0.01; size -= 1) {
    const indent = (p: Para) => (p.box ? size * 1.5 : 0)
    const lines = paras.map((p) => wrap(p.text, box.w - indent(p), size, weight, m))
    const total = lines.reduce((s, l) => s + l.length, 0) * size * lh + gap * (paras.length - 1)
    if (total <= box.h || (size <= o.min && paras.length <= 1)) {
      let y = o.valign === 'middle' ? box.y + (box.h - total) / 2 : box.y
      const items: Item[] = []
      paras.forEach((p, i) => {
        const ind = indent(p)
        lines[i].forEach((ln, li) => {
          const cy = y + (size * lh) / 2
          if (p.box && li === 0)
            items.push({ kind: 'rect', x: box.x, y: cy - size * 0.4, size: size * 0.8, color: BROWN })
          const x = align === 'middle' ? box.x + box.w / 2 : box.x + ind
          items.push({ kind: 'text', text: ln, x, y: cy, size, weight, color, anchor: align })
          y += size * lh
        })
        y += gap
      })
      return items
    }
  }
  // 最小サイズでも収まらない時は、最後の項目を減らして収める
  return paras.length > 1 ? fitBlock(paras.slice(0, -1), box, m, o) : []
}

const head = (n: string, cx: number, cy: number, title: string, tx: number): Item[] => [
  { kind: 'text', text: n, x: cx, y: cy + 1, size: 30, weight: 700, color: WHITE, anchor: 'middle' },
  { kind: 'text', text: title, x: tx, y: cy + 4, size: 30, weight: 700, color: BROWN, anchor: 'start' },
]

export function buildItems(r: Result, m: Measure): Item[] {
  const items: Item[] = []
  const t = (text: string, x: number, y: number, size: number, weight: 500 | 700, color = BROWN): Item => ({
    kind: 'text', text, x, y, size, weight, color, anchor: 'middle',
  })
  items.push(t('私だけの未来チートマップ', 527, 40, 46, 700))
  items.push(t('by haru7_contents', 527, 84, 17, 700))
  items.push(t('今の私から、新しい収入づくりへ', 527, 113, 24, 700))

  // ① 今の私
  items.push(...head('1', 147, 166, '今の私', 192))
  items.push(...fitBlock(r.s1.map((s) => ({ text: `・${s}` })), { x: 130, y: 194, w: 268, h: 70 }, m, { size: 21, min: 14, valign: 'middle', gap: 2 }))

  // ② 活かせるもの
  items.push(...head('2', 452, 354, '活かせるもの', 494))
  items.push(...fitBlock(r.s2.map((s) => ({ text: `・${s}` })), { x: 426, y: 388, w: 274, h: 100 }, m, { size: 21, min: 14, valign: 'middle', gap: 2 }))

  // ③ 3つの道
  items.push(...head('3', 218, 547, '検討できる3つの道', 262))
  const arrows: Box[] = [
    { x: 196, y: 583, w: 206, h: 66 },
    { x: 440, y: 583, w: 206, h: 66 },
    { x: 686, y: 583, w: 214, h: 66 },
  ]
  r.paths.forEach((p, i) => {
    items.push(...fitBlock([{ text: `${'ABC'[i]}. ${p}` }], arrows[i], m, { size: 21, min: 14, weight: 700, valign: 'middle', lh: 1.25 }))
  })

  // ④ 私が選んだ方向
  items.push(...head('4', 256, 822, '私が選んだ方向', 298))
  items.push(...fitBlock([{ text: r.s4 }], { x: 230, y: 858, w: 318, h: 68 }, m, { size: 22, min: 16, valign: 'middle' }))

  // ⑤ 今週の具体的な一歩
  items.push(...head('5', 212, 990, '今週の具体的な一歩', 254))
  items.push(...fitBlock(r.s5.map((s) => ({ text: s, box: true })), { x: 186, y: 1024, w: 396, h: 108 }, m, { size: 21, min: 16, valign: 'middle', gap: 8 }))

  // ⑥ 目指す未来
  items.push(...head('6', 177, 1200, '目指す未来', 219))
  items.push(...fitBlock([{ text: r.s6 }], { x: 150, y: 1238, w: 338, h: 116 }, m, { size: 21, min: 16, valign: 'middle', lh: 1.4 }))

  // footer
  items.push(...fitBlock([{ text: '具体的に何をすれば良いかは、\nハルコンテンツ（haru7_contents）をフォロー' }], { x: 290, y: 1398, w: 466, h: 64 }, m, { size: 19, min: 14, weight: 700, align: 'middle', valign: 'middle', lh: 1.3 }))
  return items
}

let ctx: CanvasRenderingContext2D | null = null
export const measure: Measure = (text, size, weight) => {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d')!
  ctx.font = `${weight} ${size}px ${FONT}`
  return ctx.measureText(text).width
}
