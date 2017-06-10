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
  name: 'ServerBox',
  extends: 'foam.box.ProxyBox',
  implements: [ 'foam.box.node.SocketAddressable' ],


  documentation: `A socket-oriented Node JS server that runs in a
      foam.box.Context. The server encapsulates:

      (1) A collection of known "peer" servers of the same type;
      (2) A means spawning additional servers in separate processes;
      (3) A "socket bind service" that allows servers to advertise their
          addresses to each other.`,
  // TODO(markdittmer): Should these concerns be separated into different
  // components?

  requires: [
    'foam.box.Message',
    'foam.box.SocketBox',
    'foam.box.SubBox',
    'foam.box.node.PeerServerBox',
    'foam.box.node.SocketBindBox',
    'foam.net.node.SocketService'
  ],
  imports: [
    'info',
    'registry',
    'socketService'
  ],

  constants: {
    SOCKET_BIND_SERVICE_NAME: 'bindToSocket'
  },

  classes: [
    // TODO(markdittmer): Should this just be foam.box.AnonymousBox?
    {
      name: 'AnonymousBox',

      properties: [
        {
          class: 'Function',
          name: 'send',
          required: true
        }
      ],

      methods: [
        function init() {
          this.validate();
          this.SUPER();
        }
      ]
    }
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.box.node.PeerServerBox',
      name: 'peers'
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
        return `${__dirname}${require('path').sep}childServer.js`;
      }
    },
    {
      name: 'delegate',
      factory: function () { return this.registry; },
      transient: true
    },
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();
    },
    function start() {
      this.log('Starting local server');

      // Replace socket service with service consistent with this server's port
      // number.
      this.socketService = this.SocketService.create({
        // TODO(markdittmer): Handle port taken.
        port: this.port,
        delegate: this.registry
      });

      // Respond to bind messages by adding peer.
      this.registry.register(
        this.SOCKET_BIND_SERVICE_NAME,
        null,
        this.SocketBindBox.create({
          delegate: this.AnonymousBox.create({
            send: function(message) {
              this.log('Newly connected peer', message.object.toString());
              this.peers = this.peers.concat([ message.object ]);
            }.bind(this)
          })
        }));

      // Bind to existing peers.
      var peers = this.peers;
      var self = this.PeerServerBox.create(this);
      for ( var i = 0; i < peers.length; i++ ) {
        this.log('Connecting to existing peer', peers[i].toString());
        this.bindPeers(peers[i], self);
      }
    },
    function bindPeers(p1, p2) {
      this.log('Binding peers', p1.toString(), p2.toString());
      this.SubBox.create({
        name: this.SOCKET_BIND_SERVICE_NAME,
        delegate: p1,
      }).send(this.Message.create({ object: p2 }));
    },
    function createLocalPeer(opt_peer) {
      var peer = opt_peer;
      if ( ! peer ) {
        peer = this.clone();
        // TODO(markdittmer): Peer should select port. That requires changes in
        // foam.net.node.SocketService to support "available port finding".
        peer.port = Math.floor( 10000 + ( Math.random() * 10000 ) );
        peer.peers = [ this ];
      }

      this.log('Creating local peer', peer.toString());

      var child = require('child_process').spawn(
        this.nodePath,
        [ this.childScriptPath ],
        { detached: true });

      // TODO(markdittmer): This is makes debugging from the console easier,
      // but should it really be the default setup?
      var process = require('process');
      process.stdin.pipe(child.stdin);
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);

      var specStr = foam.json.Network.stringify(peer);
      this.log('Sending peer spec', specStr);

      child.stdin.end(
          specStr,
          'utf8',
          function() {
            this.log('Finished sending peer spec', specStr);
            child.unref();
          }.bind(this));
    },
    function log() {
      var args = Array.from(arguments);
      this.info.apply(this, [ this.toString() ].concat(args));
    },
    function toString() {
      return this.cls_.id + '<' + this.socketAddress + '>';
    }
  ]
});
