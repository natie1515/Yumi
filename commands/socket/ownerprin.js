import { startSubBot } from '../../lib/subs.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
  command: ['beowner', 'claimowner'],
  category: 'owner',
  run: async (client, m, args, usedPrefix, command) => {
    const tokenInput = args[0]?.toUpperCase()
    if (!tokenInput) return m.reply(`《✧》 Ingresa el código premium para ser **Bot Principal**.`)

    const tokens = global.db.data.mainTokens || []
    const tokenIndex = tokens.findIndex(t => t.token === tokenInput && t.status === 'available')

    if (tokenIndex === -1) return m.reply('《✧》 Código inválido o ya utilizado.')

    // 1. RUTA HACIA LA CARPETA OWNER (Visto en tu File Manager)
    const ownerPath = path.join(dirname, '../../Sessions/Owner') 
    if (!fs.existsSync(ownerPath)) fs.mkdirSync(ownerPath, { recursive: true })

    // 2. INYECCIÓN DE RANGO: Esto es lo que evita que salga como "Sub"
    const phone = m.sender.split('@')[0]
    
    // Lo agregamos a la lista de owners global para que el sistema lo cuente como Principal
    if (!global.owner.some(o => o[0] === phone)) {
      global.owner.push([phone, 'Bot Principal Premium', true])
    }
    
    // También lo guardamos en la DB para que persista tras reiniciar
    if (!global.db.data.config) global.db.data.config = { owners: [] }
    if (!global.db.data.config.owners.includes(m.sender)) {
      global.db.data.config.owners.push(m.sender)
    }

    const rtx = '`✤` Vinculando como **BOT PRINCIPAL**...\n\n> Registrando en lista de Owners y carpeta principal.'
    
    let commandFlags = {}
    commandFlags[m.sender] = { 
      isOwner: true, 
      customPath: ownerPath // Forzamos la carpeta de tu captura
    }

    try {
      // 3. VINCULACIÓN
      await startSubBot(m, client, rtx, true, phone, m.chat, commandFlags, true)

      // Marcar código como usado
      global.db.data.mainTokens[tokenIndex].status = 'used'
      global.db.data.mainTokens[tokenIndex].usedBy = m.sender

    } catch (e) {
      console.error(e)
      m.reply('⚠︎ Error al vincular en la carpeta Owner.')
    }
  }
}
