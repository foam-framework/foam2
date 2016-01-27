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
