/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'NextRelationshipsList',

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
      buildJavaClass: function (cls) {
        cls.extras.push(`
          /**
           * returns the map for a crud operation
           * */
          public Map<String, NextRelationshipsList> get(String crudKey) {
            switch ( crudKey ) {
              case "create":
                return getCreate();
              case "read":
                return getRead();
              case "update":
                return getUpdate();
              case "delete":
                return getDelete();
              default:
            }
            return null;
          }

          /**
           * returns the list of relationshipKeys of ropes that can authorize a crud operation, depending on the
           * crudKey and propertyKey.
           * If the propertyKey is null, empty, or not found, return __default__ list.
           * Otherwise, return the list mapped to by the property name
           * */
          public List<String> get(String crudKey, String propertyKey) {
            Map<String, NextRelationshipsList> map = this.get(crudKey);
            if ( map == null ) return null;
    
            if ( propertyKey == null || propertyKey.equals("") || ! map.containsKey(propertyKey) ) {
              return map.containsKey("__default__") && map.get("__default__") != null ? map.get("__default__").getNextRelationships() : null;
            }
            return map.get(propertyKey).getNextRelationships();
          }
        `);
      }
    }
  ],
})