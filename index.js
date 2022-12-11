const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();

let topMovies = [
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppola',
    year: '1972',
  },
  {
    title: 'The Shawshank redemtion',
    director: 'Frank Darabont',
    year: '1994',
  },
  {
    title: "Schindler's list",
    director: 'Steven Spielberg',
    year: '1993',
  },
  {
    title: "One flew over the cuckoo's nest",
    director: 'Milos Forman',
    year: '1975',
  },
  {
    title: 'Forrest Gump',
    director: 'Robert Zemeckis',
    year: '1994',
  },
  {
    title: 'Forrest Gump',
    director: 'Robert Zemeckis',
    year: '1994',
  },
  {
    title: 'Star wars',
    director: 'George Lucas',
    year: '1977',
  },
  {
    title: 'The silience of the lambs',
    director: 'Jonathan Demme',
    year: '1991',
  },
  {
    title: 'The Lord of the rings: The return of the king',
    director: 'Peter Jackson',
    year: '2003',
  },
  {
    title: 'Gladiator',
    director: 'Ridley Scott',
    year: '2000',
  },
  {
    title: 'Titanic',
    director: 'James Cameron',
    year: '1997',
  },
];

// logs all request to log.txt
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

//  returns a default textual response
app.get('/', (req, res) => {
  res.send('Welcome to my movie-api app');
});
// returns a JSON object containing data about your top 10 movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});
//Returns the API documentation
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// ERROR Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong here!');
});

// listen for requests
app.listen(8080, () => {
  console.log('My app is listening on port 8080.');
});
