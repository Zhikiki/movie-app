const http = require('http');
const url = require('url');
const fs = require('fs');

http
  .createServer((request, response) => {
    let address = request.url;
    let q = url.parse(address, true);
    let filePath = '';

    fs.appendFile(
      'log.txt',
      'URL: ' + address + '\nTimestamp: ' + new Date() + '\n\n',
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Added to log.');
        }
      }
    );

    if (q.pathname.includes('document')) {
      filePath = __dirname + '/documentation.html';
    } else {
      filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
      }
    });
  })
  .listen(8080);

console.log('My first Node test server is running on Port 8080.');
