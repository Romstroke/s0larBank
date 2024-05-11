//importe de funciones de consulta bd
const { agregarUsuario, editarUsuario, todos, eliminarUsuario, transferencias, getTransferencias } = require('./consultas/consultas.js');

//levantar servidor con express
const express = require('express');
const app = express();
app.listen(3000, () => {
    console.log('server en puerto 3000')
});

// Middleware para parsear JSON osea que reconoce la instruccion de headers
app.use(express.json());

//sirviendo index
app.get("/", (req, res) => {
    try {
        res.sendFile(__dirname + "/index.html");
    } catch (error) {
        console.error('Error al enviar el archivo HTML:', error);
        res.status(500).send('Error interno del servidor');
    }
});

//agregar usuarios
app.post('/usuario', async (req, res) => {
    try {
        const { nombre, balance } = req.body;
        console.log(nombre, balance);
        console.log('req.body', req.body);
        const result = await agregarUsuario(nombre, balance);
        console.log("Valor devuelto por la función de base de datos: ", result);
        res.status(200).send(result);
    } catch (error) {
        console.error('Error al procesar la solicitud de usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// mostrar usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const result = await todos();
        console.log("Respuesta de la función todos: ", result);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// editar usuario
app.put('/usuario', async (req, res) => {
    try {
        const { id } = req.query;
        const { name, balance } = req.body;
        const result = await editarUsuario(id, name, balance);
        console.log('valores editados:', result);
        res.json(result);
    } catch (error) {
        console.error('Error al editar usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});

//borrar usuarios
app.delete('/usuario', async (req, res) => {
    try {
        const { id } = req.query;
        const resultado = await eliminarUsuario(id);
        console.log(resultado);
        res.send({ resultado });
    } catch (e) {
        res.send(e.message);
    }
});

// transaccion trasferencia
app.post('/transferencia', async (req, res) => {
    try {
        const { emisor, receptor, monto } = req.body;
        console.log('recibido transferencia', req.body);
        const resultado = await transferencias(emisor, receptor, monto);
        res.json(resultado);
    } catch (error) {
        console.error('Error al procesar la transferencia:', error);
        res.status(500).send('Error interno del servidor');
    }
});


// ver transferencias
app.get('/transferencias', async (req, res) => {
    try {
        const result = await getTransferencias();
        console.log("Respuesta de la función getTrans: ", result);
        res.send(result);
    } catch (error) {
        console.error('Error al obtener transferencias:', error);
        res.status(500).send('Error interno del servidor');
    }
});

