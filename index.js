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

// let users = [
//   { id: 1, name: 'Kate', favoriteMovies: [] },
//   { id: 2, name: 'Joe', favoriteMovies: ['The Godfather'] },
//   { id: 3, name: 'Richard', favoriteMovies: ["Schindler's list"] },
// ];

// let movies = [
//   {
//     title: 'The Godfather',
//     description:
//       'The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son.',
//     ganre: {
//       name: 'Crime',
//       description:
//         'Crime film is a genre that revolves around the action of a criminal mastermind. A Crime film will often revolve around the criminal himself, chronicling his rise and fall.',
//     },
//     director: {
//       name: 'Francis Ford Coppola',
//       bio: 'Francis Ford Coppola, (born April 7, 1939, Detroit, Michigan, U.S.), American motion-picture director, writer, and producer whose films range from sweeping epics to small-scale character studies. As the director of films such as The Godfather (1972), The Conversation (1974), and Apocalypse Now (1979), he enjoyed his greatest success and influence in the 1970s, when he attempted to create an alternative to the Hollywood system of film production and distribution.',
//       birth: 1939,
//     },
//     imageURL:
//       'https://www.imdb.com/title/tt0068646/mediaviewer/rm746868224/?ref_=tt_ov_i',
//     featured: false,
//     year: 1972,
//   },
//   {
//     title: 'The Shawshank redemtion',
//     description:
//       'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
//     ganre: {
//       name: 'Drama',
//       description:
//         'In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.',
//     },
//     director: {
//       name: 'Frank Darabont',
//       bio: 'Frank Árpád Darabont (born Ferenc Árpád Darabont, January 28, 1959) is an American film director, screenwriter and producer. He has been nominated for three Academy Awards and a Golden Globe Award. In his early career, he was primarily a screenwriter for such horror films as A Nightmare on Elm Street 3: Dream Warriors (1987), The Blob (1988) and The Fly II (1989). As a director, he is known for his film adaptations of Stephen King novellas and novels, such as The Shawshank Redemption (1994), The Green Mile (1999), and The Mist (2007).',
//       birth: 1959,
//     },
//     imageURL:
//       'https://www.imdb.com/title/tt0111161/mediaviewer/rm10105600/?ref_=tt_ov_i',
//     featured: false,
//     year: 1994,
//   },
//   {
//     title: "Schindler's List",
//     description:
//       'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis..',
//     ganre: {
//       name: 'Drama',
//       description:
//         'In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.',
//     },
//     director: {
//       name: 'Steven Spilberg',
//       bio: 'Steven Spielberg, in full Steven Allan Spielberg, (born December 18, 1946, Cincinnati, Ohio, U.S.), American motion-picture director and producer whose diverse films—which ranged from science-fiction fare, including such classics as Close Encounters of the Third Kind (1977) and E.T.: The Extra-Terrestrial (1982), to historical dramas, notably Schindler’s List (1993) and Saving Private Ryan (1998)—enjoyed both unprecedented popularity and critical success.',
//       birth: 1946,
//     },
//     imageURL:
//       'https://www.imdb.com/title/tt0108052/mediaviewer/rm1610023168/?ref_=tt_ov_i',
//     featured: false,
//     year: 1993,
//   },
// ];

// Creates a stream for logging requests to log.txt
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

//  returns a default textual response
app.get('/', (req, res) => {
  res.send('Welcome to my movie-api app');
});

// !!!!!!!!!!!Returns a JSON object holding data about all the movies (REED)
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
// app.get('/movies', (req, res) => {
//   res.status(200).json(movies);
// });

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
  // const title = req.params.title; // below there's a new way of writing it
  // Object Destructuring
  // const { title } = req.params;
  // const movie = movies.find((movie) => movie.title === title);
  // if (movie) {
  //   res.status(200).json(movie);
  // } else {
  //   res.status(400).send('The movie with this name is not found');
  // }
});

// Returns a JSON object holding data about ganre by name (REED)
app.get('/movies/genre/:ganreName', (req, res) => {
  const { ganreName } = req.params;
  const ganre = movies.find((movie) => movie.ganre.name === ganreName).ganre;

  if (ganre) {
    res.status(200).json(ganre);
  } else {
    res.status(400).send('The ganre with this name is not found');
  }
});

// Returns a JSON object holding data about director by name (REED)
app.get('/movies/directors/:direcrorName', (req, res) => {
  const { direcrorName } = req.params;
  const director = movies.find(
    (movie) => movie.director.name === direcrorName
  ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('The director with this name is not found');
  }
});

// !!!!!!!!!!!!!Allow new users to Register (CREATE)
// Returns a JSON object holding data about the users to add
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
// const newUser = req.body;

// if (newUser.name) {
//   newUser.id = uuid.v4();
//   users.push(newUser);
//   res.status(201).json(newUser);
// } else {
//   res.status(400).send('Every user needs a name');
// }
// });

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

// Allow new users update their user info (UPDATE)
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
  // const { id } = req.params;
  // const updatedUser = req.body;

  // let user = users.find((user) => user.id == id);

  // if (user) {
  //   user.name = updatedUser.name;
  //   res.status(200).send(`User name was updated to ${updatedUser.name}`);
  // } else {
  //   res.status(400).send('No such user');
  // }
});

// Adds movie to favorite list (CREATE)
// Returnes a text message indicating the movie was added to user's favorite list
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

  // const { id, movieTitle } = req.params;
  // let user = users.find((user) => user.id == id);
  // if (user) {
  //   user.favoriteMovies.push(movieTitle);
  //   res
  //     .status(201)
  //     .send(`${movieTitle} has been added to ${user.name}'s favorite movies`);
  // } else {
  //   res.status(400).send('No such user');
  // }
});

// Delete movie from favorite list (DELETE)
// A text message indicating mwhether the movie was successfully removed from user's favorite list
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    // Here we use filter because we want in the object favoriteMovies only movies with titles which are not
    // equal to the title of the movie that we want to remove
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(
        `${movieTitle} has been removed from ${user.name}'s favorite movies`
      );
  } else {
    res.status(400).send(`User with ID ${id} does not exist`);
  }
});

// Allow existing users to deregister (DELETE)
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    // Here we use filter because we want in the object favoriteMovies only movies with titles which are not
    // equal to the title of the movie that we want to remove
    users = users.filter((user) => user.id != id);
    res.status(200).send(`User ${user.name} has been deleted`);
  } else {
    res.status(400).send(`User with ID ${id} does not exist`);
  }
});

// returns a JSON object containing data about your top 10 movies
// app.get('/movies', (req, res) => {
//   res.json(topMovies);
// });

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
