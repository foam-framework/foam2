/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.rope',
    name: 'ROPE',
    documentation: 'model represents a single cell in a rope matrix',

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
        class: 'Map',
        javaType: 'java.util.Map<String, java.util.Map<String, java.util.List<String>>>'
      },
      {
        name: 'relationshipMap',
        class: 'Map',
        javaType: 'java.util.Map<String, java.util.List<String>>'
      },
      {
        name: 'isInverse',
        class: 'Boolean',
        value: false
      }
    ],

    methods: [
      {
        name: 'getSourceObjects',
        args: [
          {
            name: 'x',
            javaType: 'foam.core.X'
          },
          {
            name: 'obj',
            javaType: 'foam.core.FObject'
          }
        ],
        javaType: 'List<foam.core.FObject>',
        javaCode: `
        List<FObject> sourceObjs = new ArrayList(); 
    
        if ( getCardinality().equals("*:*") ) {
          String targetPropertyName = getIsInverse() ? "sourceId" : "targetId";
          String sourcePropertyName = getIsInverse() ? "targetId" : "sourceId";
    
          foam.dao.ManyToManyRelationshipImpl relationship = (foam.dao.ManyToManyRelationshipImpl) retrieveProperty(obj, obj.getClass(), "get", getRelationshipKey(), x);
          List<FObject> junctionObjs = (List<FObject>) ( (ArraySink) relationship.getJunctionDAO().where(
            EQ(relationship.getJunction().getAxiomByName(targetPropertyName), (Long) retrieveProperty(obj, obj.getClass(), "get", "id"))
          )
          .select(new ArraySink()))
          .getArray();
    
          for ( FObject junctionObj : junctionObjs ) {
            FObject sourceObj = (FObject) (((DAO) x.get(getSourceDAOKey()))
                        .find(((Long)retrieveProperty(junctionObj, junctionObj.getClass(), "get", sourcePropertyName)).longValue()));
            sourceObjs.add(sourceObj);
        }
    
        } else if ( getCardinality().equals("1:*") && getIsInverse() ) {
          DAO rDAO = retrieveProperty(obj, obj.getClass(), "get", getRelationshipKey(), x);
          sourceObjs = ((ArraySink) rDAO.where(INSTANCE_OF(((DAO) x.get(getSourceDAOKey())).getOf())).select(new ArraySink())).getArray();
        } else if (getCardinality().equals("1:*") ) {
          FObject sourceObj = retrieveProperty(obj, obj.getClass(), "find", getRelationshipKey(), x);
          sourceObjs.add(sourceObj);
        } else if ( getCardinality().equals("1:1") ) {
          String propName = getRelationshipKey().substring(getRelationshipKey().lastIndexOf(".") + 1);
          DAO sourceDAO = (DAO) x.get(getSourceDAOKey());
          sourceObjs.add(sourceDAO.find(retrieveProperty(obj, obj.getClass(), "get", propName)));
        }
    
        return sourceObjs;
        `
      },
      {
        name: 'retrieveProperty',
        args: [
          {
            name: 'obj',
            javaType: 'FObject'
          },
          {
            name: 'objClass',
            javaType: 'Class'
          },
          {
            name: 'prefix',
            javaType: 'String'
          },
          {
            name: 'propertyName',
            javaType: 'String'
          },
          {
            name: 'x',
            javaType: 'X...'
          }
        ],
        javaType: '<T> T',
        documentation: `
        this function returns the value of a property on a object.
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
        } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
                | InvocationTargetException e) {
            if ( ((Class) objClass).getSuperclass() != null ) return retrieveProperty(obj, ((Class) objClass).getSuperclass(), prefix, propertyName, x);
            System.err.println("ROPE ERROR: Attempted access on non-existant property ");
            e.printStackTrace();
        } 
        return null;

        `
      },
      {
        name: 'getNextRelationships',
        args: [
          {
            name: 'relationshipKey',
            javaType: 'String'
          },
          {
            name: 'crudKey',
            javaType: 'String'
          },
          {
            name: 'propertyKey',
            javaType: 'String'
          }
        ],
        javaType: 'List<String>',
        documentation: `
        this function returns a list of relationshipKeys to filter the ropeDAO with in intermediate steps of the ropeSearch
        args :
          rope - the current rope
          relationshipKey - if the relationshipKey is specified, get list of keys in relationshipMap[relationshipKey]
          crudKey - if the crudKey is specified, get list of keys in crudMap[crudKey]["__default__"], or
          propertyKey - if the propertyKey is specified, get list of keys in crudMap[crudKey][propertyKey] or crudMap[crudKey]["__default__"], if the first returns null

        `,
        javaCode: `

        List<String> next = new ArrayList<String>();
    
        if ( crudKey != null && ! crudKey.equals("") ) {
    
          Map<String, List<String>> crudMap = getCrudMap() == null ? null : getCrudMap().get(crudKey);
    
          if ( propertyKey != null && ! propertyKey.equals("") && crudMap.containsKey(propertyKey) ) {
            next = crudMap.get(propertyKey);
          } else {
            next = crudMap.get("__default__");
          }
    
        } else if ( relationshipKey != null && ! relationshipKey.equals("") ) {
          next = getRelationshipMap() == null ? null : getRelationshipMap().get(relationshipKey);
        } else {
          return null;
        }
    
        return next;
        `
      }
    ]
});

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'OrROPE',
  extends: 'foam.nanos.rope.ROPE',

  properties: [
    {
      name: 'compositeRopes',
      class: 'List',
      javaType: 'java.util.List<ROPE>'
    }
  ]

});

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'AndROPE',
  extends: 'foam.nanos.rope.ROPE',

  properties: [
    {
      name: 'compositeRopes',
      class: 'List',
      javaType: 'java.util.List<ROPE>'
    }
  ]
});