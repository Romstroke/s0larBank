//importe de funciones de consulta bd
const { agregarUsuario, editarUsuario, todos, eliminarUsuario, transferencias, getTransferencias } = require('./consultas/consultas.js');

//levantar servidor con express
const express = require('express');
const app = express();
app.listen(3000, () => {
    console.log('server corriendo en puerto 3000')
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
    const { nombre, balance } = req.body;
    console.log(nombre, balance)
    console.log('req.body', req.body);

    //Validar que balance sea mayor o igual a 0 y número
    if (Number.isInteger(balance) && balance >= 0) {
        const result = await agregarUsuario(nombre, balance);
        console.log("Valor devuelto por la funcion de base de datos: ", result);
        res.status(result.status).send(result);
    } else if (Number.isInteger(balance) && balance <= 0) {
        console.log('Tienes que poner un numero mayor a 0');
        res.status(400).send({
            mensaje: 'Tienes que poner un numero mayor a 0'
        })
    } else {
        console.log('El balance tiene que ser un número entero');
        res.status(400).send({
            mensaje: 'El balance tiene que ser un número entero'
        })
    }

});

// mostrar usuarios
app.get('/usuarios', async (req, res) => {
    const result = await todos();
    console.log("Respuesta de la funcion todos: ", result);
    // res.json(result);
    res.status(200).json(result);
});

// editar usuario
app.put('/usuario', async (req, res) => {
    const { id } = req.query;
    const { name, balance } = req.body;
    const result = await editarUsuario(id, name, balance);
    console.log('valores editados:', result);
    res.json(result);
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
    const { emisor, receptor, monto } = req.body;
       //que emisor y receptor no sean el mismo
       if(emisor == receptor){
        console.log('Emisor y receptor no pueden ser la misma persona');
        res.status(400).send({
            mensaje: 'Emisor y receptor no pueden ser la misma persona'
        })
    }else{
        console.log('recibido transferencia', req.body);

        // FALTA AGREGAR UNA ALERTA QUE DIGA QUE EL EMISOR NO TIENE DINERO SUFICIENTE

        // if(emisor.balance < monto){
        //     console.log('Emisor sin dinero suficiente para realizar esta transferencia');
        //     res.status(400).send({
        //         mensaje: 'Emisor sin dinero suficiente para realizar esta transferencia'
        //     })
        // }
        const resultado = await transferencias(emisor, receptor, monto);
        res.json(resultado);
    }
});

// ver transferencias
app.get('/transferencias', async (req, res) => {
    const result = await getTransferencias();
    console.log("Respuesta de la funcion getTrans: ", result);
    res.send(result);
});
