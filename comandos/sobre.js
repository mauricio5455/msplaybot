import fs from 'fs'
const pkg = JSON.parse(fs.readFileSync('./package.json'))

export default {
  nome: 'sobre',
  aliases: ['about'],
  descricao: 'Retorna informações sobre a criação do bot',
  async executar({ sock, sender, msg}) {
    await sock.sendMessage(sender, { text: msgText },{ quoted: msg })
  }
}

const msgText = `Olá! 👋 \nO código para este foi criado disponibilizado pelo canal *MS PLAY* no YouTube.

Versão: ${pkg.version}


*ESTE CONTATO E INSTÂNCIA DO BOT NÃO PERTENCEM AO CANAL, TENDO O CANAL APENAS DISPONIBILIZADO O CÓDIGO PARA USO.*`