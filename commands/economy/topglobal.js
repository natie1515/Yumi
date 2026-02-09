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

      // 1. ESCANEAR TODOS LOS CHATS PARA SUMAR MONEDAS GLOBALES
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
          // Sumamos lo que tiene en este chat (coins) + lo que tenga en el banco global
          globalUsers[jid].total += (data.coins || 0)
        })
      })

      // 2. SUMAR EL BANCO GLOBAL (Si es que usas banco en db.users)
      Object.entries(db.users || {}).forEach(([jid, data]) => {
        if (globalUsers[jid]) {
          globalUsers[jid].total += (data.bank || 0)
        } else if ((data.bank || 0) > 0) {
          globalUsers[jid] = { jid, name: data.name || 'Usuario', total: data.bank }
        }
      })

      // Convertir a array y ordenar
      const ranking = Object.values(globalUsers)
        .filter(u => u.total > 0)
        .sort((a, b) => b.total - a.total)

      if (ranking.length === 0) return m.reply(`ꕥ No hay datos de monedas en ningún grupo.`)

      // 3. PREMIOS SEMANALES
      const now = new Date()
      const weekId = `${now.getFullYear()}-W${getWeekNumber(now)}`
      if (!db.lastWeeklyReward) db.lastWeeklyReward = {}
      
      if (db.lastWeeklyReward.week !== weekId) {
        const winners = ranking.slice(0, 3)
        let congrats = `🎊 *¡PREMIOS SEMANALES DEL TOP GLOBAL!* 🎊\n\n`
        winners.forEach((u, i) => {
          const prize = i === 0 ? 100000 : i === 1 ? 50000 : 25000
          // Los premios se dan en el banco global para que no se pierdan
          if (!db.users[u.jid]) db.users[u.jid] = {}
          db.users[u.jid].bank = (db.users[u.jid].bank || 0) + prize
          congrats += `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} *${u.name}* › *+${prize.toLocaleString()}* ${monedas}\n`
        })
        db.lastWeeklyReward.week = weekId
        await client.sendMessage(m.chat, { text: congrats, mentions: winners.map(w => w.jid) })
      }

      // 4. MOSTRAR TOP 20
      const page = parseInt(args[0]) || 1
      const pageSize = 20 
      const totalPages = Math.ceil(ranking.length / pageSize)
      if (page > totalPages) return m.reply(`《✧》 Solo hay *${totalPages}* páginas.`)

      const start = (page - 1) * pageSize
      const pageUsers = ranking.slice(start, start + pageSize)

      let text = `🌍 *TOP 20 RIQUEZA GLOBAL* 🌍\n`
      text += `> Suma total de todos los grupos registrados\n\n`

      text += pageUsers.map(({ jid, name, total }, i) => {
        const pos = start + i + 1
        let icon = pos === 1 ? '👑' : pos === 2 ? '✨' : pos === 3 ? '⭐' : '•'
        return `${icon} ${pos} › *${name}*\n     Total → *¥${total.toLocaleString()} ${monedas}*`
      }).join('\n\n')

      text += `\n\n> 📊 Página *${page}* de *${totalPages}*`
      
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
