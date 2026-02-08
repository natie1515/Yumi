import crypto from 'crypto'

export default {
  command: ['genmain', 'gencodeowner'],
  category: 'owner',
  isOwner: true,
  run: async (client, m, args) => {
    // Generamos un token único de 8 caracteres
    const token = crypto.randomBytes(4).toString('hex').toUpperCase()
    
    // Inicializamos la base de datos si no existe
    if (!global.db.data.mainTokens) global.db.data.mainTokens = []
    
    // Guardamos el token con su estado disponible
    global.db.data.mainTokens.push({
      token: token,
      status: 'available',
      type: 'owner_bot',
      date: new Date().toISOString()
    })

    const texto = `*《 ✧ TOKEN BOT PRINCIPAL ✧ 》*\n\n` +
                  `> 🔑 Código: \`${token}\`\n` +
                  `> ⚠️ Al canjearlo, la sesión se guardará en **/Owner**.\n\n` +
                  `*Modo de uso:* \`.beowner ${token}\``
    
    await m.reply(texto)
  }
}
