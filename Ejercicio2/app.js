const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');

app.listen(port, () => {
  console.log(`App de ejemplo en puerto ${port}`)
});


app.use(bodyParser.json());

// Datos de ejemplo
let usuarios = [
  { id: 1, nombre: 'Emiliano', apellido: 'Martínez', edad: 30 },
  { id: 2, nombre: 'Nicolás', apellido: 'Tagliafico', edad: 30 },
  { id: 3, nombre: 'Gonzalo', apellido: 'Montiel', edad: 26 },
  { id: 4, nombre: 'Angel', apellido: 'Di María', edad: 35 }
];

app.get('/usuarios', (req, res) => {
  let respuesta = usuarios.map(usr => {
    return {id: usr.id, nombre: usr.nombre, apellido: usr.apellido}; 
  });
  res.json(respuesta);
});

app.get('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const usuario = usuarios.find(u => u.id === parseInt(id));
  if (!usuario) {
    return res.status(404).send('Usuario no encontrado');
  }
  res.json(usuario);
});

app.post('/usuarios', (req, res) => {
  const { nombre, apellido, edad } = req.body;
  const id = Math.max(...usuarios.map(usr => usr.id)) + 1;
  const nuevoUsuario = { id, nombre, apellido, edad };
  usuarios.push(nuevoUsuario);
  res.status(201).json(nuevoUsuario.id);
});

app.patch('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, edad } = req.body;
  const usuarioIndex = usuarios.findIndex(u => u.id === parseInt(id));
  if (usuarioIndex === -1) {
    return res.status(404).send('Usuario no encontrado');
  }
  usuarios[usuarioIndex].nombre = nombre;
  usuarios[usuarioIndex].apellido = apellido;
  usuarios[usuarioIndex].edad = edad;
  res.json(usuarios[usuarioIndex].id);
});

app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const usuarioIndex = usuarios.findIndex(u => u.id === parseInt(id));
  if (usuarioIndex === -1) {
    return res.status(404).send('Usuario no encontrado');
  }
  const usuarioEliminado = usuarios.splice(usuarioIndex, 1);
  res.json('ok');
});

