var express = require('express');
var router = express.Router();
var sql = require('../routes/Operation')
const usersMiddleware  = require('../middleware/usersToken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const dotenv = require('dotenv');
dotenv.config();

// Aplicación levantada por defecto
router.get('/',function(req,res, next){
    res.send('Aplicación correcta');
});

//Conexión SQL
router.get('/sql', function(req, res){
    sql.SQLconn();
    res.send('Conexión correcta base de datos SQL');
  console.log(res)
});

//Filtro de datos
// router.post('/GetIn', sql.getGetInInformation);
router.post('/GetIn', usersMiddleware.authenticateToken, function (req, res, next) {
  try {
    sql.getGetInInformation(req, res).then(result => { 
      // console.log(result) 
    });
  } catch (error) {
    console.log(error);
  }
});

//Validación de token
router.route('/authUsers').post((req, res) => {
  var data = req.body;
  try {
    sql.authentication(req, res).then(result => {
        res.json(result)
      });
  } catch (error) {
    console.log(error);
  }
});

//Swagger
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = router;