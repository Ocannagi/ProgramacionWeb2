const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');

app.listen(port, () => {
  console.log(`App de ejemplo en puerto ${port}`)
});


app.use(bodyParser.json());

// INCOMPLETISIMO


let usuarios = [
  { id: 1, nombre: 'Emiliano', email: '', clave:''},
  { id: 2, nombre: 'Nicolás', email: '', clave:'' },
  { id: 3, nombre: 'Gonzalo', email: '', clave:''},
  { id: 4, nombre: 'Angel', email: '', clave:'' }
];

let Eventos = [
  {id: 1, id_usuario: 2, fecha_hora: Date(), },
  {},
]

/*
app.get('/usuarios', (req, res) => {
  console.log(usuarios);
  let respuesta = usuarios.map(usr => {
    return {id: usr.id, nombre: usr.nombre, apellido: usr.apellido, sigueA: usr.sigueA, seguidoPor: usr.seguidoPor, bloqueados: usr.bloqueados}; 
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

  if(usIdSeguidor === usIdSeguido){
    return res.status(403).send('Un usuario no puede seguirse a sí mismo');
  }
    
  const usIndexSigueA = usuarios.findIndex(u => u.id === usIdSeguidor);
  if (usIndexSigueA === -1) {
    return res.status(404).send('Usuario Seguidor no encontrado');
  }
  const usIndexSeguidoPor = usuarios.findIndex(u => u.id === usIdSeguido);
  if (usIndexSeguidoPor === -1) {
    return res.status(404).send('Usuario Seguido no encontrado');
  }

  if(usuarios[usIndexSeguidoPor].bloqueados.includes(usIdSeguidor)){
    return res.status(403).send('El usuario seguido bloqueó al usuario seguidor'); 
  }

  if(usuarios[usIndexSigueA].bloqueados.includes(usIdSeguido)){
    return res.status(403).send('El usuario seguidor bloqueó al usuario que quiere seguir');
  }

  if(usuarios[usIndexSigueA].bloqueados.includes(usIdSeguido)){
    return res.status(403).send('El usuario seguidor bloqueó al usuario que quiere seguir'); 
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

  if(usIdSeguidor === usIdSeguido){
    return res.status(403).send('Un usuario no puede seguirse a sí mismo');
  }
    
  const usIndexSigueA = usuarios.findIndex(u => u.id === usIdSeguidor);
  if (usIndexSigueA === -1) {
    return res.status(404).send('Usuario Seguidor no encontrado');
  }
  const usIndexSeguidoPor = usuarios.findIndex(u => u.id === usIdSeguido);
  if (usIndexSeguidoPor === -1) {
    return res.status(404).send('Usuario Seguido no encontrado');
  }

  if(!usuarios[usIndexSigueA].sigueA.includes(usIdSeguido)){
    return res.status(404).send('Usuario Seguidor no puede dejar de seguir a un usuario que nunca siguió');
  }

  usuarios[usIndexSigueA].sigueA.splice(usuarios[usIndexSigueA].sigueA.indexOf(usIdSeguido), 1);
  usuarios[usIndexSeguidoPor].seguidoPor.splice(usuarios[usIndexSeguidoPor].seguidoPor.indexOf(usIdSeguidor),1);
  res.json('ok');

});

app.post('/bloqueo/:usuarioId/:usuarioIdBloqueado', (req, res) => {

  let {usuarioId, usuarioIdBloqueado} = req.params;

  usuarioId = parseInt(usuarioId);
  usuarioIdBloqueado = parseInt(usuarioIdBloqueado);

  if(usuarioId === usuarioIdBloqueado){
    return res.status(404).send('Un usuario no puede bloquearse a sí mismo');
  }
    
  const usIndexBloqueador = usuarios.findIndex(u => u.id === usuarioId);
  if (usIndexBloqueador === -1) {
    return res.status(404).send('Usuario Bloqueador no encontrado');
  }
  const usIndexBloqueado = usuarios.findIndex(u => u.id === usuarioIdBloqueado);
  if (usIndexBloqueado === -1) {
    return res.status(404).send('Usuario a bloquear no encontrado');
  }

  if(!usuarios[usIndexBloqueador].bloqueados.includes(usuarioIdBloqueado)){
    usuarios[usIndexBloqueador].bloqueados.push(usuarioIdBloqueado);
  }

  if(usuarios[usIndexBloqueador].sigueA.includes(usuarioIdBloqueado)){
    usuarios[usIndexBloqueador].sigueA.splice(usuarios[usIndexBloqueador].sigueA.indexOf(usuarioIdBloqueado), 1);
  }

  if(usuarios[usIndexBloqueador].seguidoPor.includes(usuarioIdBloqueado)){
    usuarios[usIndexBloqueador].seguidoPor.splice(usuarios[usIndexBloqueador].sigueA.indexOf(usuarioIdBloqueado), 1);
  }

  if(usuarios[usIndexBloqueado].sigueA.includes(usuarioId)){
    usuarios[usIndexBloqueado].sigueA.splice(usuarios[usIndexBloqueado].sigueA.indexOf(usuarioId), 1);
  }

  if(usuarios[usIndexBloqueado].seguidoPor.includes(usuarioId)){
    usuarios[usIndexBloqueado].seguidoPor.splice(usuarios[usIndexBloqueado].sigueA.indexOf(usuarioId), 1);
  }


  console.log(usuarios)

  res.json(`El usuario ${usuarios[usIndexBloqueador].id} bloqueó al usuario ${usuarioIdBloqueado}`);

});

*/