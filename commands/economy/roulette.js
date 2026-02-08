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
      // 10% de probabilidad de ganar (Precio Justo)
      resultColor = color 
    } else {
      // 90% de probabilidad de perder, pero variando el color de caída
      // Para que no parezca que siempre cae en el mismo color
      const coloresParaPerder = validColors.filter(c => c !== color)
      resultColor = coloresParaPerder[Math.floor(Math.random() * coloresParaPerder.length)]
    }
    // ----------------------------------------------------

    if (resultColor === color) {
      // PAGOS REDUCIDOS (Justos para la economía)
      // Rojo/Negro pagan x1.5 (Ganas la mitad de lo que apostaste extra)
      // Verde paga x5 (Ya no x14)
      const multiplier = resultColor === 'green' ? 5 : 1.5
      const reward = Math.floor(amount * multiplier)
      const gananciaNeta = reward - amount
      
      user.coins += gananciaNeta
      await client.sendMessage(chatId, { 
        text: `「✿」 La ruleta giró y cayó en... *${resultColor.toUpperCase()}*! 🎰\n\n» ¡Ganaste un premio justo!\n» Recibes: *+${gananciaNeta.toLocaleString()} ${currency}*\n» Total: *${user.coins.toLocaleString()}*`, 
        mentions: [senderId] 
      }, { quoted: m })
    } else {
      user.coins -= amount
      await client.sendMessage(chatId, { 
        text: `「✿」 La ruleta cayó en *${resultColor.toUpperCase()}*. Perdiste *${amount.toLocaleString()}* ${currency}. 💀\n\nNo te rindas, ¡vuelve a girar!`, 
        mentions: [senderId] 
      }, { quoted: m })
    }
  },
}
