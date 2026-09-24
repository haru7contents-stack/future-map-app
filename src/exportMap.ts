import { jsPDF } from 'jspdf'
import { Item, MAP_H, MAP_W, FONT } from './layout'

const BG = `${import.meta.env.BASE_URL}images/future-map-background.png`

export async function loadFonts(items: Item[]) {
  const sample = items.map((i) => (i.kind === 'text' ? i.text : '')).join('') + '0123456789'
  await Promise.all([
    document.fonts.load(`500 20px ${FONT}`, sample),
    document.fonts.load(`700 20px ${FONT}`, sample),
  ])
  await document.fonts.ready
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

export async function renderCanvas(items: Item[], scale = 2): Promise<HTMLCanvasElement> {
  await loadFonts(items)
  const bg = await loadImage(BG)
  const c = document.createElement('canvas')
  c.width = MAP_W * scale
  c.height = MAP_H * scale
  const g = c.getContext('2d')!
  g.scale(scale, scale)
  g.drawImage(bg, 0, 0, MAP_W, MAP_H)
  g.textBaseline = 'middle'
  for (const it of items) {
    if (it.kind === 'rect') {
      g.strokeStyle = it.color
      g.lineWidth = 2
      g.strokeRect(it.x, it.y, it.size, it.size)
    } else {
      g.font = `${it.weight} ${it.size}px ${FONT}`
      g.fillStyle = it.color
      g.textAlign = it.anchor === 'middle' ? 'center' : 'left'
      g.fillText(it.text, it.x, it.y)
    }
  }
  return c
}

export const canvasToBlob = (c: HTMLCanvasElement) =>
  new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/png'))

export async function makePdfBlob(c: HTMLCanvasElement): Promise<Blob> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pw = 210
  const ph = 297
  const ratio = MAP_W / MAP_H
  let w = pw
  let h = w / ratio
  if (h > ph) {
    h = ph
    w = h * ratio
  }
  pdf.addImage(c.toDataURL('image/jpeg', 0.95), 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h)
  return pdf.output('blob')
}

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
