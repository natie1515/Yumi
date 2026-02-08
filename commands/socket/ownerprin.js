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
    // Verificamos si incluyó el código
    const tokenInput = args[0]?.toUpperCase()
    if (!tokenInput) {
      return m.reply(`《✧》 Debes usar este comando con el código generado.\n\n*Ejemplo:* \`${usedPrefix + command} ABC1234\``)
    }

    // Buscamos el token en la base de datos
    const tokens = global.db.data.mainTokens || []
    const tokenIndex = tokens.findIndex(t => t.token === tokenInput && t.status === 'available')

    if (tokenIndex === -1) {
      return m.reply('《✧》 El código es inválido, ya fue usado o no existe.')
    }

    // Definimos la ruta hacia la carpeta /Owner
    const ownerPath = path.join(dirname, '../../Sessions/Owner') 
    if (!fs.existsSync(ownerPath)) fs.mkdirSync(ownerPath, { recursive: true })

    const rtx = '`✤` Iniciando vinculación de **BOT PRINCIPAL**...\n\n> La sesión se guardará en la carpeta principal de Owners.'
    
    // Configuramos los flags para que startSubBot use la ruta de Owner
    let commandFlags = {}
    commandFlags[m.sender] = { 
      isOwner: true, 
      customPath: ownerPath 
    }

    try {
      const phone = m.sender.split('@')[0]
      
      // Ejecutamos la vinculación forzando el guardado en /Owner
      await startSubBot(m, client, rtx, true, phone, m.chat, commandFlags, true)

      // Marcamos el código como usado para que no se repita
      global.db.data.mainTokens[tokenIndex].status = 'used'
      global.db.data.mainTokens[tokenIndex].usedBy = m.sender
      
      // Agregamos al usuario a la lista de owners global para permisos totales
      if (global.owner && !global.owner.some(o => o[0] === phone)) {
        global.owner.push([phone, 'Owner Premium', true])
      }

    } catch (e) {
      console.error(e)
      m.reply('⚠︎ Hubo un error al intentar crear la sesión en la carpeta Owner.')
    }
  }
}
