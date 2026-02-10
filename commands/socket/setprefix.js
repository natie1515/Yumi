import GraphemeSplitter from 'grapheme-splitter'

export default {
  command: ['setprefix', 'setbotprefix'],
  category: 'socket',
  run: async (client, m, args, usedPrefix, command) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    
    if (!isOwner2) return client.reply(m.chat, mess.socket, m)
    
    const value = args.join(' ').trim()
    const defaultPrefix = ["#", "/", "!", "."]

    if (!value) {
      const lista = config.prefix === true ? '`sin prefijos`' : (Array.isArray(config.prefix) ? config.prefix : [config.prefix || '/']).map(p => `\`${p}\``).join(', ')
      return m.reply(`❀ Por favor, elige cualquiera de los siguientes métodos de prefijos.\n\n> *○ Only-Prefix* » ${usedPrefix + command} *.*\n> *○ Multi-Prefix* » ${usedPrefix + command} *# Neko*\n> *○ No-Prefix* » ${usedPrefix + command} *noprefix*\n\nꕥ Actualmente se está usando: ${lista}`)
    }

    if (value.toLowerCase() === 'reset') {
      config.prefix = defaultPrefix
      return client.reply(m.chat, `❀ Se han restaurado los prefijos predeterminados: *${defaultPrefix.join(' ')}*`, m)
    }

    if (value.toLowerCase() === 'noprefix') {
      config.prefix = true 
      return m.reply(`❀ Se cambio al modo sin prefijos para el Socket correctamente\n> Ahora el bot responderá a comandos *sin prefijos*.`)
    }

    // Lógica para capturar # y Neko al mismo tiempo
    let lista = []
    const splitter = new GraphemeSplitter()

    args.forEach(arg => {
      // Si el argumento es una palabra (letras/números) de más de un caracter, la toma completa (como Neko)
      if (arg.length > 1 && /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/.test(arg)) {
        if (!lista.includes(arg)) lista.push(arg)
      } else {
        // Si son símbolos o caracteres individuales, usa el splitter
        const graphemes = splitter.splitGraphemes(arg)
        graphemes.forEach(g => {
          if (!lista.includes(g)) lista.push(g)
        })
      }
    })

    if (lista.length === 0) return client.reply(m.chat, 'ꕥ No se detectaron prefijos válidos.', m)
    if (lista.length > 6) return client.reply(m.chat, 'ꕥ Máximo 6 prefijos permitidos.', m)

    config.prefix = lista
    return client.reply(m.chat, `❀ Se cambió el prefijo del Socket a: *${lista.join(' ')}* correctamente.`, m)
  },
}
