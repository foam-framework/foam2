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
      javaCode: `
((foam.box.Box)getX().get("returnBox")).send(message);
`
    }
  ]
});
