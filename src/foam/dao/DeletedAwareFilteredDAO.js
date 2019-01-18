/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'DeletedAwareFilteredDAO',
  extends: 'foam.dao.FilteredDAO',

  documentation: 'Filter out deleted=true DeletedAware objects.',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      factory: function() {
        return this.NEQ(this.of.DELETED, true);
      },
      javaFactory: `
        return foam.mlang.MLang.NEQ(getOf().getAxiomByName("deleted"), true);
      `
    }
  ]
});
