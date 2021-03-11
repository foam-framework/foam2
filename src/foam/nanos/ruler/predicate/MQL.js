/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'MQL',

  documentation: ``,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'Object',
      name: 'propValue'
    },
    {
      class: 'Boolean',
      name: 'isNew',
      value: true
    },
    {
      class: "String",
      name: 'query'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( getIsNew() ) {
          FObject nu  = (FObject) NEW_OBJ.f(obj);
          return MQL(getQuery()).f(nu);
        }
        FObject old = (FObject) OLD_OBJ.f(obj);
        if ( old != null ) {
          return MQL(getQuery()).f(old);
        }
        return false;
      `
    }
  ]
});
