export default {
  command: ['globaltop'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix, command) => {
    const db = global.db.data
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId] || {}
    const monedas = botSettings.currency || 'Yenes'

    try {
      // 1. EXTRAER TODOS LOS USUARIOS DEL MÓDULO GLOBAL (db.users)
      // Aquí es donde se guarda el dinero real de todo el bot
      const users = Object.entries(db.users || {}).map(([key, data]) => {
        const total = (data.coins || 0) + (data.bank || 0)
        const name = data.name || 'Usuario'
        return { jid: key, name, total }
      }).filter(u => u.total > 0) // Que sume todo, sin importar si es poco o millones

      if (users.length === 0) return m.reply(`ꕥ No hay usuarios registrados en la base de datos global.`)

      // 2. ORDENAR POR RIQUEZA (De mayor a menor)
      const sorted = users.sort((a, b) => b.total - a.total)

      // 3. PAGINACIÓN DE 5 EN 5 (Como pediste)
      const page = parseInt(args[0]) || 1
      const pageSize = 5
      const totalPages = Math.ceil(sorted.length / pageSize)

      if (isNaN(page) || page < 1 || page > totalPages) {
        return m.reply(`《✧》 La página *${page}* no existe. Hay *${totalPages}* páginas.`)
      }

      const start = (page - 1) * pageSize
      const end = start + pageSize

      // 4. DISEÑO EXACTO A TU CÓDIGO (✩, ›, (✿◡‿◡))
      let text = `*✩ GlobalTop (✿◡‿◡)*\n\n`
      text += sorted.slice(start, end).map(({ name, total }, i) => {
          return `✩ ${start + i + 1} › *${name}*\n     Total → *¥${total.toLocaleString()} ${monedas}*`
        }).join('\n')

      text += `\n\n> ⌦ Página *${page}* de *${totalPages}*`
      
      if (page < totalPages) {
        text += `\n> Para ver la siguiente página › *${usedPrefix + command} ${page + 1}*`
      }

      // Enviamos con menciones para que se vea el nombre real
      await client.sendMessage(m.chat, { text, mentions: sorted.slice(start, end).map(u => u.jid) }, { quoted: m })

    } catch (e) {
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  }
}
