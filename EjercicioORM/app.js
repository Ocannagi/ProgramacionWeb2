const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  storage: 'db_alumnos.db',
  dialect: 'sqlite',
  define: {
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  },
});

const Alumno = sequelize.define('alumnos', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "nombre" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "nombre" no puede estar vacío'
      }
    }
  },
    email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "email" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "email" no puede estar vacío'
      },
      isEmail: true
    }
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: true,
    validate: {
      notNull: {
        msg: 'El campo "fecha_nacimiento" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "fecha_nacimiento" no puede estar vacío'
      },
      isBefore: "2008-01-01"
    }
  }

});

const Cursada = sequelize.define('cursadas', {
  materia: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "materia" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "materia" no puede estar vacío'
      }
    }
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "anio" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "anio" no puede estar vacío'
      },
      max: 2100,
      min: 2015,
    }
  },
  cuatrimestre:{
	  type: DataTypes.INTEGER,
	  allowNull: false,
	  validate:{
		notNull: {
			msg: 'El campo "cuatrimestre" no puede ser nulo'
		},
		notEmpty: {
			msg: 'El campo "cuatrimestre" no puede estar vacío'
		},
	    isIn: {
			args: [[1, 2]],
			msg: 'El campo "cuatrimestre" debe ser una de las siguientes opciones: 1 ó 2'
		}
	  }
  },
  aprobada:{
	  type: DataTypes.BOOLEAN,
    defaultValue: null,
	  allowNull: true,
	  validate: {
		  isIn:{
			  args: [[0,1,false,true,null]],
			  msg: 'El campo "aprobada" debe ser una de las siguientes opciones: 1 / true (=verdadero), 0 / false (=falso) o null (=en_curso)'
		  }
	  }
  }
});

Alumno.hasMany(Cursada, { as: 'cursadas' });

app.use(bodyParser.json());

sequelize.sync(/*force:true*/) //para reiniciar la database cada vez que se reinicia
  .then(() => {
    app.listen(port, () => {
      popular();
      console.log('El servidor está corriendo en el puerto ' + port);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  });

app.get('/alumnos', async (req, res) => {
  const data = await Alumno.findAll()
  res.json(data)
});

app.get('/alumnos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unAlumno = await Alumno.findByPk(id, {
      include: 'cursadas'
    });
    if (unAlumno === null) {
      res.status(404).json({ error: `No se encontró el alumno con ID ${id}.` });
    } else {
      res.json(unAlumno);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
  }
});

app.post('/alumno/', async (req, res) => {
  try {
    const unAlumno = await Alumno.build(req.body);
    await unAlumno.validate();
    const unAlumnoValidado = await Alumno.create(req.body);
    res.json({id: unAlumnoValidado.id});
  } catch (error) {
    console.error(error);
    res.status(409).json({ errores: error.errors.map(function (e) {return e.message;}) });
  }
});

app.patch('/alumno/:id', async (req, res) => {
  const { id } = req.params;
  const unAlumno = req.body;
  
  try {
    const [, affectedRows] = await Alumno.update(
      unAlumno,
      { where: { id } }
    );
    if (affectedRows === 0) {
      res.status(404).json({ error: `No se encontró el alumno con ID ${id}.` });
    } else {
      res.json({ id: id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.',
                            mensaje: error.errors.map(function (e) {return e.message;})});
  }
});

app.delete('/alumno/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const UnAlumno = await Alumno.findOne({ where: { id } });
    if (!UnAlumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    await UnAlumno.destroy();
    res.json('ok');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/alumnos/:id/cursada', async (req, res) => {
  const { id } = req.params;
  try {
    
    const unAlumno = await Alumno.findByPk(id);
    if (unAlumno === null) {
      res.status(404).json({ error: `No se encontró el alumno con ID ${id}.` });
    }
    const unaCursada = await Cursada.build(req.body);
    await unaCursada.validate();
    const unaCursadaValidada = await Cursada.create(req.body);
    await unAlumno.addCursada(unaCursadaValidada);
    res.json({idCursada: unaCursadaValidada.id,
              idAlumno: unAlumno.id});
  } catch (error) {
    console.error(error);
    res.status(409).json({ errores: error.errors.map(function (e) {return e.message;}) });
  }
});

app.patch('/cursada/aprobar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [, affectedRows] = await Cursada.update(
      { aprobada: true },
      { where: { id } }
    );
    if (affectedRows === 0) {
      res.status(404).json({ error: `No se encontró la cursada con ID ${id}.` });
    } else {
      res.json({ id: id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.',
                            mensaje: error.errors.map(function (e) {return e.message;})});
  }
});

app.patch('/cursada/reprobar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [, affectedRows] = await Cursada.update(
      { aprobada: false },
      { where: { id } }
    );
    if (affectedRows === 0) {
      res.status(404).json({ error: `No se encontró la cursada con ID ${id}.` });
    } else {
      res.json({ id: id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.',
                            mensaje: error.errors.map(function (e) {return e.message;})});
  }
});

app.delete('/cursada/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unaCursada = await Cursada.findOne({ where: { id } });
    if (!unaCursada) {
      return res.status(404).json({ error: 'Cursada no encontrada' });
    }
    await unaCursada.destroy();
    res.json('ok');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


async function popular() {
  const qAlumnos = await Alumno.count();
  const qCursadas = await Cursada.count();
  if(qAlumnos==0 && qCursadas==0) {
    const alumnos = [
      { nombre: 'Jimi Hendrix',email: 'tutuia@gmail.com', fecha_nacimiento : '1998-03-29' },
      { nombre: 'Flea',email: 'cric@gmail.com', fecha_nacimiento : '1998-02-08' },
      { nombre: 'Dave Grohl',email: 'tutuia@gmail.com', fecha_nacimiento : '1998-03-29' },
      { nombre: 'Robert Trujillo',email: 'tutuia@gmail.com', fecha_nacimiento : '1998-03-29' },
      { nombre: 'Tom Morello',email: 'tutuia@gmail.com', fecha_nacimiento : '1998-03-29' }
    ];

    const cursadas = [
      { materia: 'Algoritmos', anio: 2023, cuatrimestre: 1, aprobada: true, alumnoId: 1 },
      { materia: 'Base de Datos', anio: 2023, cuatrimestre: 2, aprobada: false, alumnoId: 1 },
      { materia: 'Algoritmos', anio: 2023, cuatrimestre: 1, aprobada: null, alumnoId: 2 },
      { materia: 'Base de Datos', anio: 2023, cuatrimestre: 2, aprobada: true, alumnoId: 2 },
      { materia: 'Algoritmos', anio: 2023, cuatrimestre: 1, aprobada: false, alumnoId: 3 },
      { materia: 'Base de Datos', anio: 2023, cuatrimestre: 2, aprobada: null, alumnoId: 3 },
      { materia: 'Algoritmos', anio: 2023, cuatrimestre: 1, aprobada: null, alumnoId: 4 },
      { materia: 'Base de Datos', anio: 2023, cuatrimestre: 2, aprobada: true, alumnoId: 4 },
      { materia: 'Algoritmos', anio: 2023, cuatrimestre: 1, aprobada: false, alumnoId: 5 },
      { materia: 'Base de Datos', anio: 2023, cuatrimestre: 2, aprobada: false, alumnoId: 5 }
    ];
    Alumno.bulkCreate(alumnos, { validate: true });
    Cursada.bulkCreate(cursadas, { validate: true });
  }
}