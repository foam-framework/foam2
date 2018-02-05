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
      class: 'String',
      name: 'root'
    },
    {
      name: "classloader",
      factory: function() {
        return this.ClassLoader.create({
          modelDAO: this.WebModelFileDAO.create({
            root: this.root
          })
        });
      }
    }
  ]
});
(function() {
  foam.__context__ = foam.apploader.ClassLoaderContext.create({
    root: global.FOAM_ROOT
  }, foam.__context__).__subContext__;

  var CLASS = foam.CLASS;
  foam.CLASS = function(m) {
    foam.__context__.classloader.latch(m);
    CLASS(m);
  };
})();
