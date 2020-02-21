foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CRUDActionsPredicate',
  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'create'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'update'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'delete'
    }
  ] 
});