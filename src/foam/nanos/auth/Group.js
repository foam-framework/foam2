/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Group',

  implements: [ 'foam.nanos.auth.EnabledAware' ],

  requires: [ 'foam.nanos.app.AppConfig' ],

  documentation: 'A Group of Users.',

  tableColumns: [ 'id', 'description', 'defaultMenu', 'parent' ],

  searchColumns: [ ],

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'Unique name of the Group.'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the Group.'
    },
    {
      class: 'Reference',
      name: 'parent',
      targetDAOKey: 'groupDAO',
      of: 'foam.nanos.auth.Group',
      documentation: 'Parent group to inherit permissions from.'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.Permission',
      name: 'permissions',
      documentation: 'Permissions set on group.'
    },
    {
      class: 'StringArray',
      of: 'foam.nanos.auth.Permission',
      name: 'permissions2',
      view: 'foam.u2.view.StringArrayRowView',
      documentation: 'Permissions set on group.'
    },
    {
      class: 'Reference',
      targetDAOKey: 'menuDAO',
      name: 'defaultMenu',
      documentation: 'Menu user redirects to after login.',
      of: 'foam.nanos.menu.Menu'
    },
    {
      class: 'Image',
      name: 'logo',
      documentation: 'Group logo.',
      displayWidth: 60
    },
    {
      class: 'String',
      name: 'topNavigation',
      value: 'foam.nanos.u2.navigation.TopNavigation',
      displayWidth: 45
    },
    {
      class: 'String',
      name: 'footerView',
      value: 'foam.nanos.u2.navigation.FooterView',
      displayWidth: 45
    },
    {
      class: 'String',
      name: 'groupCSS',
      view: { class: 'foam.u2.tag.TextArea', rows: 16, cols: 60 },
    },
    {
      class: 'Color',
      name: 'primaryColor',
      documentation: 'The following color properties can determine the color scheme of the GUI.'
    },
    { class: 'Color', name: 'secondaryColor' },
    { class: 'Color', name: 'accentColor' },
    { class: 'Color', name: 'tableColor' },
    { class: 'Color', name: 'tableHoverColor' },
    {
      class: 'String',
      name: 'url',
      value: null
    }
/*    {
      class: 'FObjectProperty',
      of: 'foam.nanos.app.AppConfig',
      name: 'appConfig',
      factory: function() { return this.AppConfig.create(); },
      documentation: 'Custom application configuration for group.'
    }
*/
    /*
      FUTURE
    {
      class: 'FObjectProperty',
      of: 'AuthConfig',
      documentation: 'Custom authentication settings for this group.'
    }
    */
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'org.eclipse.jetty.server.Request',
    'javax.servlet.http.HttpServletRequest'
  ],

  methods: [
    {
      name: 'implies',
      javaReturns: 'Boolean',
      args: [
        {
          name: 'permission',
          javaType: 'java.security.Permission'
        }
      ],
      javaCode: `
        if ( getPermissions() == null ) return false;
        for ( int i = 0 ; i < permissions_.length ; i++ ) {
          if ( new javax.security.auth.AuthPermission(permissions_[i].getId()).implies(permission) ) {
            return true;
          }
        }
        return false;`
      ,
      code: function(permissionId) {
        if ( this.permissions == null ) return false;

        for ( var i = 0 ; i < this.permissions.length ; i++ )
          if ( this.permissions[i].implies(permissionId) ) return true;

        return false;
      }
    },
    {
      name: 'getAppConfig',
      javaReturns: 'AppConfig',
      args: [
        {
          name: 'x',
          javaType: 'X'
        }
      ],
      javaCode: `
DAO userDAO         = (DAO) x.get("localUserDAO");
DAO groupDAO        = (DAO) x.get("groupDAO");
AppConfig config    = (AppConfig) ((AppConfig) x.get("appConfig")).fclone();

Session session = x.get(Session.class);
if ( session != null ) {
  User user = (User) userDAO.find(session.getUserId());
  if ( user != null ) {
    Group group    = (Group) groupDAO.find(user.getGroup());
    if ( ! SafetyUtil.isEmpty(group.getUrl()) ) {
      //populate AppConfig url with group url
      config.setUrl(group.getUrl());
    } else {
      //populate AppConfig url with request's RootUrl
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if (req.getRequestURI() != null) {
        config.setUrl(((Request) req).getRootURL().toString());
      }
    }
  }
}

return config;
        `
    }
  ]
});
