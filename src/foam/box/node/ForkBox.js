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
  name: 'ForkBox',
  extends: 'foam.box.PromisedBox',

  documentation: `A PromisedBox that resolves to a RawSocketBox connected to
      a newly forked child process.`,

  requires: [
    'foam.box.Message',
    'foam.box.ReplyBox',
    'foam.box.SocketBox',
    'foam.box.SubBox'
  ],

  imports: [
    'me',
    'registry',
    'socketService'
  ],

  properties: [
    {
      class: 'Boolean',
      documentation: `Whether child process should be detached from parent
          (https://nodejs.org/api/child_process.html#child_process_options_detached).`,
      name: 'detached'
    },
    {
      class: 'String',
      name: 'nodePath',
      value: 'node'
    },
    {
      class: 'String',
      name: 'childScriptPath',
      factory: function() {
        return `${__dirname}${require('path').sep}forkScript.js`;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      documentation: `Box used for child's SocketBox reply.`,
      name: 'replyBox_'
    },
    {
      name: 'child_'
    }
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();

      this.delegate = new Promise(function(resolve, reject) {
        this.replyBox_ = this.ReplyBox.create({
          delegate: {
            send: function(message) {
              if ( ! this.SocketBox.isInstance(message.object) ) {
                reject(new Error('ForkBox failed to bind to child socket'));
              }
              resolve(message.object);
            }.bind(this)
          }
        });
      }.bind(this));
      this.registry.register(this.replyBox_.id, null, this.replyBox_);

      this.child_ = require('child_process').spawn(
        this.nodePath,
        [ this.childScriptPath ],
        { detached: this.detached });

      var process = require('process');
      this.child_.stdout.pipe(process.stdout);
      this.child_.stderr.pipe(process.stderr);

      this.socketService.listening$.sub(this.onSocketListening);
    }
  ],

  listeners: [
    function onSocketListening(sub, _, __, slot) {
      if ( ! slot.get() ) return;

      sub.detach();
      this.child_.stdin.end(
          foam.json.Network.stringify(this.SubBox.create({
            name: this.replyBox_.id,
            // TODO(markdittmer): RegisterSelfMessage should handle naming. Is
            // "name:" below necessary?
            delegate: this.SocketBox.create({
              name: this.me.name,
              address: `0.0.0.0:${this.socketService.port}`
            })
          }),
          'utf8',
          function() {
            this.child_.unref();
          }.bind(this)));
    }
  ]
});
