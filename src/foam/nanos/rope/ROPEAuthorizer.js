/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'ROPEAuthorizer',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Authorizer',
    'foam.nanos.auth.User',
    'foam.nanos.rope.ROPE',
    'foam.nanos.rope.ROPEActions',
    'java.lang.reflect.*',
    'java.util.ArrayList',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'user',
      class: 'Object',
      javaType: 'User'
    },
    {
      name: 'ropeDAO',
      class: 'Object',
      javaType: 'DAO'
    },
    {
      name: 'targetDAOKey',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'getTargetRopes',
      type: 'Object',
      documentation:'retrieves the required ropes relating the source model to the target model to be used by the algorithm',
      javaType: 'List<ROPE>',
      args: [
        {
          name: 'obj',
          class: 'Object',
          javaType: 'FObject'
        },
        {
          name: 'targetDAOKey',
          class: 'String'
        }
      ],
      javaCode: `
        if ( obj instanceof User )
        return (List<ROPE>) ((ArraySink) getRopeDAO()
          .where(AND(
              EQ(ROPE.TARGET_MODEL, obj.getClassInfo()),
              EQ(ROPE.SOURCE_MODEL, User.getOwnClassInfo()),
              EQ(ROPE.TARGET_DAOKEY, targetDAOKey)
          )) 
          .select(new ArraySink()))
          .getArray();
      else 
        return (List<ROPE>) ((ArraySink) getRopeDAO()
          .where(AND(
            EQ(ROPE.TARGET_MODEL, obj.getClassInfo()),
            EQ(ROPE.TARGET_DAOKEY, targetDAOKey)
          )) 
          .select(new ArraySink()))
          .getArray();
      `
    },
    {
      name: 'retrieveProperty',
      type: 'Object',
      documentation: 'Method used for needed dynamic typing within the rope code using java reflection',
      javaType: '<T> T',
      args: [
        {
          name: 'obj',
          class: 'Object',
          javaType: 'FObject'
        },
        {
          name: 'prefix',
          class: 'String'
        },
        {
          name: 'propertyName',
          class: 'String'
        }
      ],
      javaCode: `
        Method method;
        try {
          method = obj.getClass().getDeclaredMethod(
            prefix + 
            propertyName.substring(0, 1).toUpperCase() + 
            propertyName.substring(1)
          );
            method.setAccessible(true);
            return (T) method.invoke((FObject) obj);
        } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
                | InvocationTargetException e) {
            // Should never occur
            System.err.println("ROPE ERROR: Attempted access on non-existant property");
        } 
        return null;
      `
    },
    {
      name: 'authorizeOnCreate',
      type: 'Void',
      javaThrows: [
        'AuthorizationException'
      ],
      args: [
        {
          name: 'x',
          type: 'Object',
          javaType: 'X'
        },
        {
          name: 'obj',
          type: 'Object',
          javaType: 'FObject'
        }
      ],
      javaCode: `
        if ( ! ropeSearch(ROPEActions.C, obj, x, this.getTargetDAOKey()) ) throw new AuthorizationException("You don't have permission to create this object");
      `
    },
    {
      name: 'authorizeOnReads',
      type: 'Void',
      javaThrows: [
        'AuthorizationException'
      ],
      args: [
        {
          name: 'x',
          type: 'Object',
          javaType: 'X'
        },
        {
          name: 'obj',
          type: 'Object',
          javaType: 'FObject'
        }
      ],
      javaCode: `
        if ( ! ropeSearch(ROPEActions.R, obj, x, this.getTargetDAOKey()) ) throw new AuthorizationException("You don't have permission to create this object");
      `
    },
    {
      name: 'authorizeOnUpdate',
      type: 'Void',
      javaThrows: [
        'AuthorizationException'
      ],
      args: [
        {
          name: 'x',
          type: 'Object',
          javaType: 'X'
        },
        {
          name: 'obj',
          type: 'Object',
          javaType: 'FObject'
        }
      ],
      javaCode: `
        if ( ! ropeSearch(ROPEActions.U, obj, x, this.getTargetDAOKey()) ) throw new AuthorizationException("You don't have permission to create this object");
      `
    },
    {
      name: 'authorizeOnDelete',
      type: 'Void',
      javaThrows: [
        'AuthorizationException'
      ],
      args: [
        {
          name: 'x',
          type: 'Object',
          javaType: 'X'
        },
        {
          name: 'obj',
          type: 'Object',
          javaType: 'FObject'
        }
      ],
      javaCode: `
        if ( ! ropeSearch(ROPEActions.D, obj, x, this.getTargetDAOKey()) ) throw new AuthorizationException("You don't have permission to create this object");
      `
    },
    {
      name: 'ropeSearch',
      type: 'Boolean',
      documentation: 'main starting point for the rope algorithm; method performs the recursive relational tree search needed for authentication',
      args: [
        {
          name: 'operation',
          class: 'Object',
          javaType: 'ROPEActions'
        },
        {
          name: 'obj',
          class: 'Object',
          javaType: 'FObject'
        },
        {
          name: 'x',
          class: 'Object',
          javaType: 'X'
        },
        {
          name: 'targetDAOKey',
          class: 'String'
        }
      ],
      javaCode: `
        //TODO fill in once rope is done
        return false;
      `
    }
  ]
})