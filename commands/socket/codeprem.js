import crypto from 'crypto'

export default {
  command: ['genmain', 'gencodeowner'],
  category: 'owner',
  isOwner: true,
  run: async (client, m, args) => {
    const token = crypto.randomBytes(4).toString('hex').toUpperCase()
    if (!global.db.data.mainTokens) global.db.data.mainTokens = []
    
    global.db.data.mainTokens.push({
      token: token,
      status: 'available',
      type: 'owner_bot',
      date: new Date().toISOString()
    })

    await m.reply(`*《 ✧ TOKEN BOT PRINCIPAL ✧ 》*\n\n> 🔑 Código: \`${token}\`\n> ⚠️ Al usarlo, serás registrado como **Principal** en la carpeta /Owner.\n\n*Uso:* \`.beowner ${token}\``)
  }
}
