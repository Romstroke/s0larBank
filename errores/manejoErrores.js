//Funcion para manejo de errores
const manejoErrores = (error, pool, tabla) => {
    // console.log("Error producido: ", error);
    let status, mensaje;
    let enviado = error.code
    if (enviado == undefined) {
        console.log("Error logico codigo 600");
        enviado = '600'
    } else {
        console.log("Codigo de error PG producido: ", enviado);
    }
    // console.log("Valor de enviado: ", enviado);
    switch (enviado) {
        case '28P01':
            status = 400;
            mensaje = "autentificacion password falló o no existe usuario: " + pool.options.user
            // console.log("autentificacion password falló o no existe usuario: " + pool.options.user);
            break;
        case '23503':
            status = 400; // Aunque podría ser 409 (Conflict) según el contexto
            mensaje = "Violación de integridad referencial: " + error.detail;
            break;
        case '23505':
            status = 400;
            mensaje = "No se puede agregar nuevamente al usuario. ", error.detail
            // console.log("No se puede agregar nuevamente al usuario. ", error.detail);
            break;
        case '23514':
            status = 400;
            mensaje = "Violación de la restricción CHECK: " + error.detail;
            break;
        case '42P01':
            status = 400;
            mensaje = "No existe la tabla consultada [" + tabla + "] "
            // console.log("No existe la tabla consultada [" + tabla + "] ");
            break;
        case '22P02':
            status = 400;
            mensaje = "la sintaxis de entrada no es válida para tipo integer"
            // console.log("la sintaxis de entrada no es válida para tipo integer");
            break;
        case '3D000':
            status = 400;
            mensaje = "Base de Datos [" + pool.options.database + "] no existe"
            // console.log("Base de Datos [" + pool.options.database + "] no existe");
            break;
        case '28000':
            status = 400;
            mensaje = "El user/rol [" + pool.options.user + "] no existe"
            // console.log("El user/rol [" + pool.options.user + "] no existe");
            break;
        case '42601':
            status = 400;
            mensaje = "Error de sintaxis en la instruccion SQL"
            // console.log("Error de sintaxis en la instruccion SQL");
            break;
        case '42703':
            status = 400;
            mensaje = "No existe la columna consultada. " + error.hint
            // console.log("No existe la columna consultada. " + error.hint);
            break;
        case 'ENOTFOUND':
            status = 400;
            mensaje = "Error en valor usado como localhost: " + pool.options.host
            // console.log("Error en valor usado como localhost: " + pool.options.host);
            break;
        case 'ECONNREFUSED':
            status = 400;
            mensaje = "Error en el puerto de conexion a BD, usando: " + pool.options.port
            // console.log("Error en el puerto de conexion a BD, usando: " + pool.options.port);
            break;
        case '600':
            console.log(error.message)
            break;
        default:
            status = 500;
            mensaje = "Error interno del servidor"
            console.log("Error interno del servidor");
            break;
    }
    return { status, mensaje }
};

module.exports = manejoErrores;
