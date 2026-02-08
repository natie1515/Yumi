import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  run: async (client, m) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const from = m.key.remoteJid
    const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch(() => {}) : ''
    const groupParticipants = groupMetadata?.participants?.map((p) => p.phoneNumber || p.jid || p.lid || p.id) || []
    
    const mainBotJid = global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const basePath = path.join(dirname, '../../Sessions')

    const getBotsFromFolder = (folderName) => {
      const folderPath = path.join(basePath, folderName)
      if (!fs.existsSync(folderPath)) return []
      return fs.readdirSync(folderPath).filter((dir) => {
          const credsPath = path.join(folderPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        }).map((id) => id.replace(/\D/g, ''))
    }

    // --- LECTURA DE LAS 3 CARPETAS ---
    const subs = getBotsFromFolder('Subs')
    const ownersExtra = getBotsFromFolder('Owner')
    const premiums = getBotsFromFolder('Premium') // <--- CARPETA PREMIUM

    const categorizedBots = { Owner: [], Premium: [], Sub: [] }
    const mentionedJid = []

    const formatBot = (number, label, emoji) => {
      const jid = number + '@s.whatsapp.net'
      if (!groupParticipants.includes(jid)) return null
      mentionedJid.push(jid)
      const data = global.db.data.settings[jid]
      const name = data?.namebot || 'Bot'
      const handle = `@${number}`
      return `- [${emoji} *${name}*] › ${handle}`
    }

    // 1. Bot Principal (Owner)
    if (global.db.data.settings[mainBotJid]) {
      const name = global.db.data.settings[mainBotJid].namebot || 'Principal'
      const handle = `@${mainBotJid.split('@')[0]}`
      if (groupParticipants.includes(mainBotJid)) {
        mentionedJid.push(mainBotJid)
        categorizedBots.Owner.push(`- [Owner *${name}*] › ${handle}`)
      }
    }

    // 2. Otros Owners
    ownersExtra.forEach((num) => {
      if (num + '@s.whatsapp.net' === mainBotJid) return
      const line = formatBot(num, 'Owner', 'Owner')
      if (line) categorizedBots.Owner.push(line)
    })

    // 3. Premiums (NUEVO)
    premiums.forEach((num) => {
      const line = formatBot(num, 'Premium', 'Premium')
      if (line) categorizedBots.Premium.push(line)
    })

    // 4. Subs
    subs.forEach((num) => {
      const line = formatBot(num, 'Sub', 'Sub')
      if (line) categorizedBots.Sub.push(line)
    })

    // --- CONTEO TOTAL ---
    const totalOwners = 1 + ownersExtra.filter(num => num + '@s.whatsapp.net' !== mainBotJid).length
    const totalPremiums = premiums.length
    const totalSubs = subs.length
    const totalBots = totalOwners + totalPremiums + totalSubs
    const totalInGroup = categorizedBots.Owner.length + categorizedBots.Premium.length + categorizedBots.Sub.length

    let message = `ꕥ Números de Sockets activos *(${totalBots})*\n\n`
    message += `❖ Principales › *${totalOwners}*\n`
    message += `💎 Premium › *${totalPremiums}*\n` // <--- Nueva fila Premium
    message += `✿ Subs › *${totalSubs}*\n\n`
    message += `➭ *Bots en el grupo ›* ${totalInGroup}\n`

    // Mostrar las listas por categoría
    for (const category of ['Owner', 'Premium', 'Sub']) {
      if (categorizedBots[category].length) {
        message += categorizedBots[category].join('\n') + '\n'
      }
    }

    await client.sendContextInfoIndex(m.chat, message, {}, m, true, mentionedJid)
  },
}
