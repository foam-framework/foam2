/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'ReturnBox',
  documentation: 'A box that sends messages back over the connection it came in on.',
  implements: ['foam.box.Box'],
  methods: [
    {
      name: 'send',
      code: function(message) {
        this.__context__.returnBox.send(message);
      },
      swiftCode: `try (__context__["returnBox"] as! foam_box_Box).send(msg)`,
      javaCode: `
((foam.box.Box)getX().get("returnBox")).send(message);
`
    }
  ]
});
