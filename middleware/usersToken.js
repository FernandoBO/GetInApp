require('dotenv')
const jwt = require("jsonwebtoken");

module.exports = {
  authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
    // console.log(token);
      if (token == null)  {
        console.log("Token Vacío");
        return res.sendStatus(401);
      }
      if (!token) {
        throw new Error('Authentication failed!');
      }
      const verified = jwt.verify(token, process.env.JWT_KEY);
      req.user = verified;
      next();
      // console.log(verified);
        // jwt.verify(token, process.env.access_token, (err, data) => {
        //     if (err) {console.log("El error es:", err)
        //     return res.sendStatus(403)}
        //     next();
        // });
    } catch (error) {
      // console.log(error);
      res.status(400).send('Invalid token !');
    }
  }
};