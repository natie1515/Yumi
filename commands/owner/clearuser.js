import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['deluser', 'resetuser', 'borrarusuario'],
  isOwner: true, // Solo tú puedes usarlo
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const mentioned = m.mentionedJid
      const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : null)
      
      if (!who2) return client.reply(m.chat, '❀ Por favor, menciona al usuario o cita un mensaje para eliminar sus datos.', m)
      
      const who = await resolveLidToRealJid(who2, client, m.chat)
      await m.react('🕒')

      let encontrado = false

      // 1. Eliminar de los datos específicos del CHAT (Monedas, mensajes, etc.)
      if (global.db.data.chats[m.chat]?.users?.[who]) {
        delete global.db.data.chats[m.chat].users[who]
        encontrado = true
      }

      // 2. Eliminar de los datos GLOBALES (XP, Nivel, Inventario general)
      if (global.db.data.users?.[who]) {
        delete global.db.data.users[who]
        encontrado = true
      }

      if (!encontrado) {
        await m.react('✖️')
        return client.reply(m.chat, 'ꕥ El usuario no tiene datos registrados en la base de datos.', m)
      }

      await m.react('✔️')
      return client.reply(m.chat, `❀ *Datos Eliminados:*\n» Se han borrado todos los registros de @${who.split('@')[0]} correctamente.`, m, { mentions: [who] })

    } catch (error) {
      console.error(error)
      await m.react('✖️')
      return client.reply(m.chat, `⚠︎ Error al intentar eliminar el usuario.\n${error.message}`, m)
    }
  }
}
