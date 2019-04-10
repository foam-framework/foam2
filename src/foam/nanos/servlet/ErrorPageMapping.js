/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'ErrorPageMapping',
  properties: [
    {
      class: 'Int',
      name: 'errorCode'
    },
    {
      class: 'String',
      name: 'exceptionType'
    },
    {
      class: 'String',
      name: 'location'
    }
  ]
});
