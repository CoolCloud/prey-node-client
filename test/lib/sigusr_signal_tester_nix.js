#!/usr/bin/env node

/**
 * TEST LIBRARY
 *
 * Prey Client
 *
 * Script to test what happens when the SIGUSR signal is received,
 *  and the client has lost its internet connection.
 *
 */

// File executable dependencies
var path    = require('path'),
    sandbox = require('sandboxed-module');
// Injection variables
var program       = require('commander');

var common_prime  =
  sandbox.require(path.resolve(__dirname, '..', '..', 'lib', 'common'), {
  requires : {
    'commander'               : program
  }
});
var common        =
  sandbox.require(path.resolve(__dirname, '..', '..', 'lib', 'agent','common'), {
    requires : {
      './../common'           : common_prime
    }
});

var agent          = sandbox.require(path.resolve(__dirname, '..', '..', 'lib', 'agent', 'index'), {
  requires : {
    './common' : common
  }
});
agent.engage = function (command) {
  // We just leave, since we reached the purpose of this test
  process.exit(34)
}
agent.run    = function () { var t = setTimeout
  // Let's put this ridiculous long interval
  var t = setTimeout(function () { 
    console.log('-- (' + process.argv[2] + ') Running cli - END');
    }, 100000);
}

var pidfile   = {};
pidfile.store = function (pidfile, cb) {
  if (process.argv[2] === 'alpha') {
    return cb();
  } else {
    var running         = {};
    running.stat        = {};
    running.stat.ctime  = new Date(Date.now() - (121 * 1000));
    running.pid         = process.argv[3];
    return cb(null, running);
  }
}

var cli = sandbox.require(path.resolve(__dirname, '..', '..', 'lib', 'agent', 'cli_controller'), {
  requires : {
    './common'          : common,
    './'                : agent,
    '../utils/pidfile'  : pidfile
  }
});
