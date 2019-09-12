/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'TestObjectC',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    }
  ]
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.rope.test.TestObjectA',
  targetModel: 'foam.nanos.rope.test.TestObjectB',
  sourceDAOKey: 'aDAO',
  targetDAOKey: 'bDAO',
  cardinality: '*:*',
  forwardName: 'bs',
  inverseName: 'as',
  junctionDAOKey: 'abJunctionDAO'
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.rope.test.TestObjectB',
  targetModel: 'foam.nanos.rope.test.TestObjectC',
  sourceDAOKey: 'bDAO',
  targetDAOKey: 'cDAO',
  cardinality: '*:*',
  forwardName: 'cs',
  inverseName: 'bs',
  junctionDAOKey: 'bcJunctionDAO'
});
