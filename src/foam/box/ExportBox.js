/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'ExportBox',
  documentation: 'The standard class for a reply box.  Holds both the local box that messages are delivered to, and the messenger box which is what is serialized over the network and should be configured to deliver messages back to us.',
  implements: [ 'foam.box.Box' ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      networkTransient: true,
      name: 'localBox',
      javaType: 'foam.box.Box'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'messengerBox'
    }
  ],
  methods: [
    {
      name: 'outputJSON',
      code: function(outputter) {
        // This is purely an optimization. The localBox is marked as
        // network transient, so we could serialize the ReplyBox as a
        // whole to the remote side, but that provides no utility,
        // only overhead.  We would need to remove this if at some
        // point we decide to store ReplyBox's in long term storage.
        // Although doing so is unlikely to be useful as the localBox
        // is typically not serializable.
        outputter.output(this.messengerBox);
      }
    },
    {
      name: 'send',
      code: function(msg) {
        this.localBox.send(msg);
      },
      javaCode: `getLocalBox().send(msg);`,
      swiftCode: `try localBox!.send(msg)`
    }
  ]
});
