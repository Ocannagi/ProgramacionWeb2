const express = require('express');
const app = express();
const port = 3000
const miPerfil = require('./perfil')
 
app.get('/', (req, res) => {
  res.send('¡Hola mundo!');
});
 
app.listen(port, () => {
  console.log(`App de ejemplo en puerto ${port}`)
});

app.post('/usuario', (req, res) => {
  res.send('Creando un usuario');
});

app.get(/.*man$/, (req, res) => {
  res.send('/.*man$/')
  console.log(req.url);
})

app.use('/perfil', miPerfil);

app.get('/cadena', (req, res, next) => {
  console.log('Primer handler');
  next();
}, (req, res, next) => {
  console.log('Segundo handler');
  //res.send('Salida desde segundo handler'); // ¡Error!
  next();
}, (req, res) => {
  console.log('Tercer handler');
  res.send('Salida desde tercer handler');
});

