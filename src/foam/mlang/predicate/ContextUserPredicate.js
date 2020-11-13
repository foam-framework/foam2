/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'ContextUserPredicate',

  extends: 'foam.mlang.predicate.AbstractPredicate',

  implements: [ 'foam.core.Serializable' ],

  documentation: 'Check arg1 predicate against the subject.user in the context.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject'
  ],

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return obj instanceof X
          && getArg1().f(
            ((Subject) ((X) obj).get("subject")).getUser()
          );
      `
    }
  ]
});
