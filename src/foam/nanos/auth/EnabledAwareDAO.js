/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'EnabledAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO that filters out disabled entries',

  methods: [
    {
      name: 'find_',
      code: function(x, obj) {
        return this.delegate.find_(x, obj).then(function(result) {
          return this.filter(x, result);
        }.bind(this));
      },
      javaCode: `
        return filter(x, getDelegate().find_(x, obj));
      `
    },
    {
      name: 'select_',
      code: function(x, sink, skip, limit, order, predicate) {
        
      },
      javaCode: `
      public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Pre
      `,
    },
    {
      name: 'enabled',
      code: function(x, obj) {
        if ( obj == null ||
             ( foam.nanos.auth.EnabledAware.isInstance(obj) &&
               ! ((foam.nanos.auth.EnabledAware)obj).isEnabled() ) ) {
          return false;
        }
        return true;
      },
      javaReturns: 'Boolean',
      javaCode: `
        Object result = getDelegate().find_(x, obj);
        if ( result == null ||
             ( result instanceof EnabledAware &&
             ! ((EnabledAware)result).isEnabled() ) ) {
          return false;
        }
        return true;
      `
    }
    {
      name: 'filter',
      code: function(x, obj, enabled) {
        return enabled ? obj : null;
      },
      args: ,
      javaReturns: 'Object',
      javaCode: `
        return enabled ? obj : null;
      `
    }
  ]
});
