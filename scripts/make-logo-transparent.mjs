/**
 * One-off asset script — removes near-white pixels from the brand logo PNG for dark UI surfaces.
 */
import sharp from 'sharp'
import { copyFileSync, existsSync, renameSync, unlinkSync } from 'node:fs'

const input = 'public/images/dmed-tool-logo.png'
const output = 'public/images/dmed-tool-logo.png'
const backup = 'public/images/dmed-tool-logo.original.png'
const temp = 'public/images/dmed-tool-logo.tmp.png'

if (!existsSync(backup)) {
  copyFileSync(input, backup)
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

const threshold = 238
const softness = 18

for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)

  if (min >= threshold) {
    data[i + 3] = 0
    continue
  }

  if (max >= threshold - softness && min >= threshold - softness - 10) {
    const t = Math.min(1, (min - (threshold - softness)) / softness)
    data[i + 3] = Math.round(data[i + 3] * (1 - t))
  }
}

await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(temp)
renameSync(temp, output)
console.log(`Logo background removed: ${info.width}x${info.height}`)
