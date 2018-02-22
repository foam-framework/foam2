/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'EnabledAwareDAO',
  extends: 'foam.dao.FilteredDAO',

  documentation: 'Filter out disabled EnabledAware objects.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.EnabledAware'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      factory: function() {
        return this.EQ(this.EnabledAware.ENABLED, true);
      },
      javaFactory: 'return foam.mlang.MLang.EQ(EnabledAware.ENABLED, true);'
    }
  ]
});
