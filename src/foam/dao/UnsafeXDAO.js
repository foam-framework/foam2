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
  ],

  methods: [
    {
      name: 'find',
      javaCode: `
      getLogger().warning("Unsafe access : " + getNspecName() + ".find().  Please use context-oriented calls instead.");
      return getDelegate().find(id);
      `
    },
    {
      name: 'put',
      javaCode: `
      getLogger().warning("Unsafe access : " + getNspecName() + ".put(). Please use context-oriented calls instead.");
      return getDelegate().put(obj);
      `
    },
    {
      name: 'select',
      javaCode: `
      getLogger().warning("Unsafe access : " + getNspecName() + ".select(). Please use context-oriented calls instead.");
      return getDelegate().select(sink);
      `
    },
    {
      name: 'remove',
      javaCode: `
      getLogger().warning("Unsafe access : " + getNspecName() + ".remove(). Please use context-oriented calls instead.");
      return getDelegate().remove(obj);
      `
    },
    {
      name: 'removeAll',
      javaCode: `
      getLogger().warning("Unsafe access : " + getNspecName() + ".removeAll(). Please use context-oriented calls instead.");
      getDelegate().removeAll();
      `
    },
    {
      name: 'listen',
      javaCode: `
      getLogger().warning("Unsafe access : " + getNspecName() + ".listen(). Please use context-oriented calls instead.");
      getDelegate().listen(sink, predicate);
      `
    },
    {
      name: 'pipe',
      javaCode: `
      getLogger().warning("Unsafe access : " + getNspecName() + ".pipe(). Please use context-oriented calls instead.");
      getDelegate().pipe(sink);
      `
    },
    {
      name: 'cmd',
      javaCode: `
      getLogger().warning("Unsafe access to : " + getNspecName() + ".cmd(). Please use context-oriented calls instead.");
      return getDelegate().cmd(obj);
      `
    }
  ]
});
