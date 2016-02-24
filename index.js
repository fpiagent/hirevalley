var Hapi = require('hapi');
var routes = require('./api/routes.js');
var Boom = require("boom");
 
var dbOpts = {
    "url": "mongodb://127.0.0.1:27017",
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};

var server = new Hapi.Server();
server.connection({ port: 3000 });

// setup swagger options
var swaggerOptions = {
    basePath: 'http://localhost:3000',
    apiVersion: '0.0.1',
    info: {
        title: 'E*nterview Buddy API'
    }
};

server.route({
    method: 'GET',
    path: '/resume/{param*}',
    handler: {
        directory: {
            path: './resume'
        }
    }
});

server.route({
    method: 'GET',
    path: '/tmp/{param*}',
    handler: {
        directory: {
            path: './tmp'
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './ui'
        }
    }
});

server.route(require('./api/routes.js'));

server.register({
    register: require('hapi-mongodb'),
    options: dbOpts
}, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }
});

// adds swagger self documentation plugin
server.register({
        register: require('hapi-swagger'), 
        options: swaggerOptions
    }, function (err) {
        if (err) {
            console.log(['error'], 'plugin "hapi-swagger" load error: ' + err) 
        }else{
            console.log(['start'], 'swagger interface loaded')

            server.start(function(){
                console.log(['start'], 'Interview Buddy' + ' - web interface: ' + server.info.uri);
            });
        }
    });
