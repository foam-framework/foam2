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
  package: 'foam.box.node',
  name: 'SocketBindBox',
  extends: 'foam.box.ProxyBox',

  documentation: `Box for binding to a peer server's socket service port. Peer
      server message passed to delegate.`,

  requires: [
    'foam.box.InvalidMessageException',
    'foam.box.Message',
    'foam.box.node.PeerServerBox',
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();
    },
    function send(message) {
      if ( this.PeerServerBox.isInstance(message.object) ) {
        this.delegate && this.delegate.send(message);
        return;
      }

      this.onError(message, this.InvalidMessageException.create({
        messageType: message.cls_ && message.cls_.id
      }));
    }
  ],

  listeners: [
    function onError(message, error) {
      if ( message.attributes && message.attributes.errorBox ) {
        message.attributes.errorBox.send(this.Message.create({
          object: error
        }));
      } else {
        throw error;
      }
    }
  ]
});
