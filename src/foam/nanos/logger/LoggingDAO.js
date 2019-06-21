/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LoggingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Log all DAO operations. Can decorate both a client js DAO and server java DAO.`,

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.boot.NSpecAware'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'myLogger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      hidden: true
    },
    {
      name: 'consoleLogger',
      expression: function(nSpec) {
        return console.log.bind(console, nSpec ? nSpec.name : 'Unknown service');
      }
    },
  ],

  methods: [
    {
      name: 'getLogger',
      javaType: 'foam.nanos.logger.Logger',
      javaCode: `
        Logger logger = this.getMyLogger();
        if ( logger != null ) {
          return logger;
        }
        logger = (Logger) getX().get("logger");
        if ( logger != null ) {
          logger = new PrefixLogger(new Object[] {this.getNSpec().getName()}, logger);
          this.setMyLogger(logger);
        } else {
          return NullLogger.instance();
        }
        return logger;
      `
    },
    {
      name: 'find_',
      code: function (x, id) {
        if ( this.enabled ) {
          this.consoleLogger('find', id);
        }
        return this.SUPER(x, id);
        },
      javaCode: `
        if ( this.getEnabled() ) {
          this.getLogger().info("find", id);
        }
        return this.getDelegate().find_(x, id);
      `
    },
    {
      name: 'put_',
      code: function (x, obj) {
        if ( this.enabled ) {
          this.consoleLogger('put', obj);
        }
        return this.SUPER(x, obj);
      },
      javaCode: `
        if ( this.getEnabled() ) {
          this.getLogger().info("put", obj);
        }
        return this.getDelegate().put_(x, obj);
      `
    },
    {
      name: 'remove_',
      code: function (x, obj) {
        if ( this.enabled ) {
          this.consoleLogger('remove', obj);
        }
        return this.SUPER(x, obj);
      },
      javaCode: `
        if ( this.getEnabled() ) {
          this.getLogger().info("remove", obj);
        }
        return this.getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      code: function (x, skip, limit, order, predicate) {
        if ( this.enabled ) {
          this.consoleLogger('removeAll', skip, limit, order, predicate);
        }
        return this.SUPER(x, skip, limit, order, predicate);
      },
      javaCode: `
        if ( this.getEnabled() ) {
          this.getLogger().info("removeAll");
        }
        this.getDelegate().removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'select_',
      code: function (x, sink, skip, limit, order, predicate) {
        if ( this.enabled ) {
          this.consoleLogger('select',
                             'skip', skip,
                             'limit', limit,
                             'order', order && order.toString(),
                             'predicate', predicate && predicate.toString());
          sink = sink || this.ArraySink.create();
          if ( this.logReads ) {
            var put = sink.put.bind(sink);
            var newSink = { __proto__: sink };
            newSink.put = function(o) {
              this.consoleLogger('read', foam.json.objectify(o));
              return put.apply(null, arguments);
            }.bind(this);
            return this.SUPER(x, newSink, skip, limit, order, predicate).then(function() {
              return sink;
            });
          }
        }
        return this.SUPER(x, sink, skip, limit, order, predicate);
      },
      javaCode: `
        if ( this.getEnabled() ) {
          this.getLogger().info("select", sink, skip, limit, order, predicate);
        }
        return this.getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'cmd_',
      code: function (x, obj) {
        if ( this.enabled ) {
          this.consoleLogger('cmd', obj);
        }
        return this.SUPER(x, obj);
      },
      javaCode: `
        if ( this.getEnabled() ) {
          this.getLogger().info("cmd", obj);
        }
        return this.getDelegate().cmd_(x, obj);
      `
    }
  ]
});
