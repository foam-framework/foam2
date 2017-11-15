/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'NSpec',

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
      view: 'foam.u2.view.FObjectView'
    }
    // TODO: permissions, keywords, lazy, parent
  ],

  methods: [
    {
      name: 'saveService',
      args: [ { name: 'service', javaType: 'Object' } ],
      javaCode: `
        System.err.println("saveService: " + this.getName());
        if ( service instanceof FObject ) {
          setService((FObject) service);
          DAO dao = (DAO) getX().get("nSpecDAO");
          dao.put(this);
        }
      `
    },
    {
      name: 'createService',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'java.lang.Object',
      javaCode: `
        if ( getService() != null ) return getService();

        if ( getServiceClass().length() > 0 ) {
          Object service = Class.forName(getServiceClass()).newInstance();
          // TODO: doesn't work with DAO's, fix
          // saveService(service);
          return service;
        }

        Interpreter shell = new Interpreter();
        try {
          shell.set("x", x);
          Object service = shell.eval(getServiceScript());
          saveService(service);
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
      name: 'configure',
      code: function() {
        console.log('foo');
      }
    }
  ]
});
