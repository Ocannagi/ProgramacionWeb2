const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  console.log('Hora: ', Date.now());
  next();
})
// define la ruta "home page"
router.get('/', (req, res) => {
  console.log("AAAAAAA")
  res.send('Página principal de mi perfil')

})
// define la ruta "about"
router.get('/about', (req, res) => {
  res.send('Acerca de mi perfil');
})

module.exports = router;
