const express = require('express');

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Creates a stream for logging requests to log.txt
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

//  returns a default textual response
app.get('/', (req, res) => {
  res.send('Welcome to my movie-api app');
});

// Returns a JSON object holding data about all the movies (REED)
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// !!!!!!!!!!Returns a JSON object holding data about a single movie by title (REED)
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// !!!!!!! Returns a JSON object holding data about ganre by name (REED)
// How to integrate if statement that will send a message
// `The ganre with this name ${movie.Genre} is not found`
app.get('/movies/genre/:ganreName', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.ganreName })
    .then((movie) => {
      res.status(200).json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });

  // const { ganreName } = req.params;
  // const ganre = movies.find((movie) => movie.ganre.name === ganreName).ganre;

  // if (ganre) {
  //   res.status(200).json(ganre);
  // } else {
  //   res.status(400).send('The ganre with this name is not found');
  // }
});

// !!!!!!! Returns a JSON object holding data about director by name (REED)
app.get('/movies/directors/:direcrorName', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.direcrorName })
    .then((movie) => {
      res.status(200).json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Returns JSON object with newly created movie (CREATE)
app.post('/movies', (req, res) => {
  Movies.findOne({ Title: req.body.Title })
    .then((movie) => {
      if (movie) {
        return res.status(400).send(req.body.Title + ' aleady exists');
      } else {
        Movies.create({
          Title: req.body.Title,
          Description: req.body.Description,
          Genre: {
            Name: req.body.Genre.Name,
            Description: req.body.Genre.Description,
          },
          Director: {
            Name: req.body.Director.Name,
            Bio: req.body.Director.Bio,
          },
          Actors: req.body.Actors,
          ImagePath: req.body.ImageURL,
          Featured: req.body.Featured,
        })
          .then((movie) => {
            res.status(201).json(movie);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// !!!!!!!!!!!!!Allow new users to Register (CREATE)
// Returns a JSON object holding data about the users to add
// date appears with month -1 (if i put april in new user appears march)
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// !!!!!!!!Returns a JSON object holding data about all the USERS (REED)
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// !!!!!!! Allow new users update their user info (UPDATE)
// Returnes JSON object with updated information.

app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// !!!!!!!! Adds movie to favorite list (CREATE)
// Returnes JSON with updated user info
// Better to implement check if movie is already added to favorite
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Delete movie from favorite list (DELETE)
// A text message indicating whether the movie was successfully removed from user's favorite list
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error ' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// !!!!!!! Allow existing users to deregister (DELETE)
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.use(express.static(path.join(__dirname, 'public')));

// ERROR Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong here!');
});

// listen for requests
app.listen(8080, () => {
  console.log('My app is listening on port 8080.');
});
