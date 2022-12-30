const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    // here we are taking username and password from request body
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    (username, password, callback) => {
      // Logging usrname and password that we got from request body
      console.log(username + '  ' + password);
      // Using Mongoose model to check DB for user with the same name
      Users.findOne({ Username: username }, (error, user) => {
        // If there is error, we are logging it, error message is passed to callback function
        if (error) {
          console.log(error);
          return callback(error);
        }

        // If there is no such user in Mongoose DB error message is passed to callback function
        if (!user) {
          console.log('incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }

        // If there is a match in Mongoose DB callback function is being executed (this is login endpoint)
        console.log('finished');
        return callback(null, user);
      });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      // We extract JSON Web Token from the header of the HTTP request
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      // a “secret” key to verify the signature of the JWT.
      secretOrKey: 'your_jwt_secret',
    },

    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);

