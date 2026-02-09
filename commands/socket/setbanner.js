import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['setbanner', 'setbotbanner'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return m.reply(mess.socket)
    const value = args.join(' ').trim()
    if (!value && !m.quoted && !m.message.imageMessage && !m.message.videoMessage)
  return m.reply('✎ Debes enviar o citar una imagen o video para cambiar el banner del bot.')
    if (value.startsWith('http')) {
      config.banner = value
      return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
    }
    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime))
      return m.reply('✎ Responde a una imagen válida.')
    const buffer = await q.download()
    if (!buffer) return m.reply('✎ No se pudo descargar la imagen.')
    
    // Cambio de servidor a Catbox (Permanente) conservando la lógica original
    const url = await uploadToCatbox(buffer)
    config.banner = url
    return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
  },
};

async function uploadToCatbox(buffer) {
  const body = new FormData()
  body.append('reqtype', 'fileupload')
  body.append('userhash', '') 
  body.append('fileToUpload', buffer, { filename: 'file.png' })
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body })
  if (!res.ok) return null
  return await res.text()
}
