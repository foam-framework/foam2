/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyIsClass',

  documentation: 'Returns true if property propName is classOf of',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*',
    'foam.mlang.predicate.IsClassOf'
  ],
  properties: [
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'Class',
      name: 'of',
      documentation: 'class that we want the object to be a class of'
    },
    {
      class: 'Boolean',
      name: 'isNew',
      value: true
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `

      if ( getIsNew() ) {
        FObject nu  = (FObject) NEW_OBJ.f(obj);
         return (new IsClassOf(getOf())).f(nu.getProperty(getPropName()));
      }
      FObject old = (FObject) OLD_OBJ.f(obj);
      if ( old != null )
         return (new IsClassOf(getOf())).f(old.getProperty(getPropName()));
      return false;
      `
    }
  ]
});
