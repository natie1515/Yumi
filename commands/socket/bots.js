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
    const bot = global.db.data.settings[botId]
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

    // --- AHORA BUSCAMOS EN AMBAS CARPETAS ---
    const subs = getBotsFromFolder('Subs')
    const ownersExtra = getBotsFromFolder('Owner') // <--- NUEVO: Lee la carpeta Owner

    const categorizedBots = { Owner: [], Sub: [] }
    const mentionedJid = []

    const formatBot = (number, label) => {
      const jid = number + '@s.whatsapp.net'
      if (!groupParticipants.includes(jid)) return null
      mentionedJid.push(jid)
      const data = global.db.data.settings[jid]
      const name = data?.namebot || 'Bot'
      const handle = `@${number}`
      return `- [${label} *${name}*] › ${handle}`
    }

    // 1. Bot Principal (El que corre el script)
    if (global.db.data.settings[mainBotJid]) {
      const name = global.db.data.settings[mainBotJid].namebot
      const handle = `@${mainBotJid.split('@')[0]}`
      if (groupParticipants.includes(mainBotJid)) {
        mentionedJid.push(mainBotJid)
        categorizedBots.Owner.push(`- [Owner *${name}*] › ${handle}`)
      }
    }

    // 2. Otros Owners (Bots Premium en carpeta /Owner)
    ownersExtra.forEach((num) => {
      if (num + '@s.whatsapp.net' === mainBotJid) return // No repetir el principal
      const line = formatBot(num, 'Owner')
      if (line) categorizedBots.Owner.push(line)
    })

    // 3. Subs (Bots en carpeta /Subs)
    subs.forEach((num) => {
      const line = formatBot(num, 'Sub')
      if (line) categorizedBots.Sub.push(line)
    })

    // --- CONTEO TOTAL ---
    // Sumamos 1 (principal) + los que haya en la carpeta Owner
    const totalOwners = 1 + ownersExtra.filter(num => num + '@s.whatsapp.net' !== mainBotJid).length
    const totalSubs = subs.length
    const totalBots = totalOwners + totalSubs
    const totalInGroup = categorizedBots.Owner.length + categorizedBots.Sub.length

    let message = `ꕥ Números de Sockets activos *(${totalBots})*\n\n`
    message += `❖ Principales › *${totalOwners}*\n` // <--- Ahora mostrará más de 1 si hay bots en /Owner
    message += `✿ Subs › *${totalSubs}*\n\n`
    message += `➭ *Bots en el grupo ›* ${totalInGroup}\n`

    for (const category of ['Owner', 'Sub']) {
      if (categorizedBots[category].length) {
        message += categorizedBots[category].join('\n') + '\n'
      }
    }

    await client.sendContextInfoIndex(m.chat, message, {}, m, true, mentionedJid)
  },
}
