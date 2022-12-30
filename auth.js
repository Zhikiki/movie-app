const jwtSecret = 'your_jwt_secret';
// This has to be the same key used in the JWTStrategy in passport.js file

const jwt = require('jsonwebtoken');
const passport = require('passport');

// Importing local passport file
require('./passport');

// Here we create JWT based on username and password
// We get parametr "user" from second function
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    // This is the username you’re encoding in the JWT
    subject: user.Username,
    // This specifies that the token will expire in 7 days
    expiresIn: '7d',
    // This is the algorithm used to “sign” or encode the values of the JWT
    algorithm: 'HS256',
  });
};

/* POST login. */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    // The code uses the LocalStrategy to check
    // that the username and password in the body of the request exist in the DB.
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }

      // If user exists in DB, we create JWT by calling generateJWTToken()
      // and sending user.JSON() as a atribute to this function
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        // line of code that returns the token
        // shorthand for res.json({ user: user, token: token })
        return res.json({ user, token });
      });
    })(req, res);
  });
};
