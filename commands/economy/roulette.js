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

    if (args.length < 2) return m.reply(`《✧》 Uso: *${usedPrefix}rt [cantidad] [color]*`)

    let amount, color
    if (!isNaN(parseInt(args[0]))) {
      amount = parseInt(args[0]); color = args[1].toLowerCase()
    } else {
      color = args[0].toLowerCase(); amount = parseInt(args[1])
    }

    const validColors = ['red', 'black', 'green']
    // Rango de apuesta nerfeado entre 500 y 1000
    if (isNaN(amount) || amount < 500 || amount > 1000) {
        return m.reply(`《✧》 La apuesta debe estar entre *500 y 1,000* ${currency}.`)
    }
    
    if (!validColors.includes(color)) return m.reply(`《✧》 Elige: red, black o green.`)
    if (user.coins < amount) return m.reply(`《✧》 No tienes suficientes ${currency} para apostar.`)

    // --- PROBABILIDAD NERFEADA (Solo 5% de ganar) ---
    const suerte = Math.random() * 100
    let resultColor

    if (suerte < 5) { 
      resultColor = color 
    } else {
      const coloresParaPerder = validColors.filter(c => c !== color)
      resultColor = coloresParaPerder[Math.floor(Math.random() * coloresParaPerder.length)]
    }

    if (resultColor === color) {
      // PAGOS MISERABLES: Solo ganas el 10% de lo apostado (x1.1)
      const multiplier = resultColor === 'green' ? 2 : 1.1
      const reward = Math.floor(amount * multiplier)
      const gananciaNeta = reward - amount
      
      user.coins += gananciaNeta
      await client.sendMessage(chatId, { 
        text: `「✿」 Cayó en... *${resultColor.toUpperCase()}*! 🎰\n\n» Ganaste por pura suerte.\n» Recibes: *+${gananciaNeta.toLocaleString()} ${currency}*\n» Total: *${user.coins.toLocaleString()}*`, 
        mentions: [senderId] 
      }, { quoted: m })
    } else {
      // PENALIZACIÓN EXTREMA: Pierde lo apostado Y se le multa con x6 de la apuesta
      const penalty = amount * 6
      user.coins -= penalty

      // Evitar que el balance sea menor a 0 si prefieres
      if (user.coins < 0) user.coins = 0

      await client.sendMessage(chatId, { 
        text: `「✿」 ¡LA RULETA TE ESTAFÓ! 💀\n\n» Cayó en: *${resultColor.toUpperCase()}*\n» Perdiste tu apuesta y el banco te multó con x6.\n» Total perdido: *-${penalty.toLocaleString()} ${currency}*\n» Tu saldo quedó en: *${user.coins.toLocaleString()}*`, 
        mentions: [senderId] 
      }, { quoted: m })
    }
  },
}
