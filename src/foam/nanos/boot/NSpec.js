/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'NSpec',

  requires: [
    {
      path: 'foam.comics.BrowserView',
      flags: ['web'],
    },
  ],

  javaImports: [
    'bsh.EvalError',
    'bsh.Interpreter',
    'foam.dao.DAO',
    'foam.core.FObject'
  ],

  ids: [ 'name' ],

  tableColumns: [ 'name', 'lazy', 'serve', 'authenticate', /*'serviceClass',*/ 'configure' ],

  properties: [
    {
      class: 'String',
      name: 'name',
      tableWidth: 460
    },
    {
      class: 'String',
      name: 'description',
      width: 80
    },
    {
      class: 'Boolean',
      name: 'lazy',
      tableWidth: 60,
      value: true,
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .call(function() {
              if ( value ) { this.style({color: 'green'}); }
            })
            .add(value ? ' Y' : '-')
          .end();
      },
    },
    {
      class: 'Boolean',
      name: 'serve',
      tableWidth: 50,
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .call(function() {
              if ( value ) { this.style({color: 'green'}); }
            })
            .add(value ? ' Y' : '-')
          .end();
      },
      documentation: 'If true, this service is served over the network.'
    },
    {
      class: 'Boolean',
      name: 'authenticate',
      value: true,
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .call(function() {
              if ( value ) { this.style({color: 'green'}); }
            })
            .add(value ? ' Y' : '-')
          .end();
      }
    },
    {
      class: 'Boolean',
      name: 'parameters',
      value: false,
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .call(function() {
              if ( value ) { this.style({color: 'green'}); }
            })
            .add(value ? ' Y' : '-')
          .end();
      }
    },
    {
      class: 'Boolean',
      name: 'pm',
      value: true,
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .call(function() {
              if ( value ) { this.style({color: 'green'}); }
            })
            .add(value ? ' Y' : '-')
          .end();
      }
    },
    {
      class: 'String',
      name: 'serviceClass',
      displayWidth: 80
    },
    {
      class: 'String',
      name: 'boxClass',
      displayWidth: 80
    },
    {
      class: 'String',
      name: 'serviceScript',
      view: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 80 }
    },
    {
      class: 'String',
      name: 'client',
      value: '{}',
      view: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 80 }
    },
    {
      class: 'FObjectProperty',
      name: 'service',
      view: { class: 'foam.u2.view.FObjectView' }
    }
    // TODO: permissions, keywords, lazy, parent
  ],

  methods: [
    {
      name: 'saveService',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'service', javaType: 'Object' }
      ],
      javaCode: `
      /*
        System.err.println("saveService: " + this.getName());
        if ( service instanceof FObject ) {
          setService((FObject) service);
          DAO dao = (DAO) x.get("nSpecDAO");
          dao.put(this);
        }
        */
      `
    },
    {
      name: 'createService',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'java.lang.Object',
      javaCode: `
        if ( getService() != null ) return getService();

        if ( getServiceClass().length() > 0 ) {
          Object service = Class.forName(getServiceClass()).newInstance();
          // TODO: doesn't work with DAO's, fix
          // saveService(x, service);
          return service;
        }

        Interpreter shell = new Interpreter();
        try {
          shell.set("x", x);
          Object service = shell.eval(getServiceScript());
          saveService(x, service);
          return service;
        } catch (EvalError e) {
          System.err.println("NSpec serviceScript error: " + getServiceScript());
          e.printStackTrace();
        }

        return null;
      `,
      javaThrows: [
        'java.lang.ClassNotFoundException',
        'java.lang.InstantiationException',
        'java.lang.IllegalAccessException'
      ],
    }
  ],

  actions: [
    {
      // Let user configure this service. Is hard-coded to work with DAO's
      // for now, but should get the config object from the NSpec itself
      // to be extensible.
      name: 'configure',
      isAvailable: function(boxClass) {
        return ! boxClass;
//        return foam.dao.DAO.isInstance(this.__context__[this.name]);
      },
      code: function() {
        var service = this.__context__[this.name];
        if ( foam.dao.DAO.isInstance(service) ) {
          this.__context__.stack.push({
            class: 'foam.comics.BrowserView',
            data: service
          });
        }
      }
    }
  ]
});
