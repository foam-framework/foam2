/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.demo.relationship',
  name: 'Course',
  ids: [ 'code' ],
  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Float',
      name: 'cost'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.demo.relationship.CourseType',
      name: 'type'
    }
  ]
});
