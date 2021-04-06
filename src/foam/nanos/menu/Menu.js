/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'Menu',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.EnabledAware'
  ],

  tableColumns: [
    'enabled',
    'id',
    'parent.id',
    'label',
    'order'
  ],

  imports: [
    'lastMenuLaunchedListener?'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 280
    },
    {
      class: 'String',
      name: 'label',
      documentation: 'Menu label.'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      tableWidth: 80
    },
    {
      class: 'JSFObject',
      name: 'handler',
      documentation: 'View initialized when menu is launched.',
      view: {
        class: 'foam.u2.view.FObjectView',
        allowCustom: true,
        choices: [
          [ 'foam.nanos.menu.DAOMenu',          'DAO' ],
          [ 'foam.nanos.menu.DAOMenu2',         'DAO2' ],
          [ 'foam.nanos.menu.DocumentMenu',     'Document' ],
          [ 'foam.nanos.menu.DocumentFileMenu', 'External Document' ],
          [ 'foam.nanos.menu.LinkMenu',         'Link' ],
          [ 'foam.nanos.menu.ListMenu',         'List' ],
          [ 'foam.nanos.menu.SubMenu',          'Submenu' ],
          [ 'foam.nanos.menu.TabsMenu',         'Tabs' ],
          [ 'foam.nanos.menu.ViewMenu',         'View' ]
        ]
      }
    },
    {
      class: 'Int',
      name: 'order',
      documentation: 'Used to order the menu list.',
      tableWidth: 80,
      value: 1000
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Menu item explaination.',
      displayWidth: 80
    },
    {
      class: 'String',
      name: 'icon',
      documentation: 'Icon associated to the menu item.',
      displayWidth: 80
    },
    {
      class: 'String',
      name: 'activeIcon',
      documentation: 'Active icon associated to the menu item.',
      displayWidth: 80
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'border',
      factory: function() { return { class: 'foam.u2.borders.NullBorder' }; }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.menu.XRegistration',
      name: 'registrations'
    },
    {
      documentation: 'Predicate providing arbitrary checks, in addition to the regular menu auth checks.',
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'readPredicate',
      view: {
        class: 'foam.u2.view.JSONTextView'
      },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
    },
    {
      class: 'StringArray',
      name: 'keywords'
    }
  ],

  methods: [
    function launch_(X, e) {
      // Create a sub-context with per-menu X.register()-ations.
      var subX = X.createSubContext({});
      for ( var i = 0 ; i < this.registrations.length ; i++ ) {
        var r = this.registrations[i];
        subX.register(X.lookup(r.className), r.targetName);
      }

      this.lastMenuLaunchedListener && this.lastMenuLaunchedListener(this);
      this.handler && this.handler.launch(subX, this, e);
    },
    {
      documentation: 'Desire to call read predicate with calling context but predicate may also need access to this menu; add the current menu as context key MENU',
      name: 'f',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        return getReadPredicate().f(
          x.put("MENU", this)
        );
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "menu.create") ) {
          throw new AuthorizationException("You do not have permission to create menus.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "menu.update." + getId()) ) {
          throw new AuthorizationException("You do not have permission to update this menu.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "menu.remove." + getId()) ) {
          throw new AuthorizationException("You do not have permission to delete menus.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! ( f(x) &&
                 auth.check(x, "menu.read." + getId()) ) ) {
          throw new AuthorizationException("You do not have permission to read this menu.");
        }
      `
    }
  ],

  actions: [
    {
      name: 'launch',
      code: function(X, e) {
        this.launch_(X, e);
      }
    }
  ]
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.menu.Menu',
  targetModel: 'foam.nanos.menu.Menu',
  forwardName: 'children',
  inverseName: 'parent',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    class: 'String',
    value: '',
    view: {
      class: 'foam.u2.view.ReferenceView',
      placeholder: '--'
    }
  }
});
