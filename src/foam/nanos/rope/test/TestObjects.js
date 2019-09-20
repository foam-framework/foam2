/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEUser',

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

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEBusiness',

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

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEBankAccount',

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

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPETransaction',

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


// foam.RELATIONSHIP({
//   sourceModel: 'foam.nanos.rope.test.User',
//   targetModel: 'foam.nanos.rope.test.Business',
//   sourceDAOKey: 'aDAO',
//   targetDAOKey: 'bDAO',
//   cardinality: '*:*',
//   forwardName: 'bs',
//   inverseName: 'as',
//   junctionDAOKey: 'abJunctionDAO'
// });

// foam.RELATIONSHIP({
//   sourceModel: 'foam.nanos.rope.test.User',
//   targetModel: 'foam.nanos.rope.test.User',
//   sourceDAOKey: 'bDAO',
//   targetDAOKey: 'cDAO',
//   cardinality: '*:*',
//   forwardName: 'cs',
//   inverseName: 'bs',
//   junctionDAOKey: 'bcJunctionDAO'
// });
