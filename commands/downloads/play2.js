import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../lib/message.js'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }
      
      const text = args.join(' ')
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
      
      let url = query
      let title = 'video'
      let thumbBuffer = null

      // --- BÚSQUEDA Y MENSAJE DE INFO ---
      try {
        const search = await yts(query)
        if (search && search.all && search.all.length > 0) {
          const videoInfo = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
          
          if (videoInfo) {
            url = videoInfo.url
            title = videoInfo.title || 'video'
            
            // Fix: Evitar error .toLocaleString() si views es undefined
            const viewsRaw = videoInfo.views || 0
            const vistas = typeof viewsRaw === 'number' ? viewsRaw.toLocaleString() : viewsRaw
            
            const canal = videoInfo.author?.name || 'Desconocido'
            
            // Intentar obtener buffer de imagen de forma segura
            try {
              thumbBuffer = await getBuffer(videoInfo.image)
            } catch {
              thumbBuffer = null
            }

            const infoMessage = `➩ Descargando › *${title}*\n\n` +
                                `> ❖ Canal › *${canal}*\n` +
                                `> ⴵ Duración › *${videoInfo.timestamp || 'Desconocido'}*\n` +
                                `> ❀ Vistas › *${vistas}*\n` +
                                `> ✩ Publicado › *${videoInfo.ago || 'Desconocido'}*\n` +
                                `> ❒ Enlace › *${url}*`

            await client.sendMessage(m.chat, { 
              image: thumbBuffer ? thumbBuffer : { url: videoInfo.image }, 
              caption: infoMessage 
            }, { quoted: m })
          }
        }
      } catch (err) {
        console.error('Error en búsqueda:', err)
      }

      // --- DESCARGA DEL VIDEO ---
      const video = await getVideoFromApis(url)
      
      if (!video || !video.url) {
        return m.reply('《✧》 No se pudo obtener un enlace de descarga válido. Intenta con otro video.')
      }

      // Intentar descargar el buffer del video
      const videoBuffer = await getBuffer(video.url).catch(() => null)
      
      if (!videoBuffer) {
        return m.reply('《✧》 El servidor de descarga no respondió correctamente. Intenta de nuevo.')
      }

      // Envío final del video
      await client.sendMessage(m.chat, { 
        video: videoBuffer, 
        fileName: `${title}.mp4`, 
        mimetype: 'video/mp4',
        caption: `*Aquí tienes tu video*\n*Servidor:* ${video.api}`
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      // Evitar el error de 'toString' asegurando que e.message exista
      const errMsg = e?.message || 'Error desconocido'
      await m.reply(`> Ocurrió un fallo inesperado.\n> [Error: *${errMsg}*]`)
    }
  }
}

async function getVideoFromApis(url) {
  // Lista de APIs corregidas con encadenamiento opcional ?.
  const apis = [
    { api: 'Adonix', endpoint: `${global.APIs?.adonix?.url}/download/ytvideo?apikey=${global.APIs?.adonix?.key}&url=${encodeURIComponent(url)}`, extractor: res => res?.data?.url },    
    { api: 'Vreden', endpoint: `${global.APIs?.vreden?.url}/api/v1/download/youtube/video?url=${encodeURIComponent(url)}&quality=360`, extractor: res => res?.result?.download?.url },
    { api: 'Stellar v2', endpoint: `${global.APIs?.stellar?.url}/dl/ytmp4v2?url=${encodeURIComponent(url)}&key=${global.APIs?.stellar?.key}`, extractor: res => res?.vidinfo?.url },
    { api: 'Stellar', endpoint: `${global.APIs?.stellar?.url}/dl/ytmp4?url=${encodeURIComponent(url)}&quality=360&key=${global.APIs?.stellar?.key}`, extractor: res => res?.data?.dl },
    { api: 'Nekolabs', endpoint: `${global.APIs?.nekolabs?.url}/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=360`, extractor: res => res?.result?.downloadUrl },
    { api: 'Vreden v2', endpoint: `${global.APIs?.vreden?.url}/api/v1/download/play/video?query=${encodeURIComponent(url)}`, extractor: res => res?.result?.download?.url }
  ]

  for (const { api, endpoint, extractor } of apis) {
    // Si la API no está configurada en global, saltarla
    if (!endpoint || endpoint.includes('undefined')) continue

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000) // 20 seg para videos
      
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
      clearTimeout(timeout)
      
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch (e) {
      console.log(`Fallo en API ${api}: ${e.message}`)
    }
    await new Promise(resolve => setTimeout(resolve, 800))
  }
  return null
}

