import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../lib/message.js'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('🫛 Por favor, menciona el nombre o URL del video que deseas descargar')
      }

      const query = args.join(' ')
      let url, title, videoInfo

      if (!isYTUrl(query)) {
        const search = await yts(query)
        if (!search.all.length) {
          return m.reply('🍋‍🟩 No se *encontraron* resultados')
        }

        videoInfo = search.all[0]
        url = videoInfo.url
        title = videoInfo.title

        const vistas = (videoInfo.views || 0).toLocaleString()
        const canal = videoInfo.author?.name || 'Desconocido'
        const infoMessage = `🍓✿⃘࣪◌ ֪  Descargando › ${title}

> 🍒✿⃘࣪◌ ֪ Canal › ${canal}
> 🍒✿⃘࣪◌ ֪ Duración › ${videoInfo.timestamp || 'Desconocido'}
> 🍒✿⃘࣪◌ ֪ Vistas › ${vistas}
> 🍒✿⃘࣪◌ ֪ Publicado › ${videoInfo.ago || 'Desconocido'}
> 🍒✿⃘࣪◌ ֪ Enlace › ${url}

𐙚 🌽 ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

        await client.sendContextInfoIndex(m.chat, infoMessage, {}, m, true, null, {
          banner: videoInfo.image,
          title: '仚 🎧 PLAY',
          body: title
        })
      } else {
        url = query
        title = 'YouTube Video'
      }

      const res = await fetch(`${api.url2}/download/ytmp4?url=${encodeURIComponent(url)}&q=&api_key=${api.key}`)
      const result = await res.json()

      if (!result.status || !result.result?.url) {
        return m.reply('🫛 No se pudo descargar el *video*, intenta más tarde.')
      }

      const videoBuffer = await getBuffer(result.result.url)

      const mensaje = {
        video: videoBuffer,
        fileName: result.result.filename || `${title}.mp4`,
        mimetype: 'video/mp4'
      }

      await client.sendMessage(m.chat, mensaje, { quoted: m })

    } catch (e) {
     // console.error(e)
      await m.reply(msgglobal)
    }
  }
}
