#!/usr/bin/env node
////////////////////////////////////////////////////////////
// Generates new config file based on each driver settings.
// Dumps new confil file in root_path/prey.conf.default
////////////////////////////////////////////////////////////

var path = require('path'),
    config = require('getset'),
    version = require(__dirname + '/../package').version,
    finder = require('./../lib/utils/finder');

var config_file = __dirname + '/../prey.conf.default';
// var config_header = ";;;;;\n;Prey " + version + " configuration file\n;;;;;\n";
var files = {};

var merge_data = function(type, plugin_name, results){
  var data = {};
  data[plugin_name] = results;
  config.merge_data(type, data, true);
}

finder.eachFileMatching(/default.options$/, './lib/', function(err, file, stat){

  if (err || !file || file.match(/\/dist|\/node_modules/))
    return;

  var plugin_name = path.basename(path.dirname(file));

  if (plugin_name == 'agent') // root path
    config.load(file);
  else
    files[plugin_name] = file;

}, function(){

  // sort plugin names alphabetically before appending
  var sort_method = function(a,b) { return a != 'control-panel' && a > b };

  Object.keys(files).sort(sort_method).forEach(function(plugin_name){

    var result = config.read(files[plugin_name]);
    merge_data('values', plugin_name, result.values);
    merge_data('comments', plugin_name, result.comments);

    // console.log(plugin_name + " -> " + JSON.stringify(opts));
    // config.set(plugin_name, opts, true);

  });

  config._file = config_file;
  console.log(config._values);

  config.save(function(err){
    if (err) console.log(err);
    else console.log("Config file saved in " + config_file);
  });

});
