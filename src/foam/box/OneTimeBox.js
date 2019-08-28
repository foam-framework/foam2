foam.CLASS({
  package: 'foam.box',
  name: 'OneTimeBox',
  extends: 'foam.box.ProxyBox',
  methods: [
    {
      name: 'send',
      code: function(msg) {
        this.detach();
        this.SUPER(msg);
      }
    }
  ]
});
