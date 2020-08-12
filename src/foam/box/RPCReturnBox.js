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
  name: 'RPCReturnBox',

  implements: [ 'foam.box.Box' ],

  imports: [
    'requestCapability'
  ],

  requires: [
    'foam.box.RPCReturnMessage',
    'foam.box.RPCErrorMessage'
  ],

  properties: [
    {
      name: 'promise',
      factory: function() {
        return new Promise(function(resolve, reject) {
          this.resolve_ = resolve;
          this.reject_ = function(obj) {
            if ( obj.id === 'foam.nanos.crunch.CapabilityRuntimeException' ) return;
            reject(obj);
          };
        }.bind(this));
      },
      swiftType: 'Future<Any?>',
      swiftFactory: 'return Future()'
    },
    {
      name: 'resolve_'
    },
    {
      name: 'reject_'
    },
    {
      class: 'Object',
      name: 'semaphore',
      javaType: 'java.util.concurrent.Semaphore',
      javaFactory: 'return new java.util.concurrent.Semaphore(0);'
    },
    {
      class: 'Object',
      name: 'message',
      type: 'foam.box.Message'
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(msg) {
        if ( this.RPCReturnMessage.isInstance(msg.object) ) {
          this.resolve_(msg.object.data);
          return;
        }
        if ( this.RPCErrorMessage.isInstance(msg.object) ) {
          if ( msg.object.data.id === 'foam.nanos.crunch.CapabilityRuntimeException' ) {
            this.requestCapability(msg.object.data).then(function() {
              self.clientBox.send(self.msg);
            });
          } 
          this.reject_(msg.object.data);
          return;
        }
        if ( foam.core.Exception.isInstance(msg.object) ) {
          this.reject_(msg.object);
          return;
        }
        if ( msg.object instanceof Error ) {
          this.reject_(msg.object);
          return;
        }

        this.__context__.warn('Invalid message to RPCReturnBox.');
      },
      javaCode: `
setMessage(msg);
getSemaphore().release();
`,
      swiftCode: `
let msg = msg!
if let o = msg.object as? foam_box_RPCReturnMessage {
  promise.set(o.data)
  return
}
promise.error(FoamError(msg.object))
      `
    }
  ]
});
