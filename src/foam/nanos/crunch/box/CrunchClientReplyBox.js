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
    'foam.u2.crunch.CapabilityIntercept'
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
          msg.object.data.id === 'foam.nanos.crunch.CapabilityRuntimeException'
        ) {
          let intercept = self.CapabilityIntercept.create({
            exception: msg.object.data,
            resolve: function (value) {
              var newMsg = msg.clone();
              newMsg.object = self.RPCReturnMessage.create({
                data: value
              });
              self.delegate.send(newMsg);
            },
            reject: function (value) {
              var newMsg = msg.clone();
              newMsg.object = new Error(value);
              self.delegate.send(newMsg);
            },
            resend: function () {
              self.clientBox.send(self.msg);
            }
          });
          this.crunchController.handleIntercept(intercept);
          return;
        }

        this.delegate.send(msg);
      }
    }
  ]
});
