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

      // 1. ESCANEAR TODOS LOS CHATS PARA SUMAR MONEDAS
      Object.keys(db.chats || {}).forEach(chatId => {
        const usersInChat = db.chats[chatId].users || {}
        Object.entries(usersInChat).forEach(([jid, data]) => {
          if (!globalUsers[jid]) {
            globalUsers[jid] = { 
              jid, 
              name: db.users[jid]?.name || 'Usuario', 
              total: 0 
            }
          }
          globalUsers[jid].total += (data.coins || 0)
        })
      })

      // 2. SUMAR SALDO DEL BANCO GLOBAL
      Object.entries(db.users || {}).forEach(([jid, data]) => {
        if (globalUsers[jid]) {
          globalUsers[jid].total += (data.bank || 0)
        } else if ((data.bank || 0) > 0) {
          globalUsers[jid] = { jid, name: data.name || 'Usuario', total: data.bank }
        }
      })

      const ranking = Object.values(globalUsers)
        .filter(u => u.total > 0)
        .sort((a, b) => b.total - a.total)

      if (ranking.length === 0) return m.reply(`ꕥ No hay datos de riqueza registrados en el sistema.`)

      // 3. PAGINACIÓN FIJA DE 5 USUARIOS
      const page = parseInt(args[0]) || 1
      const pageSize = 5 
      const totalPages = Math.ceil(ranking.length / pageSize)

      if (page > totalPages || page < 1) return m.reply(`《✧》 Página inexistente. Solo hay *${totalPages}* páginas disponibles.`)

      const start = (page - 1) * pageSize
      const pageUsers = ranking.slice(start, start + pageSize)

      let text = `🌍 *RANKING GLOBAL DE RIQUEZA* 🌍\n`
      text += `> Suma total de todos los grupos y banco global\n\n`

      text += pageUsers.map(({ jid, name, total }, i) => {
        const pos = start + i + 1
        let icon = pos === 1 ? '👑' : pos === 2 ? '✨' : pos === 3 ? '⭐' : '•'
        return `${icon} ${pos} › *${name}*\n     Total → *¥${total.toLocaleString()} ${monedas}*`
      }).join('\n\n')

      text += `\n\n> 📊 Página *${page}* de *${totalPages}*`
      
      if (page < totalPages) {
        text += `\n> Ver más millonarios › *${usedPrefix + command} ${page + 1}*`
      }

      await client.sendMessage(m.chat, { text, mentions: pageUsers.map(u => u.jid) }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply(`⚠ Error al generar el ranking: ${e.message}`)
    }
  }
}
