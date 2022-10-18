import http from 'http'

const requestListener = function (req, res) {
  if (req.url === '/') {
    res.writeHead(200);
    res.end(`Hello ${process.env.ENVVAR}`);
  }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);