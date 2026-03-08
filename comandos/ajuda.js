export default {
  nome: 'ajuda',
  aliases: ['help', 'h', 'comandos', 'c', 'a'],
  descricao: 'Lista os comandos disponíveis',
  async executar({ sock, sender, msg }) {
    await sock.sendMessage(sender, {
      text: textMsg
    },{ quoted: msg })
  }
}

const textMsg = `Olá! 👋 \n\n 📋Estes são os comandos disponíveis:

*sticker*: Quando enviado na legenda de uma imagem, vídeo ou gif, cria uma figurinha;

*ping*: Igual ao seu apêndice, mas nunca tenta te matar; retorna "pong" se o bot estiver ativo;

*ajuda*: Você acabou de usar 🤷🏾, retorna esta mensagem de ajuda;

*sobre*: Retorna algumas informações sobre o bot;`