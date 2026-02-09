export default {
  command: ['globaltop'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix, command) => {
    const db = global.db.data
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const monedas = botSettings.currency || 'Yenes'

    try {
      // 1. OBTENER TOP GLOBAL (Suma de Coins + Bank de toda la DB)
      const users = Object.entries(db.users || {})
        .map(([key, data]) => {
          const total = (data.coins || 0) + (data.bank || 0)
          return { jid: key, name: data.name || 'Usuario', total }
        })
        .filter(u => u.total >= 1000)
        .sort((a, b) => b.total - a.total)

      if (users.length === 0) return m.reply(`ꕥ No hay suficientes usuarios para el Ranking Global.`)

      // 2. SISTEMA DE RECOMPENSAS SEMANALES
      const now = new Date()
      const weekId = `${now.getFullYear()}-W${getWeekNumber(now)}`
      
      if (!db.lastWeeklyReward) db.lastWeeklyReward = {}
      
      if (db.lastWeeklyReward.week !== weekId) {
        const winners = users.slice(0, 3)
        let congrats = `🎊 *¡RANKING GLOBAL: PREMIOS DE LA SEMANA!* 🎊\n\n`
        
        winners.forEach((u, i) => {
          const prize = i === 0 ? 100000 : i === 1 ? 50000 : 25000
          if (db.users[u.jid]) db.users[u.jid].bank += prize
          
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'
          congrats += `${medal} *${u.name}* › *+${prize.toLocaleString()}* ${monedas}\n`
        })
        
        db.lastWeeklyReward.week = weekId
        await client.sendMessage(m.chat, { text: congrats, mentions: winners.map(w => w.jid) })
      }

      // 3. PAGINACIÓN (Ajustada a 20 usuarios)
      const page = parseInt(args[0]) || 1
      const pageSize = 20 // <--- Cambiado a 20
      const totalPages = Math.ceil(users.length / pageSize)

      if (page > totalPages) return m.reply(`《✧》 El ranking solo llega hasta la página *${totalPages}*.`)

      const start = (page - 1) * pageSize
      const pageUsers = users.slice(start, start + pageSize)

      let text = `🌍 *RANKING GLOBAL DE RIQUEZA* 🌍\n`
      text += `> Los ${pageSize} más poderosos de esta página\n\n`

      text += pageUsers.map(({ jid, name, total }, i) => {
        const pos = start + i + 1
        let icon = pos === 1 ? '👑' : pos === 2 ? '✨' : pos === 3 ? '⭐' : '•'
        return `${icon} ${pos} › *${name}*\n     Fortuna → *¥${total.toLocaleString()} ${monedas}*`
      }).join('\n\n')

      text += `\n\n> 📊 Página *${page}* de *${totalPages}*`
      text += `\n> 🎁 *Premios:* El Top 3 global recibe bonos automáticos cada semana.`
      
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

