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

      if ( ! replyBox ) {
        this.delegate.send(msg);
        return;
      }

      var tooLate = false;
      var timer = setTimeout(function() {
        tooLate = true;
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

          // TODO: Is it wise to increase the timeout?  Seems
          // reasonable, if our timeout value is too conservative and
          // the server is just slow we're better to wait longer
          // rather than hit it with additional requests while its
          // still processing our old ones.
          self.timeout *= 2;
        }
      };

      this.delegate.send(msg);
    }
  ]
});
