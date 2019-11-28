/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'ROPEAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Authorizer',
    'foam.nanos.auth.User',
    'foam.nanos.rope.*',
    'java.lang.reflect.*',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.Iterator',
    'java.util.Map',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'targetDAOKey',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'authorizeByRope',
      javaType: 'boolean',
      args: [
        { name: 'x', javaType: 'X' },
        { name: 'obj', javaType: 'FObject' },
        { name: 'targetDAOKey', javaType: 'String' },
        { name: 'crudKey', javaType: 'CrudOperation' },
        { name: 'propertyKey', javaType: 'String' }
      ],
      javaCode: `    
      List<ROPE> ropes = (List<ROPE>) ((ArraySink) ((DAO) ((DAO) x.get("ropeDAO")).inX(x).where(EQ(ROPE.TARGET_DAOKEY, targetDAOKey))).select(new ArraySink())).getArray();

        for ( ROPE rope : ropes ) {
          if ( rope.check(x, obj, "", crudKey, propertyKey) ) return true;
        }
        return false; 
      `
    },
    {
      name: 'getPropertiesUpdated',
      javaType: 'List<String>',
      args: [
        { name: 'oldObj', javaType: 'FObject' },
        { name: 'obj', javaType: 'FObject' }
      ],
      documentation: `
        This function returns a list of the names of properties changed on update or set on create
      `,
      javaCode: `
        try {
          if ( oldObj == null ) oldObj = (obj.getClass()).newInstance();
        } catch ( Exception e ) {
          e.printStackTrace();
        }
        Map diff = oldObj.diff(obj);
        Iterator i = diff.keySet().iterator();
    
        List<String> propertyUpdates = new ArrayList<String>();
        while ( i.hasNext() ) {
          String propName = (String) i.next();
          propertyUpdates.add(propName);
        }
        return propertyUpdates;
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        // TODO remove after SystemAuthorizer is created
        User user = (User) x.get("user");
        if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

        List<String> propertiesUpdated = getPropertiesUpdated(null, obj);
        for ( String property : propertiesUpdated ) {
          if ( ! authorizeByRope(x, obj, getTargetDAOKey(), CrudOperation.CREATE, property ) ) {
            throw new AuthorizationException("You don't have permission to create this object");
          }
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        // TODO remove after SystemAuthorizer is created
        User user = (User) x.get("user");
        if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

        if ( ! authorizeByRope(x, obj, getTargetDAOKey(), CrudOperation.READ, "") ) throw new AuthorizationException("You don't have permission to read this object");
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        // TODO remove after SystemAuthorizer is created
        User user = (User) x.get("user");
        if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;
    
        List<String> propertiesUpdated = getPropertiesUpdated(oldObj, newObj);
        for ( String property : propertiesUpdated ) {
          if ( ! authorizeByRope(x, newObj, getTargetDAOKey(), CrudOperation.UPDATE, property ) ) {
            throw new AuthorizationException("You don't have permission to update this object");
          }
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
      // TODO remove after SystemAuthorizer is created
      User user = (User) x.get("user");
      if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return;

      if ( ! authorizeByRope(x, obj, getTargetDAOKey(), CrudOperation.DELETE, "") ) throw new AuthorizationException("You don't have permission to delete this object");
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
      User user = (User) x.get("user");
      if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return true;

      return false;
      `
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `
      User user = (User) x.get("user");
      if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return true;

      return false;
      `
    }
  ]
})