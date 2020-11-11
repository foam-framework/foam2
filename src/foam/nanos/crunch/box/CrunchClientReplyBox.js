/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.box',
  name: 'CrunchClientReplyBox',
  extends: 'foam.box.ProxyBox',

  documentation: `
    This box decorates reply boxes sent to CrunchClientBox.
  `,

  requires: [
    'foam.box.RPCErrorMessage',
    'foam.box.RPCReturnMessage',
    'foam.nanos.crunch.CapabilityIntercept'
  ],

  imports: [
    'crunchController'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'msg',
      type: 'foam.box.Message'
    },
    {
      class: 'FObjectProperty',
      name: 'clientBox',
      type: 'foam.box.Box'
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        var self = this;
        if (
          this.RPCErrorMessage.isInstance(msg.object) &&
          this.CapabilityIntercept.isInstance(msg.object.data)
        ) {
          let intercept = msg.object.data;

          // Configure events CapabilityIntercept comopletion
          intercept.resolve = function (value) {
            var newMsg = msg.clone();
            newMsg.object = self.RPCReturnMessage.create({
              data: value
            });
            self.delegate.send(newMsg);
          };
          intercept.reject = function (value) {
            var newMsg = msg.clone();
            newMsg.object = new Error(value);
            self.delegate.send(newMsg);
          };
          intercept.resend = function () {
            self.clientBox.send(self.msg);
          };

          // Ask CrunchController to handle the intercept
          this.crunchController.handleIntercept(intercept);
          return;
        }

        this.delegate.send(msg);
      }
    }
  ]
});
