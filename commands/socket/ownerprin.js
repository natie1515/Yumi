import { startSubBot } from '../../lib/subs.js' // Asegúrate de que tu lib soporte cambio de ruta
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
  command: ['beowner', 'mainbot'],
  category: 'owner',
  run: async (client, m, args, usedPrefix, command) => {
    const token = args[0]?.toUpperCase()
    if (!token) return m.reply(`《✧》 Debes ingresar el token premium para ser Bot Principal.`)

    const tokens = global.db.data.mainTokens || []
    const tokenIndex = tokens.findIndex(t => t.token === token && t.status === 'available')

    if (tokenIndex === -1) return m.reply('《✧》 Token inválido o ya utilizado.')

    // DIRECCIÓN A LA CARPETA OWNER (Visto en tu File Manager)
    const ownerPath = path.join(dirname, '../../Sessions/Owner') 
    if (!fs.existsSync(ownerPath)) fs.mkdirSync(ownerPath, { recursive: true })

    const rtx = '`✤` Iniciando vinculación de **Bot Principal (Owner)**...\n\n> Escanea el código o vincula con el número para crear la sesión en la carpeta principal.'
    
    // Configuramos los flags para que el sistema de conexión sepa que va a la carpeta Owner
    let commandFlags = {}
    commandFlags[m.sender] = { isOwner: true, path: ownerPath }

    try {
      // Usamos el número del que solicita o el parámetro
      const phone = m.sender.split('@')[0]
      
      // Llamamos al iniciador indicando que NO es un sub-bot común
      await startSubBot(m, client, rtx, true, phone, m.chat, commandFlags, true)

      // Quemamos el token
      global.db.data.mainTokens[tokenIndex].status = 'used'
      global.db.data.mainTokens[tokenIndex].usedBy = m.sender
      
    } catch (e) {
      console.error(e)
      m.reply('⚠︎ Error al intentar iniciar la sesión principal.')
    }
  }
}
