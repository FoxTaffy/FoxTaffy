import assert from 'node:assert/strict'
import { areaPath, smoothPath, toPoints } from '../src/utils/chartUtils.js'

const pts = toPoints([0, 5, 10], { width: 100, height: 60, padX: 10, padTop: 10, padBottom: 10 })
assert.deepEqual(pts.map(p => p.y), [50, 30, 10])
assert.equal(pts[0].x, 10)
assert.equal(pts[2].x, 90)

assert.match(smoothPath(pts), /^M 10\.00 50\.00 C /)
assert.equal(smoothPath(pts.slice(0, 1)), '')
assert.match(areaPath(pts, 60), /^M 10\.00 60 L 10\.00 50\.00 C .* L 90\.00 60 Z$/)

// Пустые данные не дают NaN
assert.ok(toPoints([0, 0], { width: 100, height: 60 }).every(p => Number.isFinite(p.y)))
console.log('chartUtils test ok')
