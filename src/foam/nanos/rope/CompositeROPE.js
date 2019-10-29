
foam.CLASS({
    package: 'foam.nanos.rope',
    name: 'CompositeROPE',
    extends: 'foam.nanos.rope.ROPE',
  
    properties: [
      {
        name: 'compositeRopes',
        class: 'List',
        javaType: 'java.util.List<ROPE>'
      }
    ]
  })
  
  foam.CLASS({
    package: 'foam.nanos.rope',
    name: 'OrROPE',
    extends: 'foam.nanos.rope.CompositeROPE',
    javaImports: [
      'foam.core.FObject',
      'foam.core.X',
      'java.util.List'
    ],
  
    methods: [
      {
        name: 'check',
        javaCode: `
          List<ROPE> compositeRopes = getCompositeRopes();
          for ( ROPE subRope : compositeRopes ) {
            if ( subRope.check(x, obj, relationshipKey, crudKey, propertyKey) ) return true;
          }
          return false;
        `
      }
    ]
  });
  
  foam.CLASS({
    package: 'foam.nanos.rope',
    name: 'AndROPE',
    extends: 'foam.nanos.rope.CompositeROPE',
    javaImports: [
      'foam.core.FObject',
      'foam.core.X',
      'java.util.List'
    ],
  
    methods: [
      {
        name: 'check',
        javaCode: `
          List<ROPE> compositeRopes = getCompositeRopes();
          boolean andRopes = ( compositeRopes != null || compositeRopes.size() > 0 ) ? true : false;
          for ( ROPE subRope : compositeRopes ) {
            if ( ! subRope.check(x, obj, relationshipKey, crudKey, propertyKey) ) {
              andRopes = false;
              break;
            }
          } 
          return andRopes ? true : false;
        `
      }
    ]
  });