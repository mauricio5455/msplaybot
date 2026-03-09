import { imageToSticker, videoToSticker } from '../util/ffmpeFunctions.js'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import chalk from 'chalk'

export default {
  nome: 'sticker',
  aliases: ['s', 'f', 'figu', 'figurinha'],
  descricao: 'Cria uma figurinha a partir de um vídeo, gif ou imagem',
  async executar({ sock, sender, body, msg }) {

    const imageMsg = body?.imageMessage
    const videoMsg = body?.videoMessage
    
    if(!imageMsg && !videoMsg) return await sock.sendMessage(sender, {text: 'Você precisa usar este comando como legenda de uma imagem, vídeo ou gif 🖼️.'},{ quoted: msg })


    if (videoMsg && (videoMsg.seconds ?? 0) > 8) {
        return await sock.sendMessage(sender, {
            text: '❌ O vídeo deve ter no máximo *8 segundos* para virar figurinha.'
        },{ quoted: msg })
    }    

    try {
        await sock.sendMessage(sender, {react: {text: '⌛', key: msg.key}});
        
        const mediaBuffer = await downloadMediaMessage(msg, 'buffer', {})

        let stickerBuffer

        if (imageMsg) {
            stickerBuffer = await imageToSticker(mediaBuffer)
        } else if (videoMsg) {
            stickerBuffer = await videoToSticker(mediaBuffer)
        }

        await sock.sendMessage(sender, { sticker: stickerBuffer, },{ quoted: msg })
        await sock.sendMessage(sender, {react: {text: '✅', key: msg.key}});

        console.log(`[${chalk.green('Figurinha criada para')} ${chalk.blue(sender)}]`)

    } catch (err) {
        await sock.sendMessage(sender, {react: {text: '❌', key: msg.key}});
        await sock.sendMessage(sender, { text: '❌ Erro ao criar figurinha. Tente novamente.' }, { quoted: msg })

        if(err.code == 'ENOENT') {
            console.log(`❌ ${chalk.red('FFMPEG não encontrado, verifque a intalação ou se foi adicionado ao PATH. \n No termux use: pkg install ffmpeg')}`)
        } else {
            console.error(`❌ ${chalk.red('Erro ao criar figurinha:')}`, err)
        }
    }
  }
}