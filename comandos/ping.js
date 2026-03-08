export default {
  nome: 'ping',
  aliases: ['p'],
  descricao: 'Testa o bot',
  async executar({ sock, sender, msg }) {
    await sock.sendMessage(sender, { text: '🏓 Pong!' },{ quoted: msg })
  }
}