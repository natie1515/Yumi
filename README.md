> [!IMPORTANT]
> **Este proyecto está en constante evolución. Estamos comprometidos en ofrecer a nuestra comunidad un Bot increíble. Te invitamos a instalarlo y para estar al tanto de todas las novedades. [¡Únete a nuestro nuevo canal!](https://whatsapp.com/channel/0029Vb64nWqLo4hb8cuxe23n)**

<p align="center"> 
<img src="https://cdn2.sockywa.xyz/b1sSs.jpeg" alt="YukiBot-MD" style="width: 75%; height: auto; max-width: 100px;">

<p align="center"> 
<a href="#"><img title="YukiBot-MD" src="https://img.shields.io/badge/¡Disfruta de un Bot totalmente gratuito, con múltiples funciones y de código abierto! -purple?colorA=%239b33b0&colorB=%231c007b&style=for-the-badge"></a> 
</p>

---

### *`❕️ Información importante`*
Este proyecto **no está afiliado de ninguna manera** con `WhatsApp`, `Inc. WhatsApp` es una marca registrada de `WhatsApp LLC`, y este bot es un **desarrollo independiente** que **no tiene ninguna relación oficial con la compañía**.

<details>
<summary><strong>🌵 Configuración de acceso al subbot</strong> — Web</summary>

### 1. Desde Termux (local)
Web:
```
localhost:5010
```

### 2. Desde un servidor hosting (externo)
```
IP_DEL_SERVIDOR:PUERTO
```
Ejemplo:
```
1.00.00.00:5010
```

### 3. Ajustar el puerto en el código
Ir a:

[lib/system/web.js](https://github.com/The-King-Destroy/YukiBot-MD/blob/main/lib%2Fsystem%2Fweb.js)

Linea :: #34

Buscar la línea donde se define el `PORT` y ajustarla al puerto de tu servidor:

```js
const PORT = process.env.PORT || 5010;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
```

Si tu hosting usa otro puerto (ej. `8080`):
```js
const PORT = process.env.PORT || 8080;
```

</details>

<details>
<summary><b> ➮ Descripción</b></summary>

Yuki Bot es un bot de WhatsApp multifuncional basado en `baileys`. Este bot ofrece una variedad de características para mejorar tu experiencia en WhatsApp.

#### Características
Configuración avanzada de grupos 
Bienvenidas personalizadas  
Herramientas útiles  
Juegos RPG (Gacha y Economía)  
Funciones de Inteligencia Artificial  
Descargas y búsquedas multi-plataforma  
Sub-Bots (JadiBot)  
Extensiones adicionales
</details>

---

### **`✧ Click en la imagen para descargar termux ✧`**
<a
href="https://www.mediafire.com/file/wkinzgpb0tdx5qh/com.termux_1022.apk/file"><img src="https://n.uguu.se/UrdJCtLB.jpeg" height="125px"></a> 

### **`➮ Instalación por termux`**
<details>
<summary><b>✰ Instalación Manual</b></summary>

> *Comandos para instalar de forma manual*
```bash
termux-setup-storage
```
```bash
apt update && apt upgrade && pkg install -y git nodejs ffmpeg imagemagick yarn
```
```bash
git clone https://github.com/The-King-Destroy/YukiBot-MD && cd YukiBot-MD
```
```bash
yarn install
```
```bash
npm install
```
```bash
npm start
```
> *Si aparece **(Y/I/N/O/D/Z) [default=N] ?** use la letra **"y"** y luego **"ENTER"** para continuar con la instalación.*
</details>

<details>
  <summary><b>🜸 Comandos para mantener más tiempo activo el Bot</b></summary>

> *Ejecutar estos comandos dentro de la carpeta YukiBot-MD*
```bash
termux-wake-lock && npm i -g pm2 && pm2 start index.js && pm2 save && pm2 logs 
``` 
#### Opciones Disponibles
> *Esto eliminará todo el historial que hayas establecido con PM2:*
```bash 
pm2 delete index
``` 
> *Si tienes cerrado Termux y quiere ver de nuevo la ejecución use:*
```bash 
pm2 logs 
``` 
> *Si desea detener la ejecución de Termux use:*
```bash 
pm2 stop index
``` 
> *Si desea iniciar de nuevo la ejecución de Termux use:*
```bash 
pm2 start index
```
---- 
### En caso de detenerse
> _Si despues que ya instalastes el bot y termux te salta en blanco, se fue tu internet o reiniciaste tu celular, solo realizaras estos pasos:_
```bash
cd && cd YukiBot-MD && npm start
```
----
### Obtener nuevo código QR 
> *Detén el bot, haz click en el símbolo (ctrl) [default=z] usar la letra "z" + "ENTER" hasta que salga algo verdes similar a: `YukiBot-MD $`*
> **Escribe los siguientes comandos uno x uno :**
```bash 
cd && cd YukiBot-MD && rm -rf sessions/Principal && npm run qr
```
----
### Obtener nuevo código de teléfono 
```bash 
cd && cd YukiBot-MD && rm -rf sessions/Principal && npm run code
```
</details>

<details>
<summary><b>❀ Actualizar YukiBot-MD</b></summary>

> **Utiliza esta opción únicamente si deseas actualizar a la última versión de YukiBot. Hemos implementado un método ingenioso mediante comandos para realizar la actualización, pero ten en cuenta que al usarla se eliminarán todos los archivos de la versión actual y se reemplazarán con los de la nueva versión. Solo se conservará la base de datos, por lo que será necesario volver a vincular el Bot.**  

**Comandos para actualizar YukiBot-MD de forma automática**

```bash
grep -q 'bash\|wget' <(dpkg -l) || apt install -y bash wget && wget -O - https://raw.githubusercontent.com/The-King-Destroy/YukiBot-MD/master/termux.sh | bash 
```
**✰ Volverte owner del Bot**

*Si después de instalar el bot e iniciar la sesión (deseas poner tu número es la lista de owner pon este comando:*

```bash
cd && cd YukiBot-MD && nano settings.js
```
#### Para que no pierda su progreso en YukiBot, estos comandos realizarán un respaldo de su `database.json` y se agregará a la versión más reciente.
> *Estos comandos solo funcionan para TERMUX, REPLIT, LINUX*
</details>

---
### **`➮ Enlaces útiles`**

<details>
<summary><b> 🜸 Enlaces Oficiales </b></summary>

 * Canal Oficial  [`¡Click aquí!`](https://whatsapp.com/channel/0029Vb64nWqLo4hb8cuxe23n)
* Grupo Oficial [`¡Click aquí!`](https://chat.whatsapp.com/K3RaHnkUZ2XDqGe6drJFoK)
* Comunidad Oficial [`¡Click aquí!`](https://chat.whatsapp.com/BgIcqDiiTEmL5ChFpq76y0)
</details>

<details>
<summary><b> ✰ Contáctos</b></summary>

* WhatsApp: [`Aquí`](https://wa.me/573196588149)
* Correo: [`Aquí`](thekingdestroy507@gmail.com)
</details>

---

### **`✦ AKIRAX ✦`**

<a
href="https://home.akirax.net"><img src="https://o.uguu.se/mfnuwWzC.jpeg" height="125px"></a>

<details>
<summary><b> ❒ Servidor Akirax</b></summary>

* Dashboard : [`Dash`](https://home.akirax.net)
* Panel : [`Panel`](https://console.akirax.net)
* Canal de WhatsApp : [`Aqui`](https://whatsapp.com/channel/0029VbBCchVDJ6H6prNYfz2z)
* Grupo Oficial : [`Aquí`](https://chat.whatsapp.com/JxSZTFJN9J20TnsH7KsKTA)

</details>

---

### 🦋 Colaboradores
<a href="https://api.stellarwa.xyz">
  <img src="https://contrib.rocks/image?repo=The-King-Destroy/YukiBot-MD" />
</a>

### 🌼 Agradecimientos
[![ZyxlJs](https://github.com/DevZyxlJs.png?size=100)](https://github.com/DevZyxlJs) [![Carlos](https://github.com/AzamiJs.png?size=100)](https://github.com/AzamiJs)

### 💐 Propietario
[![King](https://github.com/The-King-Destroy.png?size=120)](https://github.com/The-King-Destroy) 