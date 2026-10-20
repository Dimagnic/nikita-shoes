// Optimiza las fotos al subirlas: tamaño grande y nítido (hasta 2400 px), versión mediana para
// tarjetas (1000 px), formato WebP de alta calidad y un afinado muy leve al reducir.

const MD = /(\/storage\/v1\/object\/public\/products\/[0-9a-f-]{36})\.(webp|jpg)$/

/** URL de la versión mediana (tarjetas y miniaturas). Si no existe, se usa la original. */
export const thumb = (u?: string | null) => (u ? u.replace(MD, '$1_md.$2') : '')

function canvasOf(src: CanvasImageSource, w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')!
  x.fillStyle = '#fff'
  x.fillRect(0, 0, w, h)
  x.imageSmoothingEnabled = true
  x.imageSmoothingQuality = 'high'
  x.drawImage(src, 0, 0, w, h)
  return c
}

// Reducción por pasos (mitades): evita el aspecto blando y los dientes de sierra.
function scaleTo(src: ImageBitmap, maxSide: number) {
  const k = Math.min(1, maxSide / Math.max(src.width, src.height))
  const tw = Math.round(src.width * k)
  const th = Math.round(src.height * k)
  let cur: CanvasImageSource = src
  let cw = src.width
  let ch = src.height
  while (cw / 2 > tw) {
    cw = Math.round(cw / 2)
    ch = Math.round(ch / 2)
    cur = canvasOf(cur, cw, ch)
  }
  return { canvas: canvasOf(cur, tw, th), scaled: k < 0.95 }
}

function sharpen(c: HTMLCanvasElement, amount: number) {
  const x = c.getContext('2d')!
  const { width: w, height: h } = c
  const img = x.getImageData(0, 0, w, h)
  const d = img.data
  const out = new Uint8ClampedArray(d)
  const k = 1 + 4 * amount
  for (let y = 1; y < h - 1; y++) {
    for (let px = 1; px < w - 1; px++) {
      const i = (y * w + px) * 4
      for (let ch = 0; ch < 3; ch++) {
        out[i + ch] = k * d[i + ch] - amount * (d[i - 4 + ch] + d[i + 4 + ch] + d[i - w * 4 + ch] + d[i + w * 4 + ch])
      }
    }
  }
  x.putImageData(new ImageData(out, w, h), 0, 0)
}

const toBlob = (c: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((res) => c.toBlob(res, type, 0.92))

export async function processImage(file: File) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const big = scaleTo(bmp, 2400)
    if (big.scaled) sharpen(big.canvas, 0.25)
    let full = await toBlob(big.canvas, 'image/webp')
    let ext: 'webp' | 'jpg' = 'webp'
    if (!full || full.type !== 'image/webp') { // navegadores que no codifican WebP
      full = await toBlob(big.canvas, 'image/jpeg')
      ext = 'jpg'
    }
    const mid = scaleTo(bmp, 1000)
    if (mid.scaled) sharpen(mid.canvas, 0.35)
    const md = await toBlob(mid.canvas, ext === 'webp' ? 'image/webp' : 'image/jpeg')
    if (!full || !md) throw new Error('No se pudo procesar la imagen')
    return { full, md, ext }
  } finally {
    bmp.close()
  }
}
