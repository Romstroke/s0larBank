// Conexion a base de datos
const pool = require('./config/conexion.js');

// ● / GET: Devuelve la aplicación cliente disponible en el apoyo de la prueba. 
//no requiere consulta xq sirve el html nomas

//  ● /usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
async function agregarUsuario(nombre, balance) {
    console.log("Valores recibidos: ", nombre, balance);
    const result = await pool.query({
        text: 'INSERT INTO usuarios (id, nombre, balance) VALUES (default, $1, $2) RETURNING *', //REVISAR LO DE DEFAULT
        values: [nombre, balance]
    })
    console.log("Registro agregado: ", result.rows[0]); //result.rows[0] es la posicion 0 de un array o de un objeto?
    //Respuesta de la funcion
    return result.rows[0];
    // return "Registro agregado con exito"
};
// agregarUsuario('nombre1', 0);

//   ● /usuarios GET: Devuelve todos los usuarios registrados con sus balances.

async function todos() {
    const result = await pool.query("SELECT * FROM usuarios order by id");
    return result.rows;
}

//    ● /usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.

async function editarUsuario(id, nombre, balance) {
    const result = await pool.query("UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *", [id, nombre, balance]); //DA LO MISMO EL ORDEN EN QUE INGRESAN LOS PARAMETROS??
    return result.rows[0];
}

// editarUsuario(1,'nombrw1',1)

//     ● /usuario DELETE: Recibe el id de un usuario registrado y lo elimina .

//AHORA PONER CASCADE

const eliminarUsuario = async (id) => {
    const result = await pool.query(
        {
            text: 'delete from usuarios where id = $1 returning *',
            values: [id]
        });
    console.log('user eliminado:', result.rows)
    return result.rows;
};

//      ● /transferencia POST: Recibe los datos para realizar una nueva transferencia. Se debe ocupar una transacción SQL en la consulta a la base de datos.

/////////// VER LO DE LA FECHA

async function transferencias(emisor, receptor, monto, fechaHoraActual) {
    
    
    try {
        //fecha
        const fechaHoraActual = (await pool.query("SELECT NOW()")).rows[0].now;
        console.log('datos llegando a funcion', emisor, receptor, monto, fechaHoraActual)
        //id emisor
        const consultaIdUno = "select id from usuarios where nombre = $1";
        const resEmisor = await pool.query(consultaIdUno, [emisor]);
        //id receptor
        const consultaIdDos = "select id from usuarios where nombre = $1";
        const resReceptor = await pool.query(consultaIdDos, [receptor]);

        let idEmisor = resEmisor.rows[0].id;
        let idReceptor = resReceptor.rows[0].id;

        console.log('ids:', idEmisor, idReceptor)

        await pool.query("BEGIN");
        const resta = "UPDATE usuarios SET balance = balance - $1 WHERE id = $2 RETURNING *";
        const res1 = await pool.query(resta, [monto, idEmisor]);
        if (res1) {
            console.log("Operacion de descuento exitosa: ", res1.rows[0]);

        } else {
            console.error("Error al ejecutar la consulta SQL 1");
        }

        const suma = "UPDATE usuarios SET balance = balance + $1 WHERE id = $2 RETURNING *";
        const res2 = await pool.query(suma, [monto, idReceptor]);
        if (res2) {
            console.log("Operacion de suma exitosa: ", res2.rows[0]);

        } else {
            console.error("Error al ejecutar la consulta SQL 2");
        }

        const transferencia = "INSERT INTO transferencias (id, emisor, receptor, monto, fecha) VALUES(DEFAULT, $1, $2, $3, $4) RETURNING *";
        const res3 = await pool.query(transferencia, [idEmisor, idReceptor, monto, fechaHoraActual]);
        console.log("Operacion de transferencia exitosa: ", res3.rows[0]);

        await pool.query("COMMIT"); //hay que verificar x cada res?
        if (res1.rowCount == 1 && res2.rowCount == 1 && res3.rowCount == 1) {
            await pool.query("COMMIT");
            console.log("Transacción completa y exitosa");
            return "*** Transacción completa y exitosa ***";
        } else {
            await pool.query("ROLLBACK");
            console.log("Transacción incompleta, se aplicó ROLLBACK");
            return e
        }

    } catch (e) {
        await pool.query("ROLLBACK");
        console.log("Error conexion o instruccion, Transaccion abortada")
        return e
    }
};

// transferencias(95, 99, 2,"2024-05-08 15:30:00");

// ● /transferencias GET: Devuelve todas las transferencias almacenadas en la base de datos en formato de arreglo. 

async function getTransferencias() {
    const result = await pool.query(
        {
            text: 'SELECT t.fecha, u.nombre, r.nombre, t.monto FROM transferencias t INNER JOIN usuarios u ON u.id = t.emisor INNER JOIN usuarios r ON r.id = t.receptor',
            rowMode: 'array'
        });
    // console.log('usuarios en tabla transf:', result.rows)
    return result.rows;
}

module.exports = { agregarUsuario, editarUsuario, todos, eliminarUsuario, transferencias, getTransferencias };