/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'IsClassPredicate',

  documentation: 'Returns true if new object is class of',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'Class',
      name: 'of',
      documentation: 'class that we want the object to be an class of'
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, CLASS_OF(getOf().getObjClass())), true
        ).f(obj);
      `
    }
  ]
});
