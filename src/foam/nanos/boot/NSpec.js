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

  tableColumns: [ 'name', 'lazy', 'serve', 'serviceClass' ],

  searchColumns: [ ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Boolean',
      name: 'lazy',
      value: true
    },
    {
      class: 'Boolean',
      name: 'serve',
      // Used by u2.view.TableView
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .call(function() {
              if ( value ) { this.style({color: 'green'}); } else { this.entity('nbsp'); }
            })
            .add(obj.serve ? ' Y' : '-')
          .end();
      },
      // Used by u2.TableView
      tableCellView: function(obj, e) {
        var e = e.E();
        if ( obj.serve ) { e.style({color: 'green'}); } else { e.entity('nbsp'); }
        e.add(obj.serve ? ' Y' : '-');
        return e;
      },
      documentation: 'If true, this service is served over the network.'
    },
    {
      class: 'String',
      name: 'serviceClass'
    },
    {
      class: 'String',
      name: 'boxClass'
    },
    {
      class: 'String',
      name: 'serviceScript'
    },
    {
      class: 'FObjectProperty',
      name: 'service',
      view: 'foam.u2.DetailView'
    }
    // TODO: permissions, keywords, lazy, parent
  ],

  methods: [
    {
      name: 'saveService',
      args: [ { name: 'service', javaType: 'Object' } ],
      javaCode: `
      System.err.println("***** saveService: " + service.getClass() + " " + (service instanceof FObject));
        if ( service instanceof FObject ) {
          setService((FObject) service);
          DAO dao = (DAO) getX().get("nSpecDAO");
          dao.put(this);
        }
      `
    },
    {
      name: 'createService',
      javaReturns: 'java.lang.Object',
      javaCode: `
        // if ( getService() != null ) return getService();

        if ( getServiceClass().length() > 0 ) {
          Object service = Class.forName(getServiceClass()).newInstance();
          saveService(service);
          return service;
        }

        Interpreter shell = new Interpreter();
        try {
          Object service = shell.eval(getServiceScript());
          saveService(service);
          return service;
        } catch (EvalError e) {
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
  ]
});
