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
      name: 'ropeDAO',
      class: 'Object',
      javaType: 'DAO'
    },
    {
      name: 'targetDAOKey',
      class: 'String',
      javaType: 'String'
    }
  ],

  methods: [
    {
      name: 'findRopes',
      javaType: 'boolean',
      args: [
        { name: 'x', javaType: 'X' },
        { name: 'obj', javaType: 'FObject' },
        { name: 'targetDAOKey', javaType: 'String' },
        { name: 'relationship', javaType: 'String' },
        { name: 'crudKey', javaType: 'String' },
        { name: 'relationshipKey', javaType: 'String' },
        { name: 'propertyKey', javaType: 'String' }
      ],
      documentation: `
      this function checks the validity of a crud action on an authorizedDAO by checking recursively if
      the user has a valid relationship to this object that would authorize this action.
      In the first iteration of findRopes, the crudKey would always be specified with a string 
      denoting the intended action on the targetDAO. If the action is a create or update, the propertyKey
      specifying the updated or created property will also be given. If the propertyKey is found in the 
      create or update maps of the crudMap, it will determine the arguments of the next recursion. Otherwise, 
      the "__default__" map of create or update will be used. 
      In subsequent iterations of findRopes, the relationshipKey
      args : 
        x - the user's context
        obj - the object in the targetDAO to be updated
        targetDAOKey - string specifying the targetDAO being checked
        relationship - if specified, filter the ropeDAO so that ROPE.RELATIONSHIP_KEY matches relationship
        crudKey - provided as an argument when calling this function from authorizeOnCreate/Read/Update/Delete
        relationshipKey - provided as an argument in subsequent recursions of findRopes based on the ropes found
        propertyKey - provided as an argument when calling this function from authorizeOnCreate/authorizeOnUpdate
      `,
      javaCode: `    
      if ( getRopeDAO() == null ) setRopeDAO((DAO) x.get("ropeDAO"));

      // get all the ropes associated with the targetDAO
      DAO filteredRopeDAO = (DAO) getRopeDAO().where(AND(EQ(ROPE.TARGET_DAOKEY, targetDAOKey)));
      // if there is a relationship key to search for, filter the ropedao based on relationshipKey
      if ( ! relationship.isEmpty() ) {
        filteredRopeDAO = (DAO) filteredRopeDAO.where(EQ(ROPE.RELATIONSHIP_KEY, relationship));
      }
  
      // get list of usable ropes
      List<ROPE> ropes = (List<ROPE>) ((ArraySink) filteredRopeDAO.select(new ArraySink())).getArray();
  
      // check each rope found
      for ( ROPE rope : ropes ) {
        
        if ( rope instanceof AndROPE ) {
          // if the rope is an AndROPE, check if all of its compositeRopes return true, and if so, return true. 
          // otherwise, return false
          List<ROPE> compositeRopes = ((AndROPE) rope).getCompositeRopes();
          boolean andRopes = ( compositeRopes != null || compositeRopes.size() > 0 ) ? true : false;
          for ( ROPE subRope : compositeRopes ) {
            if ( ! checkRope(x, obj, subRope, relationshipKey, crudKey, propertyKey) ) {
              andRopes = false;
              break;
            }
          } 
          if ( andRopes ) return true;
        } else if (rope instanceof OrROPE) {
          // if the rope is an OrROPE, return true if any of its compositeRopes return true
          List<ROPE> compositeRopes = ((OrROPE) rope).getCompositeRopes();
          for ( ROPE subRope : compositeRopes ) {
            if ( checkRope(x, obj, subRope, relationshipKey, crudKey, propertyKey) ) return true;
          }
        } else {
          // if the rope is not a composite ROPE
          if ( checkRope(x, obj, rope, relationshipKey, crudKey, propertyKey) ) return true;
        }
      }
  
      return false; 
      
      `
    },
    {
      name: 'checkRope',
      javaType: 'boolean',
      args: [
        { name: 'x', javaType: 'X' },
        { name: 'obj', javaType: 'FObject' },
        { name: 'rope', javaType: 'ROPE' },
        { name: 'relationshipKey', javaType: 'String' },
        { name: 'crudKey', javaType: 'String' },
        { name: 'propertyKey', javaType: 'String' }
      ],
      documentation: `
      this function checks if obj has the relationship specified by relationshipKey with some sourceObj. If so, this rope is considered to be passed and 
      the check either terminates, if the __terminate__ flag is found, or moves on to the next rope with the sourceObj as the new target and the current 
      relationship as the relationshipKey
      args : 
        rope - the current rope being checked
        rest are same as in findRopes
      `,
      javaCode: `
      // get the list of next relationships to search to pass this rope
      List<String> nextRelationships = rope.getNextRelationships(relationshipKey, crudKey, propertyKey);
  
      // if a there are no results, return false
      if ( nextRelationships == null || nextRelationships.size() == 0 ) return false;
  
      // get the list of sourceObjs that have a relationship with the largetObj
      List<FObject> sourceObjs = rope.getSourceObjects(x, obj);
  
      for ( FObject sourceObj : sourceObjs ) {
        if ( sourceObj == null ) continue;
        if ( nextRelationships.contains("__terminate__") ) {
          if ( sourceObj instanceof User && ((User) sourceObj).getId() == ((User) x.get("user")).getId() ) return true;
          else continue;
        }
        for ( String nextRelationship : nextRelationships ) {
          if ( findRopes(x, sourceObj, rope.getSourceDAOKey(), nextRelationship, "", rope.getRelationshipKey(), "") ) return true;
        }
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
      this function returns a list of the names of properties changed on update or set on create
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
        String key = (String) i.next();
        propertyUpdates.add(key);
      }
      return propertyUpdates;
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
          javaType: 'X'
        },
        {
          name: 'obj',
          javaType: 'FObject'
        }
      ],
      javaCode: `
      if ( ((User) x.get("user")).getId() == User.SYSTEM_USER_ID ) return;
  
      List<String> propertiesUpdated = getPropertiesUpdated(null, obj);
      for ( String property : propertiesUpdated ) {
        if ( ! findRopes(x, obj, getTargetDAOKey(), "", "create", "", property ) ) {
          throw new AuthorizationException("You don't have permission to create this object");
        }
      }
      `
    },
    {
      name: 'authorizeOnRead',
      type: 'Void',
      javaThrows: [
        'AuthorizationException'
      ],
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'obj',
          javaType: 'FObject'
        }
      ],
      javaCode: `
      if ( ((User) x.get("user")).getId() == User.SYSTEM_USER_ID ) return;
      if ( ! findRopes(x, obj, getTargetDAOKey(), "", "read", "", "") ) throw new AuthorizationException("You don't have permission to read this object");
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
          type: 'foam.core.X'
        },
        {
          name: 'oldObj',
          type: 'foam.core.FObject'
        },
        {
          name: 'newObj',
          type: 'foam.core.FObject'
        },
      ],
      javaCode: `
      if ( ((User) x.get("user")).getId() == User.SYSTEM_USER_ID ) return;
  
      List<String> propertiesUpdated = getPropertiesUpdated(oldObj, newObj);
      for ( String property : propertiesUpdated ) {
        if ( ! findRopes(x, newObj, getTargetDAOKey(), "", "update", "", property ) ) {
          throw new AuthorizationException("You don't have permission to update this object");
        }
      }
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
          javaType: 'X'
        },
        {
          name: 'obj',
          javaType: 'FObject'
        }
      ],
      javaCode: `
      if ( ((User) x.get("user")).getId() == User.SYSTEM_USER_ID ) return;
      if ( ! findRopes(x, obj, getTargetDAOKey(), "", "delete", "", "") ) throw new AuthorizationException("You don't have permission to delete this object");
      `
    },
    {
      name: 'checkGlobalRead',
      javaType: 'boolean',
      args: [
        {
          name: 'x',
          javaType: 'X'
        }
      ],
      javaCode: `
      return false;
      `
    },
    {
      name: 'checkGlobalRemove',
      javaType: 'boolean',
      args: [
        {
          name: 'x',
          javaType: 'X'
        }
      ],
      javaCode: `
      return false;
      `
    },
    {
      name: 'getPermissionPrefix',
      javaType: 'String',
      javaCode: `
      return "";
      `
    }
  ]
})