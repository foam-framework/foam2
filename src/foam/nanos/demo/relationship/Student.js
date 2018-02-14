/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.demo.relationship',
  name: 'Student',
  ids: [ 'studentId' ],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Long',
      name: 'studentId'
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.demo.relationship.Student',
  targetModel: 'foam.nanos.demo.relationship.Course',
  cardinality: '*:*',
  forwardName: 'courses',
  inverseName: 'students'
});
