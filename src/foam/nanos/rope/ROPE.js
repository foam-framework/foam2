/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'ROPE',

  ids: [ 'targetDAOKey', 'sourceDAOKey', 'relationshipKey' ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Authorizer',
    'foam.nanos.auth.User',
    'foam.nanos.rope.ROPE',
    'java.lang.reflect.*',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.Map',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'sourceDAOKey',
      class: 'String',
      required: true
    },
    {
      name: 'targetDAOKey',
      class: 'String',
      required: true
    },
    {
      name: 'cardinality',
      class: 'String',
      required: true
    },
    {
      name: 'relationshipKey',
      class: 'String'
    },
    {
      name: 'crudMap',
      class: 'FObjectProperty',
      of: 'foam.nanos.rope.CRUDMap'
    },
    {
      name: 'relationshipMap',
      class: 'FObjectProperty',
      of: 'foam.nanos.rope.RelationshipMap',
    },
    {
      name: 'isInverse',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'check',
      javaType: 'boolean',
      args: [
        { name: 'x', javaType: 'X' },
        { name: 'obj', javaType: 'FObject' },
        { name: 'relationshipKey', javaType: 'String' },
        { name: 'crudKey', javaType: 'CrudOperation' },
        { name: 'propertyKey', javaType: 'String' }
      ],
      javaCode: `
        // get the list of next relationships to search to pass this rope
        List<String> nextRelationships = getNextRelationships(relationshipKey, crudKey, propertyKey);
    
        // if a there are no results, return false
        if ( nextRelationships == null || nextRelationships.size() == 0 ) return false;
    
        // get the list of sourceObjs that have a relationship with the targetObj
        
        // switch user in context to a system user
        User systemUser = new User.Builder(x).setId(1).build();
        List<FObject> sourceObjs = getSourceObjects(x.put("user", systemUser), obj);
    
        DAO ropeDAO = (DAO) x.get("ropeDAO");
        for ( FObject sourceObj : sourceObjs ) {
          if ( sourceObj == null ) continue;
          if ( nextRelationships.contains("__terminate__") ) {
            if ( sourceObj instanceof User && ((User) sourceObj).getId() == ((User) x.get("user")).getId() ) return true;
          }
          for ( String nextRelationship : nextRelationships ) {
            if ( nextRelationship.equals("__terminate__") ) continue;
            List<ROPE> nextRopes = (List<ROPE>) ((ArraySink) ropeDAO.inX(x).where(AND(
              EQ(ROPE.TARGET_DAOKEY, getSourceDAOKey()),
              EQ(ROPE.RELATIONSHIP_KEY, nextRelationship)
            )).select(new ArraySink())).getArray();
            for ( ROPE nextRope : nextRopes ) {
              if ( nextRope.check(x, sourceObj, getRelationshipKey(), null, "") ) return true;
            }
          }
        }
    
        return false;
      `
    },
    {
      name: 'getSourceObjects',
      args: [
        { name: 'x', javaType: 'X' },
        { name: 'obj', javaType: 'FObject' }
      ],
      javaType: 'List<FObject>',
      documentation: `
      This function returns the objects in the DAO specified by sourceDAOKey that has a relationship with the obj in arguments
      `,
      javaCode: `
        List<FObject> sourceObjs = new ArrayList(); 
    
        switch ( getCardinality() ) {
          case "*:*" :
            String targetPropertyName = getIsInverse() ? "sourceId" : "targetId";
            String sourcePropertyName = getIsInverse() ? "targetId" : "sourceId";
      
            foam.dao.ManyToManyRelationshipImpl relationship = (foam.dao.ManyToManyRelationshipImpl) retrieveProperty(obj, obj.getClass(), "get", getRelationshipKey(), x);
            List<FObject> junctionObjs = (List<FObject>) ( (ArraySink) relationship.getJunctionDAO().where(
              EQ(relationship.getJunction().getAxiomByName(targetPropertyName), retrieveProperty(obj, obj.getClass(), "get", "id"))
            ).select(new ArraySink())).getArray();
      
            for ( FObject junctionObj : junctionObjs ) {
              FObject sourceObj = (FObject) (((DAO) x.get(getSourceDAOKey())).find((retrieveProperty(junctionObj, junctionObj.getClass(), "get", sourcePropertyName))));
              sourceObjs.add(sourceObj);
            }
            break;
          case "1:*" :
            if ( getIsInverse() ) {
              DAO rDAO = retrieveProperty(obj, obj.getClass(), "get", getRelationshipKey(), x);
              sourceObjs = ((ArraySink) rDAO.select(new ArraySink())).getArray();
            } else {
              FObject sourceObj = retrieveProperty(obj, obj.getClass(), "find", getRelationshipKey(), x);
              sourceObjs.add(sourceObj);
            }
            break;
          case "1:1" :
            DAO sourceDAO = (DAO) x.get(getSourceDAOKey());
            sourceObjs.add(sourceDAO.find(retrieveProperty(obj, obj.getClass(), "get", getRelationshipKey())));
            break;
          default: 
        }
        return sourceObjs;
      `
    },
    {
      name: 'retrieveProperty',
      args: [
        { name: 'obj', javaType: 'FObject' },
        { name: 'objClass', javaType: 'Class' },
        { name: 'prefix', javaType: 'String' },
        { name: 'propertyName', javaType: 'String' },
        { name: 'x', javaType: 'X...' }
      ],
      javaType: '<T> T',
      documentation: `
      This function returns the value of a property on a object.
      args: 
          prefix - the prefix of the property's getter method. i.e., "get", "find"
          propertyName - the name of the property to retrieve the value of 
          x - optional argument, provide if the property's getter takes the context as an argument
      `,
      javaCode: `
        if ( objClass == null ) objClass = obj.getClass();
        Method method;
        try {
          Class<?>[] params = ( x.length > 0 ) ? new Class<?>[]{X.class} : new Class<?>[]{};
          method = objClass.getDeclaredMethod(
            prefix + propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1),
            params
          );
          method.setAccessible(true);
          T ret = x.length > 0 ? (T) method.invoke((FObject) obj, x[0]) : (T) method.invoke((FObject) obj);
          return ret;
        } catch ( NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e ) {
          if ( e instanceof NoSuchMethodException && ((Class) objClass).getSuperclass() != null ) return retrieveProperty(obj, ((Class) objClass).getSuperclass(), prefix, propertyName, x);
          System.err.println("ROPE ERROR: Attempted access on non-existant property ");
          e.printStackTrace();
        } 
        return null;
      `
    },
    {
      name: 'getNextRelationships',
      args: [
        { name: 'relationshipKey', javaType: 'String' },
        { name: 'crudKey', javaType: 'CrudOperation' },
        { name: 'propertyKey', javaType: 'String' }
      ],
      javaType: 'List<String>',
      documentation: `
      This function returns a list of relationshipKeys to filter the ropeDAO within intermediate steps of the ropeSearch
      args :
        relationshipKey - if the relationshipKey is specified, get list of keys in relationshipMap[relationshipKey]
        crudKey - if the crudKey is specified, get list of keys in crudMap[crudKey]["__default__"], or
        propertyKey - if the propertyKey is specified, get list of keys in crudMap[crudKey][propertyKey] or crudMap[crudKey]["__default__"], if the first returns null
      `,
      javaCode: `
        List<String> next = new ArrayList<String>();
    
        if ( crudKey != null ) {
          next = getCrudMap() == null ? null : getCrudMap().get(crudKey, propertyKey);
        } else if ( relationshipKey != null && ! "".equals(relationshipKey) ) {
          next = getRelationshipMap() == null ? null : getRelationshipMap().get(relationshipKey);
        }
        return next;
      `
    }
  ]
});
