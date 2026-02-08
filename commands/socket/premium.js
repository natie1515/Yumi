import { startSubBot } from '../../lib/subs.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
  command: ['bepremium', 'claimpremium'],
  category: 'owner',
  run: async (client, m, args, usedPrefix, command) => {
    const tokenInput = args[0]?.toUpperCase()
    if (!tokenInput) return m.reply(`《✧》 Ingresa el código premium para ser **Bot Premium**.`)

    const tokens = global.db.data.premiumTokens || []
    const tokenIndex = tokens.findIndex(t => t.token === tokenInput && t.status === 'available')

    if (tokenIndex === -1) return m.reply('《✧》 Código inválido o ya utilizado.')

    // 1. RUTA HACIA LA CARPETA PREMIUM (Siguiendo tu estructura de carpetas)
    const premiumPath = path.join(dirname, '../../Sessions/Premium') 
    if (!fs.existsSync(premiumPath)) fs.mkdirSync(premiumPath, { recursive: true })

    // 2. INYECCIÓN DE TIPO: Para que el sistema lo reconozca como Premium
    const phone = m.sender.split('@')[0]
    
    // Lo marcamos como premium en la base de datos de configuraciones
    if (!global.db.data.settings[m.sender]) global.db.data.settings[m.sender] = {}
    global.db.data.settings[m.sender].botprem = true
    global.db.data.settings[m.sender].type = 'Premium'

    const rtx = '`✤` Vinculando como **BOT PREMIUM**...\n\n> Registrando en lista de Premiums y carpeta /Premium.'
    
    let commandFlags = {}
    commandFlags[m.sender] = { 
      isPremium: true // Activa la lógica que pusimos en tu lib/subs.js
    }

    try {
      // 3. VINCULACIÓN (Usando tu función startSubBot corregida)
      await startSubBot(m, client, rtx, true, phone, m.chat, commandFlags, true)

      // Marcar código como usado
      global.db.data.premiumTokens[tokenIndex].status = 'used'
      global.db.data.premiumTokens[tokenIndex].usedBy = m.sender

    } catch (e) {
      console.error(e)
      m.reply('⚠︎ Error al vincular en la carpeta Premium.')
    }
  }
}

