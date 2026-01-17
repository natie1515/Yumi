export default {
  command: ['code'],
  category: 'socket',
  run: async (client, m) => {

   const rtx = '`✤` Vincula un *sub-bot* a tu *cuenta*\n\nꕤ Importante\n> ₊·( 🜸 ) ➭ El código generado desde la web solo funciona en el mismo número que lo solicitó. No se puede usar en otro número.\n\n> ✥ Para convertirse en *sub-bot*, haz la solicitud únicamente desde la web oficial:\n› *Web* :: ' + `${global.links.web}\n› Solo desde ahí se acepta la solicitud.\n\n> ✥ También puedes cambiar las configuraciones del *sub-bot* desde esa misma web.`;

   await m.reply(rtx)
  },
};