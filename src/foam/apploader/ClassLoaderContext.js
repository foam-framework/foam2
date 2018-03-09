/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: "foam.apploader",
  name: "ClassLoaderContext",
  requires: [
    "foam.apploader.ClassLoader",
    "foam.apploader.WebModelFileDAO"
  ],
  exports: [
    'classloader'
  ],
  properties: [
    {
      name: "classloader",
      factory: function() { return this.ClassLoader.create() },
    }
  ]
});
(function() {
  var classLoaderContext = foam.apploader.ClassLoaderContext.create(
      null, foam.__context__);
  classLoaderContext.classloader.addClassPath(global.FOAM_ROOT);
  foam.__context__ = classLoaderContext.__subContext__;

  var CLASS = foam.CLASS;
  foam.CLASS = function(m) {
    foam.__context__.classloader.latch(m);
    CLASS(m);
  };
})();
