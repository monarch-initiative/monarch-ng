
// Create a basic Hapi.js server
var Hapi = require('hapi');
var FalcorHapi = require('falcor-hapi');
var falcorRouterFactory = require('./falcor');
var scigraphRouterFactory = require('./scigraph');
var dateFormat = require('dateformat');
var format = 'dd mmm HH:MM:ss';
var path = require('path');
var Inert = require('inert');
var Nes = require('nes');
var fs = require('fs');

// process.exit();

// Basic Hapi.js connection stuff
var serverTLS = false;
var debugServer = true;


var serverOptions = {
  connections: {
    routes: {
      cors: {
          origin: [ // '*',
            'http://127.0.0.1:4000',
            'http://localhost:4000',
            'http://0.0.0.0:4888',
            'http://0.0.0.0:4000']
      },
      files: {
        relativeTo: path.join(__dirname, '../dist')
      }
    }
  }
};

if (debugServer) {
    serverOptions.debug = {
      request: ['error'],
      log: ['error']
    };
}

var TLSOptions = null;
if (serverTLS) {
  TLSOptions = {
    key: fs.readFileSync('./security/localhost-key.pem'),
    cert: fs.readFileSync('./security/localhost-cert.pem')
  };
}

var server = new Hapi.Server(serverOptions);

server.connection({
  host: '0.0.0.0',
  port: 4888,
  labels: ['webui'],
  tls: TLSOptions
});


server.connection({
  host: '0.0.0.0',
  port: 4887,
  labels: ['stream']
});


server.connection({
  host: '0.0.0.0',
  port: 4886,
  labels: ['streamWS']
});


var webuiServer = server.select('webui');
var streamServer = server.select('stream');
var streamWSServer = server.select('streamWS');


if (debugServer) {
  webuiServer.on('log', function(event, tags) {
      if (true || tags.error) {
          console.log(tags, event);
      }
  });

  webuiServer.on('request', (request, event, tags) => {
      if (true || tags.received) {
          // console.log('New request: ' + request.id);
      }
  });

  webuiServer.on('request-internal', (request, event, tags) => {
      if (true || tags.received) {
          // console.log('New request: ' + request.id);
      }
  });

  // webuiServer.on('response', function (request) {
  //     console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
  //     console.log('Request payload:', request.payload);
  //     console.log('Response payload:', request.response.source);
  // });
}

function getHandler(request, reply) {
  var resultFile = path.join(__dirname, path.join('../dist', request.params.subpath));
  if (!fs.existsSync(resultFile)) {
    resultFile = path.join(__dirname, path.join('../dist', 'index.html'));
  }
  reply.file(resultFile);
}


var stream = null;
var counter;

function trimStreamMessage(msg) {
  return { id: msg.id,
            text: msg.text,
            user: msg.user.screen_name,
            userbg: msg.user.profile_background_image_url_https,
            created_at: msg.created_at,
            place: msg.place ? msg.place.full_name : 'Unknown',
            url: 'https://msg.com/' + msg.user.screen_name + '/status/' + msg.id_str
          };
}

// https://blog.stream.com/2014/creating-a-realtime-stream-visualization-in-3-d
function toggleStreamHandler(request, reply) {
  if (stream) {
    stream.stop();
    stream = null;
  }

  if (!stream) {
    counter = 25;
    var S = {
      on: function(msgType, msgHandler) {
        // NYI
      }
    };

    stream = S.stream('api/stream');
    stream.on('stream', function (msg) {
      // console.log('msg');
      counter = counter - 1;
      if (counter > 0) {
        // calculate sentiment with "sentiment" module
        // msg.sentiment = sentiment(msg.text);

        var trimmed = trimStreamMessage(msg);
        streamWSServer.broadcast(trimmed);
      }
      else {
        msg.stop();
        msg = null;
      }
    });
  }
}


function streamHandler(request, reply) {
  var S = {

  };

  S.get('api/stream', function(err, data, response) {
    var statuses = data.statuses;
    var trimmed = statuses.map(trimStreamMessage);
    var result = {stream: trimmed};
    reply(result).code( 200 );
  });
}

var plugins = [Inert];
var useFancyFalcorHapi = false;

if (useFancyFalcorHapi) {
  plugins.push(
    {
        register: FalcorHapi,
        options: {
          debug: true
        }
    });
}

webuiServer.register(plugins,
  function (err) {
    if (err) {
        console.error('Failed to load plugin:', err);
    }

    console.error('webuiServer.registered:', err);

    var falcorRouterInstance = falcorRouterFactory('1');
    var falcorRouteHandler = FalcorHapi.dataSourceRoute(
                              function(req, res) {
                                  return falcorRouterInstance;
                              });

    var scigraphRouterInstance = scigraphRouterFactory('GuestUser', null, function() {
      // console.log('scigraphRouterFactory completed initialization');
    });
    scigraphRouterInstance._debug = true;

    var scigraphRouteHandler = FalcorHapi.dataSourceRoute(
                            function(req, res) {
                              return scigraphRouterInstance;
                            });


    if (useFancyFalcorHapi) {
      falcorRouteHandler = {
          falcor: {
              routes: [],
              cacheRoutes: true,                                      // Whether to cache your routes, default to true
              options: {
                debug: true
              },                                 // Option to give to Falcor router
              // initialize: function() {                                // Optional initialize method
              //   console.log('#INITIALIZE');
              //   this.foo = this.req.payload.meaningoflife || 42;
              // },
              routerClass: function () {
                var result = falcorRouterFactory('1');
                result._debug = true;
                return result;
              }
          }
      };


      scigraphRouteHandler = {
          falcor: {
              routes: [],
              cacheRoutes: true,                                      // Whether to cache your routes, default to true
              options: {
                debug: true
              },                                 // Option to give to Falcor router
              // initialize: function() {                                // Optional initialize method
              //   console.log('#INITIALIZE');
              //   this.foo = this.req.payload.meaningoflife || 42;
              // },
              routerClass: function () {
                var result = scigraphRouterFactory('GuestUser', false, null, function() {
                  // console.log('scigraphRouterFactory completed initialization');
                });
                result._debug = true;
                return result;
              }
          }
      };
    }

    webuiServer.route({
        method: 'GET',
        path: '/',
        handler: {
          file: path.join(__dirname, '../dist/index.html')
        }
    });

    webuiServer.route({
        method: ['GET', 'POST'],
        path: '/status',
        handler: function (request, reply) {
          return reply('Yo!');
        }
    });

    webuiServer.route({
        method: ['GET', 'POST'],
        path: '/model.json',
        handler: falcorRouteHandler
    });

    webuiServer.route({
        method: ['GET', 'POST'],
        path: '/scigraph.json',

        handler: scigraphRouteHandler

    });

    // webuiServer.route({
    //     method: 'GET',
    //     path: '/api/stream',
    //     handler: toggleStreamHandler
    // });


    // Add a route to serve static assets (CSS, JS, IMG)
    webuiServer.route({
      method: 'GET',
      path: '/{subpath*}',
      handler: getHandler
    });
  });


streamWSServer.register([Nes], function (err) {

  streamWSServer.route({
    method: 'GET',
    path: '/h',
    config: {
      id: 'hello',
      handler: function (request, reply) {
        toggleStreamHandler(null, null, streamWSServer);
        return reply('world!');
      }
    }
  });
});


streamServer.register([], function (err) {

  streamServer.route({
    method: 'GET',
    path: '/api/stream',
    handler: streamHandler
  });

  server.start(function() {
    console.log(dateFormat(new Date(), format) + ' - webuiServer started at: ' + webuiServer.info.uri);
    console.log(dateFormat(new Date(), format) + ' - streamServer started at: ' + streamServer.info.uri);
    console.log(dateFormat(new Date(), format) + ' - streamWSServer started at: ' + streamWSServer.info.uri);

    fs.writeFileSync('./serverStarted.dat', (new Date()).toLocaleString());
  });
});

