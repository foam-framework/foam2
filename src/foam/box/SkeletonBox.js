/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.box',
  name: 'SkeletonBox',

  requires: [
    'foam.box.Message',
    'foam.box.RPCMessage',
    'foam.box.RPCReturnMessage',
    'foam.box.RPCErrorMessage',
    'foam.box.InvalidMessageException'
  ],

  properties: [
    {
      name: 'data'
    }
  ],

  methods: [
    function call(message) {
      var p;

      try {
        p = this.data[message.object.name].apply(this.data, message.object.args);
      } catch(e) {
        message.attributes.errorBox && message.attributes.errorBox.send(this.Message.create({
          object: this.RPCErrorMessage.create({ data: e })
        }));

        return;
      }

      var replyBox = message.attributes.replyBox;

      var self = this;

      if ( p instanceof Promise ) {
        p.then(
          function(data) {
            replyBox.send(self.Message.create({
              object: self.RPCReturnMessage.create({ data: data })
            }));
          },
          function(error) {
            message.attributes.errorBox && message.attributes.errorBox.send(self.Message.create({
              object: self.RPCErrorMessage.create({ data: error })
            }));
          });
      } else {
        replyBox && replyBox.send(this.Message.create({
          object: this.RPCReturnMessage.create({ data: p })
        }));
      }
    },

    function send(message) {
      if ( this.RPCMessage.isInstance(message.object) ) {
        this.call(message);
        return;
      }

      throw this.InvalidMessageException.create({
        messageType: message.cls_ && message.cls_.id
      });
    }
  ]
});
