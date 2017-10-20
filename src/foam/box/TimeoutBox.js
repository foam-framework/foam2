foam.CLASS({
  package: 'foam.box',
  name: 'TimeoutException',
  implements: ['foam.core.Exception']
});

foam.CLASS({
  package: 'foam.box',
  name: 'TimeoutBox',
  //  implements: ['foam.box.Box'],
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.TimeoutException',
    'foam.box.Message'
  ],
  properties: [
    {
      class: 'Int',
      name: 'timeout',
      value: 5000
    }
  ],
  methods: [
    function send(msg) {
      var replyBox = msg.attributes.replyBox;

      var tooLate = false;
      var timer = setTimeout(function() {
        tooLate = true;
        console.error("Timeout");
        replyBox.send(this.Message.create({
          object: this.TimeoutException.create()
        }));
      }.bind(this), this.timeout);

      var self = this;

      msg.attributes.replyBox = {
        send: function(msg) {
          if ( ! tooLate ) {
            clearTimeout(timer);
            replyBox.send(msg);
            return;
          }
          // Consider increasing timer if we're still getting responses just a little too late.
          console.warn("Got stale response messsage");
          self.timeout *= 2;
        }
      };

      this.delegate.send(msg);
    }
  ]
});
