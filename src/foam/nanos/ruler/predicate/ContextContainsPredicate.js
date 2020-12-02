/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'ContextContainsPredicate',

  documentation: 'Returns true if the key is found in the context',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  properties: [
    {
      class: 'String',
      name: 'key',
      documentation: 'The Key that we want to check is contained in the context'
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ( (foam.core.X)(obj)).get(getKey()) == null )
          return false;
        return true;
      `
    }
  ]
});
