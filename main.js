// npm init --yes
// npm i express
//npm i pg
const {agregarUsuario,editarUsuario,todos,eliminarUsuario,transferencias,getTransferencias} = require('./consultas.js');

const express = require('express');
const app = express();
app.listen(3000, () => {
     console.log('server en puerto 3mil')
});


//conectar bbdd postres con node
//colsultas dml con node y pg
//consultas TCL con node y pg
//construir apirestful con posgres para persistencia datos
//manejo errores y codigo de estado http

//BANCO SOLAR Y SU NUEVO SISTEMA DE TRANSFERENCIAS
//QUE REGISTRA NUEVOS USUARIOS CON UN BALANCE INICIAL Y BASADOS EN ESTOS, REALIZA ///////TRANSFERENCIAS//////// DE SALDOS ENTRE ELLOS
// app.use(cors());
// app.use(bodyParser.json()); se usaba antes cuando express no tenia esa funcuion (v4)
// Middleware para parsear JSON osea que reconoce la instruccion de headers
app.use(express.json()); 
//solucion abran
// app.use(express.text({ type: 'text/plain' })); //este para recibir texto plano del front(navegador)

// un json es un texto plano

// en este archivo principal van las rutas

// ● / GET: Devuelve la aplicación cliente disponible en el apoyo de la prueba. 

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

//un servidor es una api sin front

// ● /usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.



app.post('/usuario', async (req, res) => {


    //NODE PURO 
    // let body = '';
    // req.on('data', (data) => body+=data)
    // req.on('end', () => {
    //     const data = JSON.parse(body)
    //     console.log('req.on',data);
    //     const nombre = data.nombre;
    //     const balance = data.balance;
    //     const result = agregarUsuario(nombre,balance)
    //     console.log(result)
    //     res.send(result);
    // });

    // "{"nombre":"juanito","balance":10000}"
    // Obtener los datos del cuerpo de la solicitud
    // const {nombre,balance} = JSON.parse(req.body); //parse lo convierte en objeto
    const {nombre,balance} = req.body;
    // const {nombre} = req.body.nombre;
    // const {balance} = req.body.balance;
    console.log(nombre,balance)
    console.log('req.body',req.body);

    const result = await agregarUsuario(nombre, balance);
    console.log("Valor devuelto por la funcion de base de datos: ", result);
    res.status(200).send(result);

    // Aquí deberías realizar la lógica para insertar el usuario en la base de datos
    // Por ahora, simplemente imprimiremos los datos recibidos
    // console.log(`Nuevo usuario: Nombre - ${nombre}, Balance - ${balance}`);

    // Enviar una respuesta al cliente
    // res.status(200).send('Usuario insertado correctamente');
});

// ● /usuarios GET: Devuelve todos los usuarios registrados con sus balances.

app.get('/usuarios', async (req,res) => {
    const result = await todos();
    console.log("Respuesta de la funcion todos: ", result);
    res.json(result);
});
// ● /usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.

app.put('/usuario', async (req,res) => {
    const {id} = req.query;
    const { name, balance } = req.body; //en la funcion del front se  llama name
    const result = await editarUsuario(id,name,balance);
    console.log('valores editados:', result);
    res.json(result); //POR QUE EN JSON?
});

// ● /usuario DELETE: Recibe el id de un usuario registrado y lo elimina .

app.delete('/usuario', async (req,res) => {
    const {id} = req.query;
    const resultado = await eliminarUsuario(id);
    console.log(resultado);
    res.json(resultado);
});

//  ● /transferencia POST: Recibe los datos para realizar una nueva transferencia.Se debe ocupar una transacción SQL en la consulta a la base de datos.

app.post('/transferencia', async(req,res) => {
    const {emisor,receptor,monto} = req.body;
    console.log('recibido transferencia',req.body);
    const resultado = await transferencias(emisor,receptor,monto);
    res.json(resultado);
});

//   ● /transferencias GET: Devuelve todas las transferencias almacenadas en la base de datos en formato de arreglo. 

app.get('/transferencias', async (req,res) => {
    const result = await getTransferencias();
    console.log("Respuesta de la funcion getTrans: ", result);
    res.send(result);
});
