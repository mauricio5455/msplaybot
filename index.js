import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from '@whiskeysockets/baileys'
import P from 'pino'
import qrCode from 'qrcode-terminal'
import cfontconfig from './util/cfontconfig.js'
import chalk from 'chalk'
import { carregarComandos } from './handler.js'

cfontconfig()

const PREFIX = ''
const timeOut = new Map()

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()

  const comandos = await carregarComandos()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('📱 Escaneie o QR abaixo:\n')
      qrCode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log(`✅ ${chalk.white.bgGreen('Conectado ao WhatsApp!')}`)
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if(msg.key.fromMe) return
    if (!msg.message) return
    
    const sender = msg.key.remoteJid
    const body = msg.message

    const senderInfo = timeOut.get(sender) || 0
    
    if(senderInfo) {
      if(Date.now() - senderInfo < 10000) {
        return
      } else {
        timeOut.set(sender, Date.now())
      }
    } else {
      timeOut.set(sender, Date.now())
    }


    const texto = (
      body?.conversation ||
      body?.extendedTextMessage?.text ||  body?.imageMessage?.caption || body?.videoMessage?.caption || ''
    ).trim()

    if (PREFIX && !texto.startsWith(PREFIX)) return

    const semPrefix = texto.slice(PREFIX.length).trim()
    const [nomeCmd, ...args] = semPrefix.toLowerCase().split(/\s+/)

    const comando = comandos.get(nomeCmd)
    if (!comando) return

    try {
      await comando.executar({ sock, sender, args, msg, body })
    } catch (err) {
      console.error(`❌ ${chalk.red('Erro no comando "${nomeCmd}":')}`, err)
      await sock.sendMessage(sender, { text: '❌ Erro ao executar o comando.' })
    }
  })
}

startBot()