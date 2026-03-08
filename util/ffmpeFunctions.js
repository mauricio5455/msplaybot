import { Jimp } from 'jimp'
import ffmpeg from 'fluent-ffmpeg'
import { writeFile, unlink, readFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

ffmpeg.setFfmpegPath('ffmpeg')

async function imageToSticker(buffer) {

    const size = 512
    const radius = 80

    const image = await Jimp.read(buffer)
    const w = image.bitmap.width
    const h = image.bitmap.height
    const minSide = Math.min(w, h)

    image.crop({
        x: Math.floor((w - minSide) / 2),
        y: Math.floor((h - minSide) / 2),
        w: minSide,
        h: minSide
    }).resize({ w: size, h: size })

    image.scan(0, 0, size, size, function (x, y, idx) {
        const inCornerTL = x < radius && y < radius && Math.hypot(x - radius, y - radius) > radius
        const inCornerTR = x > size - radius && y < radius && Math.hypot(x - (size - radius), y - radius) > radius
        const inCornerBL = x < radius && y > size - radius && Math.hypot(x - radius, y - (size - radius)) > radius
        const inCornerBR = x > size - radius && y > size - radius && Math.hypot(x - (size - radius), y - (size - radius)) > radius
        if (inCornerTL || inCornerTR || inCornerBL || inCornerBR) {
            this.bitmap.data[idx + 3] = 0
        }
    })

    const pngBuffer = await image.getBuffer('image/png')

    const inputPath = join(tmpdir(), `temp_${Date.now()}.png`)
    const outputPath = join(tmpdir(), `temp_${Date.now()}.webp`)

    await writeFile(inputPath, pngBuffer)

    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', 'scale=512:512',
                '-lossless', '1',
                '-preset', 'default',
                '-loop', '0',
                '-an',
                '-vsync', '0'
            ])
            .save(outputPath)
            .on('end', resolve)
            .on('error', reject)
    })

    const stickerBuffer = await readFile(outputPath)

    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})

    return stickerBuffer
}

async function videoToSticker(buffer) {
    const inputPath = join(tmpdir(), `input_${Date.now()}.mp4`)
    const outputPath = join(tmpdir(), `sticker_${Date.now()}.webp`)

    await writeFile(inputPath, buffer)

    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .inputOptions(['-t 6'])
            .outputOptions([
            '-vf', 'scale=320:320:force_original_aspect_ratio=increase,crop=320:320,fps=14',
            '-vcodec', 'libwebp',
            '-lossless', '0',
            '-qscale', '75',
            '-loop', '0',
            '-preset', 'default',
            '-an',
            '-vsync', '0',
            '-compression_level', '6'
            ])
            .toFormat('webp')
            .save(outputPath)
            .on('end', resolve)
            .on('error', reject)
        })

    const stickerBuffer = await readFile(outputPath)

    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})

    return stickerBuffer
}

export { imageToSticker, videoToSticker };