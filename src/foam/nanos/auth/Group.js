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

  searchColumns: [ 'id', 'description' ],

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
      view: {
        class: 'foam.u2.view.ReferenceView',
        placeholder: '--'
      },
      documentation: 'Parent group to inherit permissions from.'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.Permission',
      name: 'permissions',
      documentation: 'Permissions set on group.'
    },
    // {
    //   class: 'StringArray',
    //   of: 'foam.nanos.auth.Permission',
    //   name: 'permissions2',
    //   hidden: true,
    //   view: 'foam.u2.view.StringArrayRowView',
    //   documentation: 'Permissions set on group.'
    // },
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
    },
    {
      class: 'String',
      name: 'from',
      value: null
    },
    {
      class: 'String',
      name: 'displayName',
      value: null
    },
    {
      class: 'String',
      name: 'replyTo',
      value: null
    },
    {
      class: 'Long',
      name: 'softSessionLimit',
      documentation: `
        Users will be asked for providing a feedback once the soft session limit has been reached.
        If the user doesn't provide any feedback, system will force the user logout.

        The unit is milliseconds, so if you want to set the time limit to 10 mins, the value would be:
          600000 = 1000 * 60 * 10.

        Set the value to 0 to turn off this feature.
      `
    },
    {
      class: 'String',
      name: 'supportEmail'
    }
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
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'permission',
          javaType: 'java.security.Permission'
        }
      ],
      javaCode: `
        if ( getPermissions() == null ) return false;

        for ( int i = 0 ; i < permissions_.length ; i++ ) {
          foam.nanos.auth.Permission p = permissions_[i];

          if ( p.getId().startsWith("@") ) {
            DAO   dao   = (DAO) x.get("groupDAO");
            Group group = (Group) dao.find(p.getId().substring(1));

            if ( group != null && group.implies(x, permission) ) {
              return true;
            }
          } else {
            if ( new javax.security.auth.AuthPermission(p.getId()).implies(permission) ) {
              return true;
            }
          }
        }
        return false;`
      ,
      code: function(x, permissionId) {
        if ( arguments.length != 2 ) debugger;

        if ( this.permissions == null ) return false;

        for ( var i = 0 ; i < this.permissions.length ; i++ )
          if ( this.permissions[i].implies(permissionId) ) return true;

        return false;
      }
    },
    {
      name: 'getAppConfig',
      type: 'foam.nanos.app.AppConfig',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        // Find Group details, by iterating up through group.parent
        AppConfig config          = (AppConfig) ((AppConfig) x.get("appConfig")).fclone();
        String configUrl          = "";
        String configSupportEmail = "";
        Boolean urlFound          = false;
        Boolean supportEmailFound = false;
        Group group               = this;
        String grp                = "";
        DAO groupDAO              = (DAO) x.get("groupDAO");

        while ( group != null && ! (urlFound && supportEmailFound)) {
          configUrl          = urlFound ? configUrl : group.getUrl();
          configSupportEmail = supportEmailFound ? configSupportEmail : group.getSupportEmail();
      
          // Once true, stay true
          urlFound          = urlFound   ? urlFound   : ! SafetyUtil.isEmpty(configUrl);
          supportEmailFound = supportEmailFound ? supportEmailFound : ! SafetyUtil.isEmpty(configSupportEmail);

          grp   = group.getParent();
          group = (Group)groupDAO.find(grp);
        }

        // FIND URL
        if ( ! urlFound ) {
          // populate AppConfig url with request's RootUrl
          HttpServletRequest req = x.get(HttpServletRequest.class);
          if ( (req != null) && ! SafetyUtil.isEmpty(req.getRequestURI()) ) {
            configUrl = ((Request) req).getRootURL().toString();
          }
        }

        // FORCE HTTPS IN URL?
        if ( config.getForceHttps() ) {
          if ( ! configUrl.startsWith("https://") ) {
            if ( configUrl.startsWith("http://") ) {
              configUrl = "https" + configUrl.substring(4);
            } else {
              configUrl = "https://" + configUrl;
            }
          }
        }

        // SET URL
        config.setUrl(configUrl);

        // SET SupportEmail
        if ( supportEmailFound ) {
          config.setSupportEmail(configSupportEmail);
        }

        return config;
        `
    },
    {
      name: 'isDescendantOf',
      code: async function(groupId, groupDAO) {
        /**
         * Returns a promise that resolves to true if this group is a
         * descendant of the given group or false if it is not.
         */
        if ( ! groupId ) return false;
        if ( this.id === groupId || this.parent === groupId ) return true;
        var parent = await groupDAO.find(this.parent);
        if ( parent == null ) return false;
        return parent.isDescendantOf(groupId, groupDAO);
      },
      args: [
        { name: 'groupId',  type: 'String' },
        { name: 'groupDAO', type: 'foam.dao.DAO' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( SafetyUtil.isEmpty(groupId) ) return false;
        if (
          SafetyUtil.equals(this.getId(), groupId) ||
          SafetyUtil.equals(this.getParent(), groupId)
        ) return true;
        Group parent = (Group) groupDAO.find(this.getParent());
        if ( parent == null ) return false;
        return parent.isDescendantOf(groupId, groupDAO);
      `
    }
  ]
});
