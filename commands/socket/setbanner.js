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

    const q = m.quoted ? m.quoted : (m.message.imageMessage || m.message.videoMessage ? m : null)
    if (!q) return m.reply('✎ Responde a una imagen válida.')

    const mime = (q.msg || q).mimetype || q.mediaType || ''
    // Validamos imágenes, GIFs y videos mp4
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime))
      return m.reply('✎ Responde a una imagen válida.')

    const buffer = await q.download()
    if (!buffer) return m.reply('✎ No se pudo descargar la imagen.')

    try {
      // Subida compatible con GIF y Permanente
      const url = await uploadMedia(buffer)
      if (!url) throw new Error("Error al obtener URL")
      
      config.banner = url
      return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
    } catch (e) {
      console.error(e)
      return m.reply('✎ Hubo un error al subir el archivo. Intenta de nuevo.')
    }
  },
};

async function uploadMedia(buffer) {
  const body = new FormData()
  // Usamos un nombre de archivo genérico pero con extensión para que el servidor lo reconozca
  body.append('file', buffer, { filename: 'banner.gif' })
  
  const res = await fetch('https://telegra.ph/upload', { 
    method: 'POST', 
    body 
  })
  
  const json = await res.json()
  if (json[0] && json[0].src) {
    return 'https://telegra.ph' + json[0].src
  }
  return null
}
