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
    },
    'foam.nanos.script.Language'
  ],

  imports: [
    'ctrl'
  ],

  javaImports: [
    'java.io.IOException',
    'java.io.PrintStream',

    'foam.core.X',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.script.BeanShellExecutor',
    'foam.nanos.script.JShellExecutor',
    'foam.nanos.script.Language'
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
      shortName: 'd',
      width: 120
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      readPermissionRequired: true,
      writePermissionRequired: true
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
      shortName: 'a',
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
      view: 'foam.u2.view.FObjectView',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'serviceClass',
      shortName: 'sc',
      displayWidth: 80,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'boxClass',
      shortName: 'bc',
      displayWidth: 80,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.script.Language',
      name: 'language',
      value: 'BEANSHELL'
    },
    {
      class: 'Code',
      name: 'serviceScript',
      shortName: 'ss',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Code',
      name: 'client',
      shortName: 'c',
      value: '{}'
    },
    {
      class: 'String',
      name: 'documentation',
      shortName: 'doc',
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
      class: 'StringArray',
      name: 'keywords',
      shortName: 'ks'
    },
    {
      class: 'String',
      name: '_choiceText_',
      transient: true,
      javaGetter: 'return getName();',
      getter: function() { return this.name; }
    }
    // TODO: permissions, parent
  ],

  methods: [
    {
      name: 'createService',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ps', type: 'PrintStream' }
      ],
      javaType: 'java.lang.Object',
      javaCode: `
        if ( getService() != null ) return getService();

        if ( getServiceClass().length() > 0 )
          return Class.forName(getServiceClass()).newInstance();

        Language l = getLanguage();
        if ( l == foam.nanos.script.Language.JSHELL )
          return new JShellExecutor().runExecutor(x, ps, getServiceScript());
        else if ( l == foam.nanos.script.Language.BEANSHELL )
          return new BeanShellExecutor(this).execute(x, ps, getServiceScript());
        else
          throw new RuntimeException("Script language not supported");
      `,
      javaThrows: [
        'java.lang.ClassNotFoundException',
        'java.lang.InstantiationException',
        'java.lang.IllegalAccessException',
        'SecurityException',
        'NoSuchFieldException',
        'IOException',
        'Exception'
      ]
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
          this.ctrl.memento.value = 'admin.data' + foam.nanos.controller.Memento.SEPARATOR + this.name;
        }
      }
    }
  ]
});
