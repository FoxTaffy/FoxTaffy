const fmt = (n) => n.toFixed(2)

// Катмулл–Ром → кубические кривые Безье через все точки
const segment = (pts, i) => {
  const p0 = pts[i - 2] ?? pts[i - 1]
  const p1 = pts[i - 1]
  const p2 = pts[i]
  const p3 = pts[i + 1] ?? pts[i]
  const c1 = [p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6]
  const c2 = [p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6]
  return ` C ${fmt(c1[0])} ${fmt(c1[1])}, ${fmt(c2[0])} ${fmt(c2[1])}, ${fmt(p2.x)} ${fmt(p2.y)}`
}

export function smoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`
  for (let i = 1; i < pts.length; i++) d += segment(pts, i)
  return d
}

/** Замкнутая область под кривой до линии baseline. */
export function areaPath(pts, baseline) {
  if (pts.length < 2) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  return `${smoothPath(pts).replace(/^M [\d.]+ [\d.]+/, `M ${fmt(first.x)} ${baseline} L ${fmt(first.x)} ${fmt(first.y)}`)} L ${fmt(last.x)} ${baseline} Z`
}

/** Значения → точки в рамке width×height с отступами; max не меньше 1, чтобы не делить на ноль. */
export function toPoints(values, { width, height, padX = 12, padTop = 10, padBottom = 10 }) {
  const max = Math.max(...values, 1)
  const usable = height - padTop - padBottom
  return values.map((value, i) => ({
    x: padX + (values.length > 1 ? (i / (values.length - 1)) * (width - padX * 2) : 0),
    y: padTop + (1 - value / max) * usable
  }))
}
