foam.CLASS({
  package: 'foam.comics.v2',
  name: 'CRUDActionsPredicate',
  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'create',
      view: {
        class: 'foam.u2.view.JSONTextView'
      },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
      //javaFactory: `return foam.mlang.MLang.TRUE;`
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'update',
      view: {
        class: 'foam.u2.view.JSONTextView'
      },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'delete',
      view: {
        class: 'foam.u2.view.JSONTextView'
      },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
    }
  ] 
});