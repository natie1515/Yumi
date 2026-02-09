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

    // --- LÓGICA DE PROBABILIDAD REALISTA PERO DIFÍCIL ---
    const suerte = Math.random() * 100
    let resultColor

    if (suerte < 10) { 
      resultColor = color 
    } else {
      const coloresParaPerder = validColors.filter(c => c !== color)
      resultColor = coloresParaPerder[Math.floor(Math.random() * coloresParaPerder.length)]
    }

    if (resultColor === color) {
      // PAGOS REDUCIDOS (Nerfeados)
      const multiplier = resultColor === 'green' ? 2 : 1.1 
      const reward = Math.floor(amount * multiplier)
      const gananciaNeta = reward - amount
      
      user.coins += gananciaNeta
      await client.sendMessage(chatId, { 
        text: `「✿」 La ruleta giró y cayó en... *${resultColor.toUpperCase()}*! 🎰\n\n» ¡Ganaste un premio!\n» Recibes: *+${gananciaNeta.toLocaleString()} ${currency}*\n» Total: *${user.coins.toLocaleString()}*`, 
        mentions: [senderId] 
      }, { quoted: m })
    } else {
      // CASTIGO X6 (Pierde lo apostado multiplicado por 6)
      const totalPerdido = amount * 6
      user.coins -= totalPerdido
      
      await client.sendMessage(chatId, { 
        text: `「✿」 La ruleta cayó en *${resultColor.toUpperCase()}*. Perdiste *${totalPerdido.toLocaleString()}* ${currency} (Multa x6). 💀\n\nNo te rindas, ¡vuelve a girar!`, 
        mentions: [senderId] 
      }, { quoted: m })
    }
  },
}
