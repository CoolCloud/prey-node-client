var fs     = require('fs'),
    path   = require('path'),
    common = require('./../common'),
    rmdir  = require('./../utils/rmdir'),
    cp_r   = require('./../utils/cp').cp_r,
    paths  = common.system.paths,
    versions_list;

var versions = module.exports;

/**
 * @summary Returns latest version in versions dir
 */
versions.latest = function(){
  var list = this.list();
  return list[0];
}

/**
 * @summary Returns version where this is being executed
 */
versions.this = function(){
  return common.version;
}

/**
 * @summary Returns current symlinked version
 */
versions.current = function(){
  try {
    var json = require(path.join(paths.current, 'package.json'));
    return json.version;
    // return path.join(paths.install, relative_path);
  } catch(e) {
    console.log(e.message);
    // console.log(paths.current + ' not found.');
  }
}

/**
 * @summary Returns list of all versions
 */
versions.list = function(cb){
  if (versions_list) return versions_list;

  try {

    var list = fs.readdirSync(paths.versions);
    var sorted = list.sort(function(a, b){
      return parseFloat(a.replace('.', '')) < parseFloat(b.replace('.', '')) }
    );

    versions_list = sorted;
  } catch (e) {
    console.log(paths.versions + ' does not exist.');
  }

  return versions_list;
}

/**
 * @param   {String}    version
 * @param   {Callback}  cb
 *
 * @summary Sets the symlink to the current version
 *          provided that versions are supported.
 */
versions.set_current = function (version, cb) {
  if (!paths.versions)
    return cb();

  if (version == 'latest')
    version = versions.latest();
  else if (version == 'this')
    version = versions.this();

  if (versions.current() == version)
    return cb(new Error('Version ' + version + ' is already set as current.'));

  var full_path = get_version_path(version);

  var symlink = can_symlink() ? fs.symlink : duplicate;

  fs.exists(full_path, function(exists){
    if (!exists) return cb(new Error('Path not found: ' + full_path));
    // symlink
    versions.unset_current(function(err){
      if (err && err.code != 'ENOENT') return cb(err);
      symlink(full_path, paths.current, 'junction', cb);
    })
  });
}

/**
 * @param   {Callback}  cb
 *
 * @summary Unsets the symlink to the current version
 */
versions.unset_current = function(cb){
  if (!paths.current) return cb();
  var unlink = can_symlink() ? fs.unlink : rmdir;
  unlink(paths.current, cb);
}

/**
 * @param   {String}    version
 * @param   {Callback}  cb
 *
 * @summary Removes version
 */
versions.remove = function(version, cb){
  if (!version || version == '')
    return cb(new Error('Version not set'))

  console.log('Removing version ' + version + '...');
  rmdir(get_version_path(version), cb);
}

////////////////////////////////////////////////
// module private functions
////////////////////////////////////////////////

function get_version_path (version) {
  return path.join(paths.versions, version);
}

function duplicate (src, dest, opts, cb) {
  cp_r(src, dest, cb);
}

function can_symlink () {
  try {
    fs.symlinkSync();
    return true;
  } catch(e) {
    return e.code != 'ENOSYS';
  }
}
