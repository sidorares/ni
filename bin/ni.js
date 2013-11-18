#!/usr/bin/env node

var cp = require('child_process');

function spawnDebugger(cb) {
   var debugee = cp.spawn('node', ['--debug-brk', process.argv[2]]);
   var out = '';
   var searchBanner = true;
   debugee.stderr.on('data', function(data) {
     if (searchBanner) {
       out += data;
       var m = out.match(/debugger listening on port ([0-9]*)/);
       if (m) {
          searchBanner = false;
          cb(null, debugee, parseInt(m[1], 10));
       }
     }
   });
   debugee.stdout.pipe(process.stdout);
   debugee.stderr.pipe(process.stderr);
   process.stdin.pipe(debugee.stdin);
}

function spawnInspector(cb) {

var DebugServer = require('node-inspector/lib/debug-server').DebugServer,
    fs = require('fs'),
    path = require('path'),
    config = require('node-inspector/lib/config'),
    packageJson = require('node-inspector/package.json'),
    notifyParentProcess = getNotifyParentProcessFn();

console.log('Node Inspector v%s', packageJson.version);

var debugServer = new DebugServer();
debugServer.on('error', onError);
debugServer.on('listening', onListening);
debugServer.on('close', function () {
  process.exit();
});
debugServer.start(config);

function onError(err) {
  console.error(
    'Cannot start the server at %s:%s. Error: %s.',
    config.webHost || '0.0.0.0',
    config.webPort,
    err.message || err
  );

  if (err.code === 'EADDRINUSE') {
    console.error(
      'There is another process already listening at this address.\n' +
      'Run `node-inspector --web-port={port}` to use a different port.'
    );
  }

  notifyParentProcess({
    event: 'SERVER.ERROR',
    error: err
  });
}

function onListening() {
  var address = this.address();
  cb(null, address);
  
  notifyParentProcess({
    event: 'SERVER.LISTENING',
    address: address
  });
}

function getNotifyParentProcessFn() {
  if (!process.send) {
    return function(msg) {};
  }

  return function(msg) {
    process.send(msg);
  };
}

}


function start(cb) {

  spawnDebugger(debuggerReady);
  spawnInspector(inspectorReady);

  var _port, _address, _dbg;
  function debuggerReady(err, dbg, port) {
    _port = port;
    _dbg = dbg;
    startBrowser();
  }

  function inspectorReady(err, address) {
    _address = address;
    startBrowser();
  }

  function startBrowser() {
    var url;
    if (_port && _address) {
      url = _address.url;
    }
    var launcher = require('browser-launcher');
    launcher(function (err, launch) {
      var opts = {
        browser: 'chrome'
      };
      launch(url, opts, function (err, ps) {
        _dbg.on('exit', function(code) {
           // cleanup: kill browser, exit
           ps.kill('SIGKILL');
           process.exit(0);
         });
        if (err) return console.error(err);
        else
          cb(ps);
      });    
    });
  }
}


start(function() {})
