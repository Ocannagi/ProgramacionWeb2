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
  { id: 1, nombre: 'Emiliano', apellido: 'Martínez', edad: 30, sigueA: [], seguidoPor: [] },
  { id: 2, nombre: 'Nicolás', apellido: 'Tagliafico', edad: 30, sigueA: [], seguidoPor: [] },
  { id: 3, nombre: 'Gonzalo', apellido: 'Montiel', edad: 26, sigueA: [], seguidoPor: []},
  { id: 4, nombre: 'Angel', apellido: 'Di María', edad: 35, sigueA: [], seguidoPor: [] }
];


app.get('/usuarios', (req, res) => {
  console.log(usuarios);
  let respuesta = usuarios.map(usr => {
    return {id: usr.id, nombre: usr.nombre, apellido: usr.apellido, sigueA: usr.sigueA, seguidoPor: usr.seguidoPor}; 
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
  const sigueA = []; seguidoPor = [];
  const id = Math.max(...usuarios.map(usr => usr.id)) + 1;
  const nuevoUsuario = { id, nombre, apellido, edad, sigueA, seguidoPor };
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

app.post('/seguimiento/:usuarioIdSeguidor/:usuarioIdSeguido', (req, res) => {

  let {usuarioIdSeguidor, usuarioIdSeguido} = req.params;

  const usIdSeguidor = parseInt(usuarioIdSeguidor);
  const usIdSeguido = parseInt(usuarioIdSeguido);

  const usIndexSigueA = usuarios.findIndex(u => u.id === usIdSeguidor);
  if (usIndexSigueA === -1) {
    return res.status(404).send('Usuario Seguidor no encontrado');
  }
  const usIndexSeguidoPor = usuarios.findIndex(u => u.id === usIdSeguido);
  if (usIndexSeguidoPor === -1) {
    return res.status(404).send('Usuario Seguido no encontrado');
  }



  if(!usuarios[usIndexSigueA].sigueA.includes(usIdSeguido)){
    usuarios[usIndexSigueA].sigueA.push(usIdSeguido);
  }
  if(!usuarios[usIndexSeguidoPor].seguidoPor.includes(usIdSeguidor)){
    usuarios[usIndexSeguidoPor].seguidoPor.push(usIdSeguidor);
  }

  console.log(usuarios)

  res.json(`El usuario ${usuarios[usIndexSigueA].id} sigue al usuario ${usIdSeguido} = ${usuarios[usIndexSigueA].sigueA.includes(usIdSeguido)} - El usuario ${usuarios[usIndexSeguidoPor].id} es seguido por el usuario ${usIdSeguidor} = ${usuarios[usIndexSeguidoPor].seguidoPor.includes(usIdSeguidor)}`);

});

app.delete('/seguimiento/:usuarioIdSeguidor/:usuarioIdSeguido', (req, res) => {
  let {usuarioIdSeguidor, usuarioIdSeguido} = req.params;

  const usIdSeguidor = parseInt(usuarioIdSeguidor);
  const usIdSeguido = parseInt(usuarioIdSeguido);

  const usIndexSigueA = usuarios.findIndex(u => u.id === usIdSeguidor);
  if (usIndexSigueA === -1) {
    return res.status(404).send('Usuario Seguidor no encontrado');
  }
  const usIndexSeguidoPor = usuarios.findIndex(u => u.id === usIdSeguido);
  if (usIndexSeguidoPor === -1) {
    return res.status(404).send('Usuario Seguido no encontrado');
  }

  usuarios[usIndexSigueA].sigueA.splice(usuarios[usIndexSigueA].sigueA.indexOf(usIdSeguido), 1);
  usuarios[usIndexSeguidoPor].seguidoPor.splice(usuarios[usIndexSeguidoPor].seguidoPor.indexOf(usIdSeguidor),1);
  res.json('ok');



});

