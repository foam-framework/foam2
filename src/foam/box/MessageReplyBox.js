/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved. 
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Simple ReplyBox storing the reply message
 */
foam.CLASS({
  package: 'foam.box',
  name: 'MessageReplyBox',
  implements: ['foam.box.Box'],

  properties: [
    {
      name: 'message',
      class: 'FObjectProperty',
      of: 'foam.box.Message'
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(m) {
        this.message = m;
      },
      swiftCode: 'throw FoamError("unimplemented")',
      javaCode: `
      setMessage(msg);
      `
    }
  ]
});
