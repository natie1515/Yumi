import crypto from 'crypto'

export default {
  command: ['genpremium', 'codeprem'],
  category: 'owner',
  isOwner: true,
  run: async (client, m, { args }) => {
    const token = crypto.randomBytes(4).toString('hex').toUpperCase()
    const expira = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 días en ms

    if (!global.db.data.premiumTokens) global.db.data.premiumTokens = []
    
    global.db.data.premiumTokens.push({
      token: token,
      status: 'available',
      date: Date.now(),
      expiration: expira
    })

    const txt = `*《 ✧ TOKEN BOT PREMIUM ✧ 》*\n\n` +
                `> 🔑 Código: \`${token}\`\n` +
                `> 📅 Validez del Token: *30 Días*\n` +
                `> ⚠️ Al conectar, el bot durará **1 mes** activo.\n\n` +
                `*Canjear con:* \`.bepremium ${token}\``
    
    await m.reply(txt)
  }
}
