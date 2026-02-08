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
      type: 'owner_bot'
    })

    await m.reply(`*《 ✧ TOKEN BOT PRINCIPAL ✧ 》*\n\n> 🔑 Código: \`${token}\`\n> ⚠️ Al canjearlo, se creará una sesión en la carpeta /Owner.\n\n*Uso:* \`.beowner ${token}\``)
  }
}
