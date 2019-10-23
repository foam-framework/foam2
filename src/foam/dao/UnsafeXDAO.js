/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'UnsafeXDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'nspecName',
      class: 'String'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      javaFactory: `
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new foam.nanos.logger.StdoutLogger();
        }
        return logger;
      `
    },
    {
      name: 'xIsSet',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'inX',
      javaCode: `
      this.setXIsSet(true);
      ProxyDAO proxy = new ProxyDAO.Builder(x).setDelegate(this).build();
      this.setXIsSet(false);
      return proxy;
      `
    },
    {
      name: 'find',
      javaCode: `
      if ( ! getXIsSet() ) getLogger().warning("Unsafe access : " + getNspecName() + ".find().  Please use context-oriented calls instead.");
      return getDelegate().find(id);
      `
    },
    {
      name: 'put',
      javaCode: `
      if ( ! getXIsSet() ) getLogger().warning("Unsafe access : " + getNspecName() + ".put(). Please use context-oriented calls instead.");
      return getDelegate().put(obj);
      `
    },
    {
      name: 'select',
      javaCode: `
      if ( ! getXIsSet() ) getLogger().warning("Unsafe access : " + getNspecName() + ".select(). Please use context-oriented calls instead.");
      return getDelegate().select(sink);
      `
    },
    {
      name: 'remove',
      javaCode: `
      if ( ! getXIsSet() ) getLogger().warning("Unsafe access : " + getNspecName() + ".remove(). Please use context-oriented calls instead.");
      return getDelegate().remove(obj);
      `
    },
    {
      name: 'removeAll',
      javaCode: `
      if ( ! getXIsSet() ) getLogger().warning("Unsafe access : " + getNspecName() + ".removeAll(). Please use context-oriented calls instead.");
      getDelegate().removeAll();
      `
    },
    {
      name: 'listen',
      javaCode: `
      if ( ! getXIsSet() ) getLogger().warning("Unsafe access : " + getNspecName() + ".listen(). Please use context-oriented calls instead.");
      getDelegate().listen(sink, predicate);
      `
    },
    {
      name: 'pipe',
      javaCode: `
      if ( ! getXIsSet() ) getLogger().warning("Unsafe access : " + getNspecName() + ".pipe(). Please use context-oriented calls instead.");
      getDelegate().pipe(sink);
      `
    },
    {
      name: 'cmd',
      javaCode: `
      if ( ! getXIsSet() ) getLogger().warning("Unsafe access to : " + getNspecName() + ".cmd(). Please use context-oriented calls instead.");
      return getDelegate().cmd(obj);
      `
    }
  ]
});
