foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CRUDActionsPredicate',
  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'create',
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
      factory: function() {
        foam.mlang.predicate.True.create();
      }
      //javaFactory: `return foam.mlang.MLang.TRUE;`
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'update',
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
      factory: function() {
        foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'delete',
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
      factory: function() {
        foam.mlang.predicate.True.create();
      }
    }
  ] 
});