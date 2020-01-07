/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'NextRelationshipsList',
  
  documentation: `
  This is the List of next relationships used in the sub-maps of CRUDMap and in relationshipMap.
  The reason this model is needed is because when a ROPE with the maps as Map<String, List<String>> is read from the journal, 
  the List is interpreted as an String[] instead of List<String> (probably), so we get <String, Ljava.lang.String>.
  Modelling this list, and using this class as the value type in the maps is a quick fix to this problem.
  `,

  properties: [
    {
      name: 'nextRelationships',
      class: 'List',
      javaType: 'java.util.List<String>'
    }
  ]

});

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'RelationshipMap',

  properties: [
    {
      name: 'map',
      class: 'Map',
      javaType: 'java.util.Map<String, NextRelationshipsList>'
    }
  ],

  methods: [
    {
      name: 'get',
      javaType: 'java.util.List<String>',
      args: [
        { name: 'relationshipKey', class: 'String' }
      ],
      javaCode: `
        return getMap().containsKey(relationshipKey) && getMap().get(relationshipKey) != null ? getMap().get(relationshipKey).getNextRelationships() : null;
      `
    },
  ]

});

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'CRUDMap',

  javaImports: [
    'java.util.Map',
    'java.util.List'
  ],

  constants: [
    {
      name: 'DEFAULT',
      type: 'String',
      value: '__default__',
      documentation: `
      This is the default key to be used for mapping to a list of next relationships in the sub-maps of this model.
      To authorize using a different set of relationships for create/update operations, please use propertyname as key.
      `
    },
  ],

  properties: [
    {
      name: 'create',
      class: 'Map',
      javaType: 'java.util.Map<String, NextRelationshipsList>'
    },
    {
      name: 'read',
      class: 'Map',
      javaType: 'java.util.Map<String, NextRelationshipsList>'
    },
    {
      name: 'update',
      class: 'Map',
      javaType: 'java.util.Map<String, NextRelationshipsList>',
    },
    {
      name: 'delete',
      class: 'Map',
      javaType: 'java.util.Map<String, NextRelationshipsList>',
    }
  ],
  
  axioms: [
    {
      name: 'javaExtras',
      documentation: `
      The 'get' functions are added via javaExtras rather than methods because method overloading is not yet supported in foam.
      `,
      buildJavaClass: function (cls) {
        cls.extras.push(`
          /**
           * Returns the map for a crud operation.
           * */
          public Map<String, NextRelationshipsList> get(CrudOperation crudKey) {
            switch ( crudKey ) {
              case CREATE:
                return getCreate();
              case READ:
                return getRead();
              case UPDATE:
                return getUpdate();
              case DELETE:
                return getDelete();
              default:
            }
            return null;
          }   

          /**
           * Returns the list of relationshipKeys of ropes that can authorize a crud operation, depending on the
           * crudKey and propertyKey.
           * If the propertyKey is null, empty, or not found, return __default__ list.
           * Otherwise, return the list mapped to by the property name.
           * */
          public List<String> get(CrudOperation crudKey, String propertyKey) {
            Map<String, NextRelationshipsList> map = this.get(crudKey);
            if ( map == null ) return null;
    
            if ( propertyKey == null || "".equals(propertyKey) || ! map.containsKey(propertyKey) ) {
              return map.containsKey(DEFAULT) && map.get(DEFAULT) != null ? map.get(DEFAULT).getNextRelationships() : null;
            }
            return map.get(propertyKey).getNextRelationships();
          }
        `);
      }
    }
  ],
});

foam.ENUM({
  package: 'foam.nanos.rope',
  name: 'CrudOperation',
  values: [
    {
      name: 'CREATE',
      label: 'create'
    },
    {
      name: 'READ',
      label: 'read'
    },
    {
      name: 'UPDATE',
      label: 'update'
    },
    {
      name: 'DELETE',
      label: 'delete'
    }
  ]
});
