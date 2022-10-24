var express = require('express');
var router = express.Router();
const config = require('../config/config');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const sqlConfig = require('../config/config');
const { response } = require('express');


// const ExpirationTime = '15s';

async function SQLconn(){
    try {
        let pool = await sql.connect(config)
        console.log('Conexión a sql server correcta');
    } catch (error) {
        console.log(error);
    }
};

async function getGetInInformation(req, res){
    // console.log("Entra a metodo de datos");
    const { body } = req;
    try {
      // console.log("Entra a conexión de base de datos");
      let result = sql.connect(config, function () {
        var Error = "";
        var Result = 0;
        //Se agrega parametros de entrara para indicar que información se va a actualizar
        var request = new sql.Request();
        // console.log("Entra a parametros de ingresos");
        request.input("NoTicketsXHora", sql.VarChar(100), body.NoTicketsXHora);
        request.input("TotalxHora", sql.VarChar(100), body.TotalxHora);
        request.input("NoItemsVendidosXHora", sql.VarChar(100), body.NoItemsVendidosXHora);
        request.input("IdentificadorTienda", sql.VarChar(100), body.IdentificadorTienda);
        request.input("Fecha", sql.VarChar(50), body.Fecha);
        request.input("Hora", sql.VarChar(2), body.Hora);
        request.output("IdResult", sql.Int, Result);
        request.output("Result", sql.VarChar(1000), Error);
        // console.log(body.NoTicketsXHora, body.TotalxHora, body.NoItemsVendidosXHora, body.IdentificadorTienda, body.Fecha, body.Hora, Result, Error);
        // console.log(body.Fecha, body.Hora);
        request.execute('GetInDatosDts', function (err, recordsets, returnValue, affected) {
          if (err) {
            resolve(err);
            // res.status(401).send({ status: "Fail", data: err });
          } else {
            if(recordsets.recordset === undefined){
              console.log("No hay datos");
            } else {
              var resultdata = recordsets.recordset
              res.send(resultdata);
            //res.status(200).send({ status: "OK", data: resultdata });
            }
          }
        });
      });
    } catch (error) {
      console.log("Error al regresar datos");
      res.status(error?.status || 500).send({ status: 'FAILED', data: { error: error?.message || error}});
    }
};

//Base de libreria
async function authentication(req, res) {
    // console.log("Entra autenticación");
    const { Nombre, Contrasena } = req.body;  
    try {
      return new Promise(async function (resolve, reject) {
        try {
          let result = sql.connect(config, function () {
            // console.log("Entra conexión base");
            var Existe = "";
            var Error = "";
            var Result = 0;
            var request = new sql.Request();
            request.input('Nombre', sql.VarChar(50), Nombre);
            request.input('Contrasena', sql.VarChar(50), Contrasena);
            request.output('Existe', sql.Int, Existe);
            request.output('IdResult', sql.Int, Result);
            request.output('Result', sql.VarChar(1000), Error);
            // console.log("Termina variables");
            request.execute('ValidaUsuario', function (err, recordsets, returnValue, affected) {
              // console.log(recordsets.output.Existe);
              if (err) {return res.status(400).send({message: err});}
              const validate = recordsets.output.Existe
              if (validate == 0) 
              {
                return res.status(400).send({message: "Usuario o contraseña incorrecta"});
              } 
              else if (validate == 1) 
              {
                (async () => {
                let Expiracion = await getGetInExpirationTime();
                // console.log(Expiracion);                
                const token = jwt.sign({Nombre: recordsets.recordset.Nombre,}, 
                    'secret', { expiresIn: Expiracion } , 
                    process.env.JWT_TOKEN_SECRET, 
                    process.env.access_token)
                    return resolve({Nombre: Nombre, token: token, token_type: "bearer",
                    expiresIn: Expiracion,
                    refresh_token: process.env.refresh_token
                  });
                })();
              }
            })
          });
        } catch (err) {
          reject(err);
        }
      });
    } catch (error) {
      console.log(error)
    }
};
  
// const jwtOptions = {
//     expiresIn: ExpirationTime,
//     algorithm: 'RS256'  
// };


async function getGetInExpirationTime() {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().execute('ConfiguracionTokenDts');        
        let ExpirationTime = { Expiracion: result.recordset[0]['Expiracion'].trim() };
        return ExpirationTime.Expiracion;
        
    } catch (error) {
        console.log("Ocurrió un error al obtener los datos:", error);
        return false;
    }
};

module.exports = {
    SQLconn : SQLconn,
    authentication : authentication,
    getGetInInformation,
    getGetInExpirationTime
};