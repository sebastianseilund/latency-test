var http = require('http');

var server = http.createServer();
server.on('request', function(req, res) {
    console.log('Request', req.url);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('OK');
    res.end();
});
server.listen(8012, function() {
    console.log('Listening');
});