/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.box.socket',
  name: 'BoxHolder',

  documentation: `Model to capture a box and it's associated PM. The PM is used to capture round trip message time. Used by SocketConnectionBox.`,

  properties: [
    {
      name: 'box',
      class: 'FObjectProperty',
      of: 'foam.box.Box'
    },
    {
      name: 'pm',
      class: 'FObjectProperty',
      of: 'foam.nanos.pm.PM'
    }
  ]
});
