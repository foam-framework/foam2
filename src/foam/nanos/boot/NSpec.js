/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'NSpec',

  javaImplements: [
    'foam.nanos.auth.EnabledAware'
  ],

  requires: [
    {
      path: 'foam.comics.BrowserView',
      flags: ['web']
    }
  ],

  javaImports: [
    'bsh.EvalError',
    'bsh.Interpreter',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService'
  ],

  ids: [ 'name' ],

  tableColumns: [ 'name', 'lazy', 'serve', 'authenticate', /*'serviceClass',*/ 'configure' ],

  properties: [
    {
      class: 'String',
      name: 'name',
      displayWidth: '60',
      tableWidth: 460
    },
    {
      class: 'String',
      name: 'description',
      width: 120
    },
    {
      class: 'Boolean',
      name: 'lazy',
      tableWidth: 65,
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
      name: 'serve',
      tableWidth: 72,
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
      class: 'FObjectProperty',
      name: 'service',
      view: 'foam.u2.DetailView',
      // Why was this set to be a SectionedDetailView? Put back to DetailView. KGR
      //      view: { class: 'foam.u2.detail.SectionedDetailView' },
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'serviceClass',
      displayWidth: 80,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'boxClass',
      displayWidth: 80,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Code',
      name: 'serviceScript',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Code',
      name: 'client',
      value: '{}'
    },
    {
      class: 'String',
      name: 'documentation',
      view: {
        class: 'foam.u2.view.ModeAltView',
        writeView: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 140 },
        readView: { class: 'foam.u2.view.PreView' }
      },
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'authNotes',
      view: {
        class: 'foam.u2.view.ModeAltView',
        writeView: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 140 },
        readView: { class: 'foam.u2.view.PreView' }
      },
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
          class: 'StringArray',
          name: 'keywords'
    },
    {
      class: 'String',
      name: '_choiceText_',
      transient: true,
      javaGetter: 'return getName();',
      getter: function() { return this.name; }
    }
    // TODO: permissions, lazy, parent
  ],

  methods: [
    {
      name: 'saveService',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'service', type: 'Any' }
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
        { name: 'x', type: 'Context' }
      ],
      javaType: 'java.lang.Object',
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
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          if ( logger != null ) {
            logger.error("NSpec serviceScript error", getServiceScript(), e);
          } else {
            System.err.println("NSpec serviceScript error: " + getServiceScript());
            e.printStackTrace();
          }
        }

        return null;
      `,
      javaThrows: [
        'java.lang.ClassNotFoundException',
        'java.lang.InstantiationException',
        'java.lang.IllegalAccessException'
      ],
    },
    {
      name: 'checkAuthorization',
      type: 'Void',
      documentation: `
        Given a user's session context, throw an exception if the user doesn't
        have permission to access this service.
      `,
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        if ( ! getAuthenticate() ) return;

        AuthService auth = (AuthService) x.get("auth");

        if ( ! auth.check(x, "service." + getName()) ) {
          throw new AuthorizationException(String.format("You do not have permission to access the service named '%s'.", getName()));
        }
      `
    }
  ],

  actions: [
    {
      // Let user configure this service. Is hard-coded to work with DAO's
      // for now, but should get the config object from the NSpec itself
      // to be extensible.
      name: 'configure',
      isAvailable: function(boxClass, serve) {
        return serve && ! boxClass;
//        return foam.dao.DAO.isInstance(this.__context__[this.name]);
      },
      code: function() {
        var service = this.__context__[this.name];
        if ( foam.dao.DAO.isInstance(service) ) {
          this.__context__.stack.push({
            class: 'foam.comics.BrowserView',
            createEnabled: true,
            editEnabled: true,
            exportEnabled: true,
            data: service
          });
        }
      }
    }
  ]
});
