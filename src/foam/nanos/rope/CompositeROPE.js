/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'CompositeROPE',
  extends: 'foam.nanos.rope.ROPE',

  properties: [
    {
      name: 'children',
      class: 'List',
      javaType: 'java.util.List<ROPE>'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'OrROPE',
  extends: 'foam.nanos.rope.CompositeROPE',
  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'java.util.List'
  ],

  methods: [
    {
      name: 'check',
      javaCode: `
        List<ROPE> children = getChildren();
        for ( ROPE child : children ) {
          if ( child.check(x, obj, relationshipKey, crudKey, propertyKey) ) return true;
        }
        return false;
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'AndROPE',
  extends: 'foam.nanos.rope.CompositeROPE',
  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'java.util.List'
  ],

  methods: [
    {
      name: 'check',
      javaCode: `
        List<ROPE> children = getChildren();
        if ( children == null || children.size() <= 0 ) return false;
        for ( ROPE child : children ) {
          if ( ! child.check(x, obj, relationshipKey, crudKey, propertyKey) ) return false;
        } 
        return true;
      `
    }
  ]
});