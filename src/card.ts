import { Result } from './generate'

// シェア用の画像（1080×1350・Threads/インスタの縦長サイズ）
const W = 1080
const H = 1350
const FONT = '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", sans-serif'
const C = { bg: '#fbf6ea', box: '#ffffff', sage: '#8fa88a', orange: '#c8702a', brown: '#4a3a30', beige: '#efe3cf' }

export async function loadFonts() {
  await Promise.all([
    document.fonts.load(`500 20px ${FONT}`, 'あ'),
    document.fonts.load(`700 20px ${FONT}`, 'あ'),
  ])
  await document.fonts.ready
}

// 日本語を1文字ずつ測って折り返す（行頭に句読点が来ないようにする）
function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (g.measureText(line + ch).width > maxW && line) {
      if ('、。」）'.includes(ch)) {
        line += ch
        continue
      }
      lines.push(line)
      line = ch
    } else line += ch
  }
  if (line) lines.push(line)
  return lines
}

function para(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, size: number, lh: number, weight = 500, color = C.brown, maxLines = 99) {
  g.font = `${weight} ${size}px ${FONT}`
  g.fillStyle = color
  const lines = wrap(g, text, maxW)
  const shown = lines.slice(0, maxLines)
  if (lines.length > maxLines) shown[maxLines - 1] = shown[maxLines - 1].slice(0, -1) + '…'
  shown.forEach((l, i) => g.fillText(l, x, y + i * lh))
  return y + shown.length * lh
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
  g.fillStyle = fill
  g.fill()
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => res(null)
    img.src = src
  })
}

export async function renderCard(r: Result, scale = 1): Promise<HTMLCanvasElement> {
  await loadFonts()
  const haru = await loadImage(`${import.meta.env.BASE_URL}images/haru/dekita.png`)
  const c = document.createElement('canvas')
  c.width = W * scale
  c.height = H * scale
  const g = c.getContext('2d')!
  g.scale(scale, scale)
  g.textBaseline = 'top'
  g.fillStyle = C.bg
  g.fillRect(0, 0, W, H)

  const X = 80
  const IW = W - X * 2
  g.textAlign = 'center'
  g.font = `700 30px ${FONT}`
  g.fillStyle = C.sage
  g.fillText('私の商品のタネ診断', W / 2, 70)
  g.font = `700 58px ${FONT}`
  g.fillStyle = C.brown
  g.fillText('私の商品カルテ（ミニ版）', W / 2, 118)
  g.textAlign = 'left'
  if (haru) {
    const ih = 170
    const iw = (haru.width / haru.height) * ih
    g.drawImage(haru, W - X - iw + 30, 30, iw, ih)
  }

  let y = 220
  const block = (no: string, head: string, body: string, maxLines: number) => {
    g.font = `500 36px ${FONT}`
    const n = Math.min(wrap(g, body, IW - 72).length, maxLines)
    const bh = 84 + n * 52
    roundRect(g, X, y, IW, bh, 24, C.box)
    g.font = `700 28px ${FONT}`
    g.fillStyle = C.orange
    g.fillText(`${no}  ${head}`, X + 36, y + 28)
    para(g, body, X + 36, y + 72, IW - 72, 36, 52, 500, C.brown, maxLines)
    y += bh + 22
  }
  block('01', '私はこんな人', r.meShort, 2)
  block('02', '届けたい人', `${r.target}（いちばんの困りごと：${r.trouble}）`, 2)
  block('05', '私だから入れられる経験', r.strength, 2)

  // 商品のタネ（残りの高さに合わせて、上下中央にそろえる）
  const top = y
  const bottom = H - 140
  roundRect(g, X, top, IW, bottom - top, 24, C.beige)
  g.font = `700 32px ${FONT}`
  g.fillStyle = C.brown
  g.fillText('🌱 あなたの商品のタネ', X + 36, top + 30)
  let seeds = r.seeds.slice(0, 3)
  g.font = `700 31px ${FONT}`
  const height = (list: typeof seeds) =>
    list.reduce((a, s) => a + Math.min(wrap(g, s.title, IW - 120).length, 2) * 43, 0) + (list.length - 1) * 18
  while (seeds.length > 1 && height(seeds) > bottom - top - 105) seeds = seeds.slice(0, -1)
  const total = height(seeds)
  let sy = top + 84 + Math.max(0, (bottom - top - 104 - total) / 2)
  seeds.forEach((s, i) => {
    g.fillStyle = C.sage
    g.beginPath()
    g.arc(X + 50, sy + 17, 8, 0, Math.PI * 2)
    g.fill()
    sy = para(g, s.title, X + 76, sy, IW - 120, 31, 43, 700, C.brown, 2) + 18
    void i
  })

  g.textAlign = 'center'
  g.font = `700 28px ${FONT}`
  g.fillStyle = C.brown
  g.fillText('by ハル @haru7_contents', W / 2, H - 108)
  g.font = `500 22px ${FONT}`
  g.globalAlpha = 0.7
  g.fillText('※商品のアイデアの例です。収入や売れることを約束するものではありません', W / 2, H - 60)
  g.globalAlpha = 1
  return c
}

export const canvasToBlob = (c: HTMLCanvasElement) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/png'))

export async function saveBlob(blob: Blob, filename: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: blob.type })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare && nav.canShare({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'shared'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
  return 'downloaded'
}
