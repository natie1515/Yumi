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

      // 1. ESCANEO MASIVO DE CHATS (Suma todo lo que tengan en cada grupo)
      Object.keys(db.chats || {}).forEach(chatId => {
        const usersInChat = db.chats[chatId].users || {}
        Object.entries(usersInChat).forEach(([jid, data]) => {
          if (!globalUsers[jid]) {
            globalUsers[jid] = { 
              jid, 
              name: db.users[jid]?.name || data.name || jid.split('@')[0], 
              total: 0 
            }
          }
          // Suma acumulativa de monedas en todos los grupos donde aparezca el JID
          globalUsers[jid].total += (data.coins || 0)
        })
      })

      // 2. ESCANEO MASIVO DE BANCO Y DATOS GLOBALES
      Object.entries(db.users || {}).forEach(([jid, data]) => {
        if (globalUsers[jid]) {
          // Si ya lo encontramos en los chats, le sumamos su banco
          globalUsers[jid].total += (data.bank || 0)
        } else if ((data.bank || 0) > 0 || (data.coins || 0) > 0) {
          // Si solo tiene dinero en la tabla global, lo agregamos
          globalUsers[jid] = { 
            jid, 
            name: data.name || jid.split('@')[0], 
            total: (data.bank || 0) + (data.coins || 0) 
          }
        }
      })

      // Filtramos para que salgan todos (desde el más pobre al más millonario)
      const ranking = Object.values(globalUsers)
        .filter(u => u.total > 0) 
        .sort((a, b) => b.total - a.total)

      if (ranking.length === 0) return m.reply(`ꕥ No hay registros de dinero en la base de datos.`)

      // 3. PAGINACIÓN DE 5 EN 5
      const page = parseInt(args[0]) || 1
      const pageSize = 5 
      const totalPages = Math.ceil(ranking.length / pageSize)

      if (page > totalPages || page < 1) {
        return m.reply(`《✧》 La página *${page}* no existe. Total de páginas: *${totalPages}*`)
      }

      const start = (page - 1) * pageSize
      const pageUsers = ranking.slice(start, start + pageSize)

      // 4. DISEÑO (Idéntico a tu ejemplo con ✩ y ›)
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
      await m.reply(`> Error al procesar el Ranking Global.\n> [Error: *${e.message}*]`)
    }
  }
}
