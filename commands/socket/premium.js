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
    
    // Verificar si el TOKEN expiró antes de usarse
    if (Date.now() > tokens[tokenIndex].expiration) {
        tokens[tokenIndex].status = 'expired'
        return m.reply('《✧》 Este código ha expirado.')
    }

    const phone = m.sender.split('@')[0]
    // Ajuste de ruta para que lib/subs.js no se confunda
    const premiumPath = path.join(dirname, `../../Sessions/Premium/${phone}`) 
    if (!fs.existsSync(premiumPath)) fs.mkdirSync(premiumPath, { recursive: true })

    const rtx = '`✤` Vinculando como **BOT PREMIUM**...\n\n> Registrando sesión por **1 MES** en la carpeta /Premium.'
    
    let commandFlags = {}
    commandFlags[m.sender] = { 
      isPremium: true,
      customPath: premiumPath 
    }

    try {
      const sock = await startSubBot(m, client, rtx, true, phone, m.chat, commandFlags, true)

      // MARCAR COMO USADO
      global.db.data.premiumTokens[tokenIndex].status = 'used'
      global.db.data.premiumTokens[tokenIndex].usedBy = m.sender

      // --- LÓGICA DE DESVINCULACIÓN (1 MES) ---
      const unMes = 30 * 24 * 60 * 60 * 1000
      setTimeout(async () => {
          try {
              await sock.logout() // Desconecta
              fs.rmSync(premiumPath, { recursive: true, force: true }) // Borra carpeta
              console.log(`[ PREMIUM ] Sesión de ${phone} expirada y eliminada.`)
          } catch (e) { console.error(e) }
      }, unMes)

    } catch (e) {
      console.error(e)
      m.reply('⚠︎ Error al vincular. Reintenta en un momento.')
    }
  }
}
