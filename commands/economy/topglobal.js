export default {
  command: ['globaltop'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix, command) => {
    const db = global.db.data
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId] || {}
    const monedas = botSettings.currency || 'Yenes'

    try {
      let globalUsers = {}

      // 1. ESCANEO DE LA TABLA DE USUARIOS (Donde se guarda el banco y XP global)
      Object.entries(db.users || {}).forEach(([jid, data]) => {
        if (!globalUsers[jid]) {
          globalUsers[jid] = { 
            jid, 
            name: data.name || jid.split('@')[0], 
            total: 0 
          }
        }
        // Sumamos lo que tenga en el banco y si tiene monedas globales
        globalUsers[jid].total += (data.bank || 0) + (data.coins || 0)
      })

      // 2. ESCANEO AGRESIVO DE CHATS (Para sumar monedas locales de CADA grupo)
      // Esto asegura que si alguien tiene 10 millones en un grupo oculto, se sumen.
      if (db.chats) {
        Object.values(db.chats).forEach(chatData => {
          if (chatData.users) {
            Object.entries(chatData.users).forEach(([jid, userData]) => {
              if (userData.coins) {
                if (!globalUsers[jid]) {
                  globalUsers[jid] = { 
                    jid, 
                    name: db.users[jid]?.name || userData.name || jid.split('@')[0], 
                    total: 0 
                  }
                }
                globalUsers[jid].total += userData.coins
              }
            })
          }
        })
      }

      // Convertir a lista y ordenar de mayor a menor (incluyendo a los de millones)
      const ranking = Object.values(globalUsers)
        .filter(u => u.total > 0) 
        .sort((a, b) => b.total - a.total)

      if (ranking.length === 0) return m.reply(`ꕥ No se encontraron datos de riqueza en ninguna tabla.`)

      // 3. PAGINACIÓN DE 5 EN 5 (Como pediste)
      const page = parseInt(args[0]) || 1
      const pageSize = 5 
      const totalPages = Math.ceil(ranking.length / pageSize)

      if (page > totalPages || page < 1) {
        return m.reply(`《✧》 La página *${page}* no existe. Total: *${totalPages}* páginas.`)
      }

      const start = (page - 1) * pageSize
      const pageUsers = ranking.slice(start, start + pageSize)

      // 4. DISEÑO ESTÉTICO (✩, ›, (✿◡‿◡))
      let text = `*✩ GlobalTop (✿◡‿◡)*\n\n`

      text += pageUsers.map(({ name, total }, i) => {
        return `✩ ${start + i + 1} › *${name}*\n     Total → *¥${total.toLocaleString()} ${monedas}*`
      }).join('\n')

      text += `\n\n> ⌦ Página *${page}* de *${totalPages}*`
      
      if (page < totalPages) {
        text += `\n> Para ver la siguiente página › *${usedPrefix + command} ${page + 1}*`
      }

      await client.sendMessage(m.chat, { 
        text, 
        mentions: pageUsers.map(u => u.jid) 
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply(`> Error al procesar la suma global.\n> [Error: *${e.message}*]`)
    }
  }
}
