
/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Group',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.EnabledAware'
  ],

  requires: [ 
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.PasswordPolicy'
  ],

  documentation: 'A Group of Users.',

  tableColumns: [ 'id', 'description', 'defaultMenu.id', 'parent.id' ],

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
      class: 'Reference',
      targetDAOKey: 'menuDAO',
      name: 'defaultMenu',
      documentation: 'Menu user redirects to after login.',
      of: 'foam.nanos.menu.Menu'
    },
    {
      class: 'Reference',
      targetDAOKey: 'menuDAO',
      of: 'foam.nanos.menu.Menu',
      name: 'rootMenu',
      value: ''
    },
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
    },
    {
      class: 'String',
      name: 'supportPhone'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.PasswordPolicy',
      name: 'passwordPolicy',
      documentation: 'Password policy for this group.',
      factory: function() {
        return this.PasswordPolicy.create();
      },
      javaFactory: `
        return new foam.nanos.auth.PasswordPolicy();
      `,
      view: {
        class: 'foam.u2.view.FObjectPropertyView',
        readView: { class: 'foam.u2.detail.VerticalDetailView' }
      }
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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.util.SafetyUtil',
    'org.eclipse.jetty.server.Request',
    'javax.security.auth.AuthPermission',
    'javax.servlet.http.HttpServletRequest',
    'java.util.List',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'implies',
      type: 'Boolean',
      async: true,
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
        List<GroupPermissionJunction> junctions = ((ArraySink) getPermissions(x)
          .getJunctionDAO()
            .where(EQ(GroupPermissionJunction.SOURCE_ID, getId()))
            .select(new ArraySink())).getArray();

        for ( GroupPermissionJunction j : junctions ) {
          if ( j.getTargetId().isBlank() ) {
            continue;
          }

          if ( j.getTargetId().startsWith("@") ) {
            DAO   dao   = (DAO) x.get("groupDAO");
            Group group = (Group) dao.find(j.getTargetId().substring(1));

            if ( group != null && group.implies(x, permission) ) {
              return true;
            }
          } else if ( new AuthPermission(j.getTargetId()).implies(permission) ) {
            return true;
          }
        }

        return false;
      `,
      code: async function(x, permissionId) {
        // TODO: Support inheritance via @
        var arraySink = await this.permissions.junctionDAO
          .where(foam.mlang.Expressions.EQ(foam.nanos.auth.GroupPermissionJunction.SOURCE_ID, this.id))
          .select();
        var junctions = arraySink != null && Array.isArray(arraySink.array)
          ? arraySink.array
          : [];
        return junctions.some((j) => foam.nanos.auth.Permission.create({ id: j.targetId }).implies(permissionId));
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
        Group group               = this;
        DAO groupDAO              = (DAO) x.get("groupDAO");

        String configUrl           = "";

        // Get support info and url off group or parents.
        while ( group != null ) {
          configUrl = ! SafetyUtil.isEmpty(group.getUrl()) && SafetyUtil.isEmpty(configUrl) ?
              group.getUrl() : configUrl;

          if ( ! SafetyUtil.isEmpty(group.getUrl()) && ! SafetyUtil.isEmpty(configUrl) ) break;
          group = (Group) groupDAO.find(group.getParent());
        }

        AppConfig config = (AppConfig) x.get("appConfig");
        return config.configure(x, configUrl);
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
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        String permissionId = String.format("group.create.%s", getId());

        if ( ! auth.check(x, permissionId) ) {
          throw new AuthorizationException("You do not have permission to create this group.");
        }

        // Prevents privilege escalation via setting a group's parent.
        checkUserHasAllPermissionsInGroupAndAncestors(x, this);
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: '// NOOP'
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        String permissionId = String.format("group.update.%s", getId());

        if ( ! auth.check(x, permissionId) ) {
          throw new AuthorizationException("You don't have permission to update that group.");
        }

        // Prevents privilege escalation via setting a group's parent.
        if ( getParent() != null &&
             ! getParent().equals(((Group) oldObj).getParent()) ) {
          checkUserHasAllPermissionsInGroupAndAncestors(x, this);
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        String permissionId = String.format("group.remove.%s", getId());

        if ( ! auth.check(x, permissionId) ) {
          throw new AuthorizationException("You don't have permission to delete that group.");
        }
      `
    },
    {
      name: 'checkUserHasAllPermissionsInGroupAndAncestors',
      type: 'Void',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'group', type: 'foam.nanos.auth.Group' }
      ],
      javaCode: `
        do {
          checkUserHasAllPermissionsInGroup(x, group);
          group = getAncestor(x, group);
        } while ( group != null );
      `
    },
    {
      name: 'checkUserHasAllPermissionsInGroup',
      type: 'Void',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'group', type: 'foam.nanos.auth.Group' }
      ],
      javaCode: `
        group.getPermissions(x).getJunctionDAO().where(EQ(GroupPermissionJunction.SOURCE_ID, group.getId())).select(new CheckPermissionsSink(x));
      `
    },
    {
      name: 'getAncestor',
      type: 'Group',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'group', type: 'foam.nanos.auth.Group' }
      ],
      javaCode: `
        String ancestorGroupId = group.getParent();

        if ( SafetyUtil.isEmpty(ancestorGroupId) ) return null;

        DAO localGroupDAO = ((DAO) x.get("localGroupDAO")).inX(x);
        Group ancestor = (Group) localGroupDAO.inX(x).find(ancestorGroupId);

        if ( ancestor == null ) {
          throw new RuntimeException("The '" + group.getId() + "' group has a null ancestor named '" + ancestorGroupId + "'.");
        }

        return ancestor;
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CheckPermissionsSink',
  extends: 'foam.dao.AbstractSink',

  documentation: `
    This sink will make sure that the user in the context it's initialized in
    has the permission referenced by each GroupPermissionJunction passed into
    it.
  `,

  imports: [
    'AuthService auth'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService'
  ],

  messages: [
    {
      name: 'ERROR_MESSAGE',
      message: 'Permission denied. You cannot change the parent of a group if doing so grants that group permissions that you do not have.',
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        DAO groupDAO = (DAO) getX().get("groupDAO");
        AuthService auth = (AuthService) getAuth();
        GroupPermissionJunction junction = (GroupPermissionJunction) obj;
        String permissionId = junction.getTargetId();

        // If a permission starts with the @ symbol, then it inherits from
        // another group. For example, a permission with the id "@admin" will
        // inherit all of the permissions of the group with id "admin".
        if ( permissionId.startsWith("@") ) {
          String groupId = permissionId.substring(1);
          Group group = (Group) groupDAO.inX(getX()).find(groupId);
          group.checkUserHasAllPermissionsInGroupAndAncestors(getX(), group);
        } else if ( ! auth.check(getX(), permissionId) ) {
          throw new AuthorizationException(ERROR_MESSAGE);
        }
      `
    }
  ]
});


foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.theme.Theme',
  targetModel: 'foam.nanos.auth.Group',
  forwardName: 'groups',
  inverseName: 'theme',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    hidden: false,
    tableWidth: 120,
    section: 'administrative'
  }
});
