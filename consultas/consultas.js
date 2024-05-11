// Conexion a base de datos
const pool = require('../config/conexion.js');
//manejo errores
const manejoErrores = require('../errores/manejoErrores.js');

//  agregar usuario
async function agregarUsuario(nombre, balance) {
    try {
        console.log("Valores recibidos: ", nombre, balance);
        const result = await pool.query({
            text: 'INSERT INTO usuarios (id, nombre, balance) VALUES (DEFAULT, $1, $2) RETURNING *',
            values: [nombre, balance]
        });
        console.log("Registro agregado: ", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        manejoErrores(error,pool,'usuarios');
    }
}

//mostrar usuarios
async function todos() {
    try {
        const result = await pool.query("SELECT * FROM usuarios ORDER BY id");
        return result.rows;
    } catch (error) {
        manejoErrores(error,pool,'usuarios');
    }
}

//editar usuario
async function editarUsuario(id, nombre, balance) {
    try {
        const result = await pool.query("UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *", [id, nombre, balance]);
        return result.rows[0];
    } catch (error) {
        manejoErrores(error,pool,'usuarios');
    }
}

//eliminar usuario
const eliminarUsuario = async (id) => {
    try {
        const result = await pool.query({
            text: 'DELETE FROM usuarios WHERE id = $1 RETURNING *',
            values: [id]
        });

        console.log('Usuario eliminado:', result.rows);

        if (result.rows.length > 0) {
            return { success: true, message: 'Registro eliminado correctamente' };
        } else {
            return { success: false, message: 'El usuario no existe' };
        }
    } catch (error) {
        manejoErrores(error,pool,'usuarios');
        return { success: false, message: 'Error al eliminar usuario' };
    }
};

//proceso tranferencia
async function transferencias(emisor, receptor, monto) {

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

        //inicio transaccion
        await pool.query("BEGIN");
        //quitar a emisor
        const resta = "UPDATE usuarios SET balance = balance - $1 WHERE id = $2 RETURNING *";
        const res1 = await pool.query(resta, [monto, idEmisor]);
        if (res1) {
            console.log("Operacion de descuento exitosa: ", res1.rows[0]);

        } else {
            console.error("Error al ejecutar la consulta SQL 1");
        }
        //entregar a receptor
        const suma = "UPDATE usuarios SET balance = balance + $1 WHERE id = $2 RETURNING *";
        const res2 = await pool.query(suma, [monto, idReceptor]);
        if (res2) {
            console.log("Operacion de suma exitosa: ", res2.rows[0]);

        } else {
            console.error("Error al ejecutar la consulta SQL 2");
        }
        //agregar transferencia
        const transferencia = "INSERT INTO transferencias (id, emisor, receptor, monto, fecha) VALUES(DEFAULT, $1, $2, $3, $4) RETURNING *";
        const res3 = await pool.query(transferencia, [idEmisor, idReceptor, monto, fechaHoraActual]);
        console.log("Operacion de transferencia exitosa: ", res3.rows[0]);
        //validar que estén bien hechas las 3 consultas y commit si true, rollback si falla
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
        manejoErrores(error,pool,'usuarios');
        console.log("Error conexion o instruccion, Transaccion abortada")
        return e
    }
};

//obtener transferencias registradas como array
async function getTransferencias() {
    try {
        const result = await pool.query({
            text: 'SELECT t.id, u.nombre, r.nombre, t.monto, t.fecha FROM transferencias t INNER JOIN usuarios u ON u.id = t.emisor INNER JOIN usuarios r ON r.id = t.receptor',
            rowMode: 'array'
        });
        return result.rows;
    } catch (error) {
        manejoErrores(error,pool,'usuarios');
    }
}

module.exports = { agregarUsuario, editarUsuario, todos, eliminarUsuario, transferencias, getTransferencias };