var GLOBAL = global || this;

/**
 * The global conteXt object.
 */
GLOBAL.X = Object.create(GLOBAL);

/**
 * Create a sub-context, optionally copying opt_args into it.
 */
GLOBAL.X.sub = function(opt_args) {
  var Y = Object.create(this);
  if (!opt_args) return Y;
  for (var key in opt_args) {
    if (opt_args.hasOwnProperty(key)) Y[key] = opt_args[key];
  }
  return Y;
};

GLOBAL.X.verifyPackagePath_ = function(pathParts) {
  var i;
  for (i = 0; i < pathParts.length; i++) {
    if (!pathParts[i])
      throw new Error('Invalid package path: "' + pathParts.join('.') + '"');
  }
};

/**
 * Set a package-path value on the context.
 */
GLOBAL.X.set = function(path, value) {
  var parts = path.split('.');
  var obj = this;

  this.verifyPackagePath_(parts);

  // Set path, initializing objects as needed.
  for (var i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  return (obj[parts[parts.length - 1]] = value);
};

/**
 * Lookup a package-path value on the context.
 */
GLOBAL.X.lookup = function(path) {
  var parts = path.split('.');

  this.verifyPackagePath_(parts);

  var obj = this;
  for (var i = 0; i < parts.length; i++) {
    if (!obj) return obj;
    obj = obj[parts[i]];
  }
  return obj;
};
