/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyChangePredicate',

  documentation: 'A predicate that returns true when a specific property has changed. This predicate expects to be able to pull the old and new object out of the context to do this check.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'String',
      name: 'propName'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        FObject nu  = (FObject) NEW_OBJ.f(obj);
        FObject old = (FObject) OLD_OBJ.f(obj);
        return old != null && nu != null &&
          ! foam.util.SafetyUtil.equals(
            nu.getProperty(getPropName()),
            old.getProperty(getPropName()));
      `
    }
  ]
});
