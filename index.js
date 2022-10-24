var app = require('./app');

var server = app.listen(9000, function() {
    console.log('Ready on port %d', server.address().port);
});