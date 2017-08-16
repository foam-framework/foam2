/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.actioncommand',
  name: 'ActionCommand',

  documentation: 'Command object containing an object and pending action to be done on it',

  properties: [
    {
      class: 'String',
      name: 'objectID',
      required: true
    },
    {
      class: 'String',
      name: 'actionName',
      required: true
    }
  ]
});
