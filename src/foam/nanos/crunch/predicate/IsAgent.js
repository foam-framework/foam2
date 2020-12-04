/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'IsAgent',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `
    Returns true if user and realUser are different.
    This is useful for agent association capabilities.
  `,

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject'
  ],

  methods: [
    {
      name:'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        return ((Subject) x.get("subject")).isAgent();
      `
    }
  ]
});

