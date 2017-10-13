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
  name: 'RoundRobinBoxRegistryBox',
  extends: 'foam.box.BoxRegistryBox',

  documentation: `A BoxRegistryBox that broadcasts RPC calls to an array of
      delegates, and wraps the return value of register() calls in a
      RoundRobinBox that will select one delegate to handle registered service's
      RPCs.`,

  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.box.InvalidMessageException',
    'foam.box.RPCMessage',
    'foam.box.RPCReturnBox',
    'foam.box.RoundRobinBox'
  ],
  imports: [ 'registry' ],

  classes: [
    {
      name: 'CountingReplyBox',

      implements: [ 'foam.box.Box' ],

      requires: [
        'foam.box.RPCReturnMessage',
        'foam.box.RoundRobinBox'
      ],

      properties: [
        {
          class: 'Int',
          name: 'numReplies'
        },
        {
          class: 'Int',
          name: 'numMessages'
        },
        {
          class: 'String',
          name: 'rpcMessageName'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'delegate',
          value: null
        },
        {
          class: 'Array',
          of: 'foam.box.BoxRegistryBox',
          name: 'registryReturnDelegates'
        },
      ],

      methods: [
        function send(message) {
          this.numReplies++;
          var isRegister = this.rpcMessageName !== 'register';
          var isRPCReturn = this.RPCReturnMessage.isInstance(message.object);

          if ( this.numReplies !== this.numMessages ) {
            // Still waiting for replies; no need to store reply.
            if ( ! ( isRegister && isRPCReturn ) ) return;
            // Still waiting for register() replies;
            // store box returned from register().
            this.registryReturnDelegates.push(message.object.data);
            return;
          }

          if ( ( ! isRegister ) || ( ! isRPCReturn ) ) {
            // Not a register() reply; just forward last message.
            this.delegate && this.delegate.send(message);
            return;
          }

          // Last register() reply; deliver round-robin box that delegates to
          // registered boxes.
          //
          // TODO(markdittmer): Make multi-delegate routing strategy
          // configurable.
          this.registryReturnDelegates.push(message.object.data);
          message.object.data = this.RoundRobinBox.create({
            delegates: this.registryReturnDelegates
          });
        }
      ]
    }
  ],

  properties: [
    {
      class: 'Array',
      of: 'foam.box.BoxRegistryBox',
      name: 'delegates'
    }
  ],

  methods: [
    function send(message) {
      if ( this.RPCMessage.isInstance(message.object) ) {
        // Route RPCs to all delegates. Overwrite replyBox with
        // delegate-counting box. Reply after <num delegates> non-error
        // replies.
        if ( message.attributes.replyBox ) {
          message.attributes.replyBox = this.registry.register(
              null, null, this.CountingReplyBox.create({
                numMessages: this.delegates.length,
                rpcMessageName: message.object.name,
                delegate: message.attributes.replyBox
              }));
        }

        for ( var i = 0; i < this.delegates.length; i++ ) {
          this.delegates[i].send(message);
        }
      }

      // No other messages supported.
      throw this.InvalidMessageException.create({
        messageType: message.cls_ && message.cls_.id
      });
    }
  ]
});
