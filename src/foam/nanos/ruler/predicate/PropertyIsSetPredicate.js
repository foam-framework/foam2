/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyIsSetPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'A predicate that returns true when a specific property is set.',

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'Boolean',
      name: 'isNew',
      value: true,
      documentation: 'If true (default) test new object, otherwise test old object.'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( getIsNew() ) {
          var nu  = (FObject) NEW_OBJ.f(obj);
          return nu.isPropertySet(getPropName());
        }

        var old  = (FObject) OLD_OBJ.f(obj);
        return old.isPropertySet(getPropName());
      `
    }
  ]
});
