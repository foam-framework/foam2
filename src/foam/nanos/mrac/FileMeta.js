/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'FileMeta',

  documentation: 'This model use to store metadata of a File',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'filename'
    },
    {
      class: 'Int',
      name: 'postFix'
    },
    {
      class: 'Int',
      name: 'totalEntry'
    },
    {
      class: 'Long',
      name: 'maxIndex'
    },
    {
      class: 'Long',
      name: 'minIndex'
    }
  ]
});
