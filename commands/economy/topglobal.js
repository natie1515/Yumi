export default {
  command: ['globaltop'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix, command) => {
    const db = global.db.data
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId] || {}
    const monedas = botSettings.currency || 'Yenes'

    try {
      // 1. EXTRAER ABSOLUTAMENTE TODO DE LA DB GLOBAL
      const users = Object.entries(db.users || {})
        .map(([key, data]) => {
          const total = (data.coins || 0) + (data.bank || 0)
          return { jid: key, name: data.name || 'Usuario', total }
        })
        .filter(u => u.total > 0) // <--- Bajado a 0 para que no diga que no hay datos
        .sort((a, b) => b.total - a.total)

      if (users.length === 0) return m.reply(`ꕥ La base de datos global está vacía o nadie tiene dinero aún.`)

      // 2. PREMIOS SEMANALES
      const now = new Date()
      const weekId = `${now.getFullYear()}-W${getWeekNumber(now)}`
      if (!db.lastWeeklyReward) db.lastWeeklyReward = {}
      
      if (db.lastWeeklyReward.week !== weekId) {
        const winners = users.slice(0, 3)
        let congrats = `🎊 *¡PREMIOS SEMANALES DEL TOP GLOBAL!* 🎊\n\n`
        winners.forEach((u, i) => {
          const prize = i === 0 ? 100000 : i === 1 ? 50000 : 25000
          if (db.users[u.jid]) db.users[u.jid].bank += prize
          congrats += `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} *${u.name}* › *+${prize.toLocaleString()}* ${monedas}\n`
        })
        db.lastWeeklyReward.week = weekId
        await client.sendMessage(m.chat, { text: congrats, mentions: winners.map(w => w.jid) })
      }

      // 3. TOP 20 GLOBAL
      const page = parseInt(args[0]) || 1
      const pageSize = 20 
      const totalPages = Math.ceil(users.length / pageSize)

      if (page > totalPages) return m.reply(`《✧》 Solo hay *${totalPages}* páginas.`)

      const start = (page - 1) * pageSize
      const pageUsers = users.slice(start, start + pageSize)

      let text = `🌍 *TOP 20 RIQUEZA GLOBAL* 🌍\n`
      text += `> Sumando todos los grupos del sistema\n\n`

      text += pageUsers.map(({ jid, name, total }, i) => {
        const pos = start + i + 1
        let icon = pos === 1 ? '👑' : pos === 2 ? '✨' : pos === 3 ? '⭐' : '•'
        return `${icon} ${pos} › *${name}*\n     Total → *¥${total.toLocaleString()} ${monedas}*`
      }).join('\n\n')

      text += `\n\n> 📊 Página *${page}* de *${totalPages}*`
      
      if (page < totalPages)
        text += `\n> Ver más › *${usedPrefix + command} ${page + 1}*`

      await client.sendMessage(m.chat, { text, mentions: pageUsers.map(u => u.jid) }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply(`⚠ Error: ${e.message}`)
    }
  }
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
