import crypto from 'crypto'

export default {
  command: ['genpremium', 'codeprem'],
  category: 'owner',
  isOwner: true,
  run: async (client, m, args) => {
    const token = crypto.randomBytes(4).toString('hex').toUpperCase()
    
    if (!global.db.data.premiumTokens) global.db.data.premiumTokens = []
    
    global.db.data.premiumTokens.push({
      token: token,
      status: 'available',
      date: new Date().toISOString()
    })

    const txt = `*《 ✧ TOKEN BOT PREMIUM ✧ 》*\n\n` +
                `> 🔑 Código: \`${token}\`\n` +
                `> ⚠️ Al canjearlo, se creará una sesión en la carpeta /Premium.\n\n` +
                `*Canjear con:* \`.bepremium ${token}\``
    
    await m.reply(txt)
  }
}
