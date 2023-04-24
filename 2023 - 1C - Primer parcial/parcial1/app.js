/*
Hacer una API rest que contenga las clases dadas y responda a los métodos solicitados siguiendo 
la estructura del ejemplo.

Proyecto
{
  titulo: string no nulo,
  descripcion: string,
  lenguaje: string con una de estas opciones = ('PHP', 'JAVASCRIPT', 'C++', 'JAVA'),
  activo: boolean
}

Programador
{
  nombre: string no nulo,
  email: string con email no nulo,
  seniority: número entero del 1 al 10
}

Un proyecto puede tener asginados muchos "programadores".
Un programador puede tener asginados muchos "proyectos".

El archivo seed.js contiene un set de datos que alimenta la base en cada reinicio de la aplicación.

Los recursos de la API a programar, con sus respectivas ejemplos de estructura de salida, 
son los siguientes:

1) GET programadores: Listado de todos los programadores. Estructura de salida: [{"id":1,"nombre":"Juan Pérez","email":"juan.perez@gmail.com","seniority":5},{"id":2,"nombre":"María García","email":"maria.garcia@gmail.com","seniority":8},{"id":3,"nombre":"Pedro Fernández","email":"pedro.fernandez@gmail.com","seniority":3}]
2) GET programadores/_ID_: Detalle de un programador. Estructura de salida: {"id":1,"nombre":"Juan Pérez","email":"juan.perez@gmail.com","seniority":5,"proyectos":[{"id":1,"titulo":"Sistema de gestión de inventarios","lenguaje":"JAVASCRIPT"},{"id":2,"titulo":"Aplicación móvil para la gestión de tareas","lenguaje":"JAVA"}]}
3) POST programadores: Creación de un programador. Estructura de entrada: {"nombre":"Leonel Messi","email":"leomessi@gmail.com","seniority":10}. . Salida: {"id": 5}
4) PATCH programadores/_ID_: Actualización de un programador. Estructura de entrada: {"nombre":"Leonel Andrés Messi","email":"leomessi@hotmail.com","seniority":9}. . Salida: {"id": 5}
5) DELETE programadores/_ID_: Borrado de un programador. Responder con "ok" en caso correcto.
6) GET proyectos: Listado de todos los proyectos. Estructura de salida: [{"id":1,"titulo":"Sistema de gestión de inventarios","activo":true},{"id":2,"titulo":"Aplicación móvil para la gestión de tareas","activo":true},{"id":3,"titulo":"Página web de comercio electrónico","activo":false}]
7) GET proyectos/_ID_: Detalle de un proyecto. Estructura de salida: {"id":1,"titulo":"Sistema de gestión de inventarios","descripcion":"Sistema para llevar el control de inventarios de una empresa","lenguaje":"JAVASCRIPT","activo":true,"programadores":[{"id":1,"nombre":"Juan Pérez","seniority":5},{"id":2,"nombre":"María García","seniority":8}]}
8) POST proyectos: Creación de un proyecto. Estructura de entrada: {"titulo":"Sistema de materias","descripcion":"Sistema para materias de una universidad","lenguaje":"C++","activo":true}. Salida: {"id": 5}
9) PATCH proyectos/_ID_: Actualización de un proyecto. Estructura de entrada:  {"titulo":"Sistema de inventarios","descripcion":"Sistema para llevar inventarios de una organización","lenguaje":"JAVA","activo":false}. Salida: {"id": 5}
10) DELETE proyectos/_ID_: Borrado de un proyecto. Responder con "ok" en caso correcto.
11) POST proyectos/_IDPROYECTO_/programadores/_IDPROGRAMADOR_: Asigna al proyecto con id=_IDPROYECTO_ al programador con id=_IDPROGRAMADOR_. No hay datos de entrada (enviar {}). Salida: "ok". No es necesario revisar si la asignación ya existe.
12) DELETE proyectos/_IDPROYECTO_/programadores/_IDPROGRAMADOR_: Desasigna al proyecto con id=_IDPROYECTO_ al programador con id=_IDPROGRAMADOR_. No hay datos de entrada (enviar {}). Salida: "ok". No es necesario revisar si la asignación ya existe.

Se incluye con el proyecto una colección Postman.

Para aprobar, es necesario realizar correctamente, al menos, 8 de los 12 recursos solicitados
Al finalizar, adjuntar únicamente este archivo (app.js) en el link correspondiente de Classroom.
El tiempo máximo de realizción está especificado en el mismo link del enunciado.

*/
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')
const seeder = require('./seed.js')

const sequelize = new Sequelize({
  storage: 'parcial.db',
  dialect: 'sqlite',
  define: {
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt', 'programador_proyecto'] },
    },
  },
});

const Proyecto = sequelize.define('proyectos', {
  titulo: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  descripcion: {
    type: Sequelize.STRING,
  },
  lenguaje: {
    type: Sequelize.ENUM('PHP', 'JAVASCRIPT', 'C++', 'JAVA'),
    allowNull: false,
  },
  activo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

const Programador = sequelize.define('programadores', {
  nombre: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  seniority: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
});

Proyecto.belongsToMany(Programador, { through: 'programador_proyecto', as: 'programadores'});
Programador.belongsToMany(Proyecto, { through: 'programador_proyecto', as: 'proyectos'});

app.use(bodyParser.json());

sequelize.sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      popular();
      console.log('El servidor está corriendo en el puerto ' + port);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  });

async function popular() {
  const qProyectos = await Proyecto.count();
  const qProgramadores = await Programador.count();
  if(qProyectos==0 && qProgramadores==0) {
    await Programador.bulkCreate(seeder.programadores, { validate: true });
    await Proyecto.bulkCreate(seeder.proyectos, { validate: true });
    let proyectos = await Proyecto.findAll()
    let programadores = await Programador.findAll()

    await proyectos[0].addProgramadores(programadores[0])
    await proyectos[0].addProgramadores(programadores[1])
    await proyectos[1].addProgramadores(programadores[2])
    await proyectos[1].addProgramadores(programadores[0])
    await proyectos[2].addProgramadores(programadores[2])
  }
}


app.get('/programadores', async (req, res) => {

  const data = await Programador.findAll()
  res.json(data)

});

/*

2) GET programadores/_ID_: Detalle de un programador. Estructura de salida: 
{"id":1,
"nombre":"Juan Pérez",
"email":"juan.perez@gmail.com",
"seniority":5,
"proyectos":[{"id":1,"titulo":"Sistema de gestión de inventarios","lenguaje":"JAVASCRIPT"},
              {"id":2,"titulo":"Aplicación móvil para la gestión de tareas","lenguaje":"JAVA"}
            ]
}

*/



app.get('/programadores/:id', async (req, res) => {
  const { id } = req.params;
  try{
    const unProgramador = await Programador.findByPk(id, {
      include: [{
        model: Proyecto,
        as: 'proyectos',
        through:{
          attributes:[]
        },
        attributes: ['id','titulo','activo']
      }]
    });
    if (unProgramador === null) {
      res.status(404).json({ error: `No se encontró el programador con ID ${id}.` });
    } else {

      console.log(unProgramador.proyectos)
      res.json(unProgramador);
    }
  }
  catch{
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
  }

});

/*
//3) POST programadores: Creación de un programador. Estructura de entrada: 
{"nombre":"Leonel Messi",
"email":"leomessi@gmail.com",
"seniority":10}. 

. Salida: {"id": 5}
*/

app.post('/programadores/', async (req, res) => {
  try {
    const unProgramador = await Programador.build(req.body);
    await unProgramador.validate();
    const unProgramadorValidado = await Programador.create(req.body);
    res.json({id: unProgramadorValidado.id});
  } catch (error) {
    console.error(error);
    res.status(409).json({ errores: error.errors.map(function (e) {return e.message;}) });
  }
});

/*
4) PATCH programadores/_ID_: Actualización de un programador. Estructura de entrada: 
{"nombre":"Leonel Andrés Messi","email":"leomessi@hotmail.com","seniority":9}. .
 Salida: {"id": 5}
*/

app.patch('/programadores/:id', async (req, res) => {
  const { id } = req.params;
  const unProgramador = req.body;
  
  try {
    const [, affectedRows] = await Programador.update(
      unProgramador,
      { where: { id } }
    );
    if (affectedRows === 0) {
      res.status(404).json({ error: `No se encontró el programador con ID ${id}.` });
    } else {
      res.json({ id: id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.',
                            mensaje: error.errors.map(function (e) {return e.message;})});
  }
});

app.delete('/programadores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unProgramador = await Programador.findOne({ where: { id } });
    if (!unProgramador) {
      return res.status(404).json({ error: 'Programador no encontrado' });
    }
    await unProgramador.destroy();
    res.json('ok');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/*6) GET proyectos: Listado de todos los proyectos. Estructura de salida: 
[{"id":1,
"titulo":"Sistema de gestión de inventarios",
"activo":true},
{"id":2,"titulo":"Aplicación móvil para la gestión de tareas","activo":true},{"id":3,"titulo":"Página web de comercio electrónico","activo":false}]*/
app.get('/proyectos', async (req, res) => {
  const data = await Proyecto.findAll()

  let arreglo = data.map(function(x){
    let obj={}
    obj["id"] = x.id;
    obj["titulo"] = x.titulo;
    obj["activo"] = x.activo;

    return obj;
  })
  res.json(arreglo)
});
/*
7) GET proyectos/_ID_: Detalle de un proyecto. Estructura de salida: {"id":1,"titulo":"Sistema de gestión de inventarios","descripcion":"Sistema para llevar el control de inventarios de una empresa","lenguaje":"JAVASCRIPT","activo":true,"programadores":[{"id":1,"nombre":"Juan Pérez","seniority":5},{"id":2,"nombre":"María García","seniority":8}]}
*/
app.get('/proyectos/:id', async (req, res) => {
  const { id } = req.params;
  try{
    const unProyecto = await Proyecto.findByPk(id, {
      include: [{
        model: Programador,
        as: 'programadores',
        through:{
          attributes:[]
        },
        attributes: ['id','nombre','seniority']
      }]
    });
    if (unProyecto === null) {
      res.status(404).json({ error: `No se encontró el programador con ID ${id}.` });
    } else {

      res.json(unProyecto);
    }
  }
  catch{
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
  }
});

/*8) POST proyectos: Creación de un proyecto. Estructura de entrada: 
{"titulo":"Sistema de materias",
"descripcion":"Sistema para materias de una universidad",
"lenguaje":"C++",
"activo":true}. 

Salida: {"id": 5}*/
app.post('/proyectos/', async (req, res) => {
  try {
    const unProyecto = await Proyecto.build(req.body);
    await unProyecto.validate();
    const unProyectoValidado = await Proyecto.create(req.body);
    res.json({id: unProyectoValidado.id});
  } catch (error) {
    console.error(error);
    res.status(409).json({ errores: error.errors.map(function (e) {return e.message;}) });
  }
});
/** 9) PATCH proyectos/_ID_: Actualización de un proyecto. Estructura de entrada:  
 * {"titulo":"Sistema de inventarios",
 * "descripcion":"Sistema para llevar inventarios de una organización",
 * "lenguaje":"JAVA","activo":false}. 
 * Salida: {"id": 5} */
app.patch('/proyectos/:id', async (req, res) => {
  const { id } = req.params;
  const unProyecto = req.body;
  
  try {
    const [, affectedRows] = await Programador.update(
      unProyecto,
      { where: { id } }
    );
    if (affectedRows === 0) {
      res.status(404).json({ error: `No se encontró el proyecto con ID ${id}.` });
    } else {
      res.json({ id: id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.',
                            mensaje: error.errors.map(function (e) {return e.message;})});
  }

});
/**10) DELETE proyectos/_ID_: Borrado de un proyecto. Responder con "ok" en caso correcto. */
app.delete('/proyectos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unProyecto = await Proyecto.findOne({ where: { id } });
    if (!unProyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    await unProyecto.destroy();
    res.json('ok');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }

});

/*11) POST proyectos/_IDPROYECTO_/programadores/_IDPROGRAMADOR_: 
Asigna al proyecto con id=_IDPROYECTO_ al programador con id=_IDPROGRAMADOR_.
 No hay datos de entrada (enviar {}). Salida: "ok". No es necesario revisar si la asignación ya existe.*/
app.post('/proyectos/:idproyecto/programadores/:idprogramador', async (req, res) => {
  
  try{
    const { idproyecto, idprogramador } = req.params;
   
    const unProgramador = await Programador.findByPk(idprogramador);
    const unProyecto = await Proyecto.findByPk(idproyecto);
    await unProgramador.addProyecto(unProyecto);
    res.json('ok');

  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });

  }

});


app.delete('/proyectos/:idproyecto/programadores/:idprogramador', async (req, res) => {
  try{
    const { idproyecto, idprogramador } = req.params;
   
    const unProgramador = await Programador.findByPk(idprogramador);
    const unProyecto = await Proyecto.findByPk(idproyecto);
    await unProgramador.removeProyecto(unProyecto);
    res.json('ok');

  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });

  }
});