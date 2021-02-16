
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

  constants: [
    {
      name: 'ADMIN_GROUP',
      value: 'admin',
      type: 'String'
    }
  ],
  
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
      value: '',
      includeInDigest: false
    },
    {
      class: 'String',
      name: 'url',
      value: null,
      includeInDigest: false
    },
    {
      class: 'String',
      name: 'from',
      value: null,
      includeInDigest: false
    },
    {
      class: 'String',
      name: 'displayName',
      value: null,
      includeInDigest: false
    },
    {
      class: 'String',
      name: 'replyTo',
      value: null,
      includeInDigest: false
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
      `,
      includeInDigest: false
    },
    {
      class: 'String',
      name: 'supportEmail',
      includeInDigest: false
    },
    {
      class: 'String',
      name: 'supportPhone',
      includeInDigest: false
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
      },
      includeInDigest: true
    },
    {
      documentation: `Restrict members of this group to particular IP address range.
@see https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing
List entries are of the form: 172.0.0.0/24 - this would restrict logins to the 172 network.`,
      class: 'FObjectArray',
      of: 'foam.net.CIDR',
      name: 'cidrWhiteList',
      includeInDigest: true
    },
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
    'static foam.mlang.MLang.EQ',
    'foam.nanos.app.AppConfig',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.net.InetAddress',
    'javax.security.auth.AuthPermission'
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
        AppConfig appConfig = (AppConfig) ((AppConfig) x.get("appConfig")).fclone();
        String url = ! foam.util.SafetyUtil.isEmpty(getUrl()) ? getUrl() : appConfig.getUrl();
        appConfig.setUrl(url.replaceAll("/$", ""));
        return appConfig;
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
      javaCode: `
        // if the group is the group of the user, or an ancestor of the group of the user,
        // then user should be authorized to read
        DAO localGroupDAO = (DAO) x.get("localGroupDAO");
        User user = (User) ((Subject) x.get("subject")).getUser();
        Group userGroup = (Group) localGroupDAO.find(user.getGroup());
        while ( userGroup != null ) { 
          if ( getId() == userGroup.getId() ) return;
          userGroup = getAncestor(x, userGroup);  
        }

        AuthService auth = (AuthService) x.get("auth");
        String permissionId = String.format("group.read.%s", getId());
        if ( ! auth.check(x, permissionId) ) {
          throw new AuthorizationException("You do not have permission to read this group.");
        }
      `
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
    },
    {
      name: 'validateCidrWhiteList',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaThrows: ['foam.core.ValidationException'],
      javaCode: `
      String remoteIp = foam.net.IPSupport.instance().getRemoteIp(x);
      foam.net.CIDR[] cidrs = getCidrWhiteList();
      if ( remoteIp == null ||
           cidrs == null ||
           cidrs.length == 0 ) {
        return;
      }
      for ( foam.net.CIDR cidr : cidrs ) {
        try {
          if ( cidr.inRange(x, remoteIp) ) {
            return;
          }
        } catch (java.net.UnknownHostException e) {
          ((foam.nanos.logger.Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "validateCidrWhiteList", remoteIp, e.getMessage());
        }
      }
      throw new foam.core.ValidationException("Restricted IP");
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
      message: 'Permission denied. You cannot change the parent of a group.',
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
    tableWidth: 120
  }
});
