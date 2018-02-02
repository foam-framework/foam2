/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: "foam.apploader",
  name: "ClassLoaderContext",
  requires: [
    "foam.classloader.OrDAO",
    "foam.apploader.ClassLoader",
    "foam.apploader.WebModelFileDAO"
  ],
  exports: [
    'classloader',
    'modelDAO'
  ],
  properties: [
    {
      class: "String",
      name: "root"
    },
    {
      name: "classloader",
      factory: function() {
        return this.ClassLoader.create();
      }
    },
    {
      name: "modelDAO",
      factory: function() {
        var dao = this.WebModelFileDAO.create({
          root: this.root
        });

        if ( this.__context__.modelDAO ) {
          dao = this.OrDAO.create({
            delegate: dao,
            primary: this.__context__.modelDAO
          });
        }

        return dao;
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
