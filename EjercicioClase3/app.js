const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'uces',
  password: 'uces',
  database: 'uces',
});

connection.connect((error) => {
  if (error) {
    console.error(`Error de conexión: ${error.stack}`);
    return;
  }
  console.log('Conexión exitosa a la base de datos!');
});

// Resto del código de la aplicación

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM musicos', (err, rows, fields) => {
    if (err) throw err
    res.json(rows)
  })
});


app.get('/:id', (req, res) => {
	const {id} = req.params;
	
  connection.query(`SELECT * FROM musicos WHERE id = ${id}`, (err, rows, fields) => {
    if (err) throw err
    if(rows.length === 0)
	{
		res.status(404).send("Musico no encontrado")
	}else{
		res.json(rows[0])
	}	
  })
});

app.post('/', (req, res) => {
	
	const { nombre, en_actividad, instrumento } = req.body;

	
	if(!nombre || !en_actividad || !instrumento || (parseInt(en_actividad) > 1 || parseInt(en_actividad) < 0 )){
		res.status(400).send("BAD");

	}else{
		connection.query("Insert into musicos (nombre, en_actividad, instrumento) " + `VALUES("${nombre}",${parseInt(en_actividad)},"${instrumento}")`, (err, rows, fields) => {
		if (err) throw err
	 
		res.json(rows.insertId)
  })
	}
	
});
