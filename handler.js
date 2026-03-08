import { readdirSync } from 'fs'
import { pathToFileURL, fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function carregarComandos() {
  const comandos = new Map()
  const arquivos = readdirSync('./comandos').filter(f => f.endsWith('.js'))

  for (const arquivo of arquivos) {
    const caminho = pathToFileURL(path.join(__dirname, 'comandos', arquivo)).href
    const modulo = await import(caminho)
    const cmd = modulo.default

    comandos.set(cmd.nome, cmd)

    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        comandos.set(alias, cmd)
      }
    }

    console.log(`✅ Comando carregado: ${cmd.nome}`)
  }

  return comandos
}