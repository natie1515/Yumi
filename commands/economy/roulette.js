export default {
  command: ['rt', 'roulette', 'ruleta'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.economy) return m.reply(`ꕥ Economía desactivada.`)
    
    const user = chatData.users[m.sender]
    const currency = botSettings.currency || 'Monedas'

    if (args.length < 2) return m.reply(`《✧》 Uso: *rt [cantidad] [color]*`)

    let amount, color
    if (!isNaN(parseInt(args[0]))) {
      amount = parseInt(args[0]); color = args[1].toLowerCase()
    } else {
      color = args[0].toLowerCase(); amount = parseInt(args[1])
    }

    const validColors = ['red', 'black', 'green']
    if (isNaN(amount) || amount < 200) return m.reply(`《✧》 Mínimo 200 ${currency}.`)
    if (!validColors.includes(color)) return m.reply(`《✧》 Elige: red, black o green.`)
    if (user.coins < amount) return m.reply(`《✧》 No tienes suficientes ${currency}.`)

    // --- SISTEMA DE "CASA GANA" (10% DE PROBABILIDAD) ---
    const suerte = Math.random() * 100
    let resultColor

    if (suerte < 10) { 
      // El usuario entra en el 10% de probabilidad de ganar
      resultColor = color 
    } else if (suerte < 11) {
      // 1% de probabilidad de que caiga Verde (si no lo eligió, pierde)
      resultColor = 'green'
    } else {
      // 89% de probabilidad de que salga un color distinto al que eligió
      const perdidas = validColors.filter(c => c !== color)
      resultColor = perdidas[Math.floor(Math.random() * perdidas.length)]
    }
    // ----------------------------------------------------

    if (resultColor === color) {
      const multiplier = resultColor === 'green' ? 14 : 2
      const reward = amount * multiplier
      user.coins += (reward - amount)
      await client.sendMessage(chatId, { text: `「✿」 La ruleta cayó en *${resultColor.toUpperCase()}*. ¡Ganaste *${reward.toLocaleString()}* ${currency}! 🎰` }, { quoted: m })
    } else {
      user.coins -= amount
      await client.sendMessage(chatId, { text: `「✿」 La ruleta cayó en *${resultColor.toUpperCase()}*. Perdiste *${amount.toLocaleString()}* ${currency}. 💀` }, { quoted: m })
    }
  },
}
