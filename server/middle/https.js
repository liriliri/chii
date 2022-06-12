const https = require('https');
const fs = require('fs');

module.exports = function (app, port, host, ssl) {
  const key = ssl[0]
  const cert = ssl[1]
  const options = {
    key: fs.readFileSync(key, 'utf8'),
    cert: fs.readFileSync(cert, 'utf8')
    };
  const server =  https.createServer(options,app.callback()).listen(port,host);
  return server
}