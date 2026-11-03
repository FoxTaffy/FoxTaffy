/** Слайды для SlideViewer: { id, src, title, sub } */

export const timelineSlides = (items, subKey) =>
  items
    .filter((item) => item.image)
    .map((item) => ({ id: item.id, src: item.image, title: item.title, sub: item[subKey] }))

export const artSlides = (arts, prefix = 'art') =>
  arts.map((art, i) => ({ id: `${prefix}-${i + 1}`, src: art.full || art.src, title: art.title, sub: art.sub }))
