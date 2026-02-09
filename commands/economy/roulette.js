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

    // --- PROBABILIDAD (Solo 7% de ganar para que sea difícil) ---
    const suerte = Math.random() * 100
    let resultColor

    if (suerte < 7) { 
      resultColor = color 
    } else {
      const coloresParaPerder = validColors.filter(c => c !== color)
      resultColor = coloresParaPerder[Math.floor(Math.random() * coloresParaPerder.length)]
    }

    if (resultColor === color) {
      // GANANCIA MÍNIMA (Solo recupera su apuesta + un 10%)
      // Si apuesta 1000, solo gana 100 extras.
      const bonus = color === 'green' ? 1.5 : 0.1
      const gananciaNeta = Math.floor(amount * bonus)
      
      user.coins += gananciaNeta
      
      await client.sendMessage(chatId, { 
        text: `「✿」 La ruleta giró y cayó en... *${resultColor.toUpperCase()}*! 🎰\n\n» Ganaste un premio pequeño.\n» Recibes: *+${gananciaNeta.toLocaleString()} ${currency}*\n» Total: *${user.coins.toLocaleString()}*`, 
        mentions: [senderId] 
      }, { quoted: m })
    } else {
      // CASTIGO X6 (Si apuesta 1000, pierde 6000 de golpe)
      const multa = amount * 6
      user.coins -= multa

      // Seguridad para que no de errores si queda en negativo (opcional)
      if (user.coins < -50000) user.coins = -50000 

      await client.sendMessage(chatId, { 
        text: `「✿」 La ruleta cayó en *${resultColor.toUpperCase()}*.\n\n» ¡PERDISTE TODO! 💀\n» Multa aplicada: *x6*\n» Perdiste: *${multa.toLocaleString()} ${currency}*\n» Saldo actual: *${user.coins.toLocaleString()}*`, 
        mentions: [senderId] 
      }, { quoted: m })
    }
  },
}
