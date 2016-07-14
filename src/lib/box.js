/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  name: 'Box',

  methods: [
    {
      name: 'send',
      returns: '',
      code: function send(message) {}
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'PromisedBox',

  properties: [
    {
      class: 'Promised',
      of: 'foam.box.Box',
      transient: true,
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'Message',

  properties: [
    {
      name: 'replyBox'
    },
    {
      name: 'errorBox'
    }
  ],

  methods: [
    function toRemote() {
      this.replyBox = ( this.replyBox && this.replyBox.exportBox ) ? this.replyBox.exportBox() : this.replyBox;
      this.errorBox = ( this.errorBox && this.errorBox.exportBox ) ? this.errorBox.exportBox() : this.errorBox;
      return this;
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'WrappedMessage',
  extends: 'foam.box.Message',
  properties: [
    {
      name: 'message'
    }
  ],
  methods: [
    function toRemote() {
      this.message = this.message && this.message.toRemote();
      return this.SUPER();
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'ProxyBox',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.box.Box',
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'MessagePortBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.MessagePortConnectBox',
    'foam.box.RawMessagePortBox',
    'foam.box.RegisterSelfMessage'
  ],

  imports: [
    'messagePortService',
    'me'
  ],

  properties: [
    {
      name: 'port'
    },
    {
      name: 'delegate',
      factory: function() {
        var delegate = this.RawMessagePortBox.create({
          port: this.port
        });

        this.messagePortService.addPort(this.port);
        delegate.send(this.RegisterSelfMessage.create({ name: this.me.name }));

        return delegate;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RawMessagePortBox',
  implements: ['foam.box.Box'],

  properties: [
    {
      name: 'port'
    }
  ],

  methods: [
    function send(msg) {
      this.port.postMessage(foam.json.Network.stringify(msg));
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'EchoBox',

  implements: [ 'foam.box.Box' ],

  methods: [
    function send(msg) {
      if ( msg.replyBox ) {
        var reply = msg.replyBox;
        msg.clearProperty('replyBox');
        reply.send(msg);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'ForwardMessage',
  extends: 'foam.box.WrappedMessage',

  properties: [
    {
      name: 'nextBox'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'ForwardBox',
  requires: [
    'foam.box.ForwardMessage'
  ],

  methods: [
    function send(msg) {
      if ( this.ForwardMessage.isInstance(msg) ) {
        msg.nextBox.send(msg.msg);
      }
    }
  ]
});


/*
TODO:
-Figure out correct serialization of messages.  JSON isn't quite right.

-figure out how to serialize a postMessage.  How do we encode the
"address" of a window object, we can't pass them around, can we?
We _could_ pass message channels, but they have to be transferred, that's complicated
We could have some registry of known "windows"

Windows can be nammed with window.open(url, name), we can keep a registry of known names.
On open, register opener.name.  Names could be GUIDs.

Worker's can't be named.  But the first thing we can do when creating a worker is to register.

When booting FOAM, we pick a name

Current solution:
MessagePortService has a .start() and .connect() methods.
.start() puts the service in server mode,
.connect() connects to another service in server mode.

In server mode, when other services connect, it assigns them a unique id and tells
them what it is.  This way every MessagePortService gets its own unique id assuming
there's only one operating in server mode.

The server will usually be placed in a SharedWorker or similar.

HTTP Box?

WebSocket Box

*/


foam.CLASS({
  package: 'foam.box',
  name: 'SubBoxMessage',
  extends: 'foam.box.WrappedMessage',

  properties: [
    {
      name: 'name'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SubBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.SubBoxMessage'
  ],

  properties: [
    'name'
  ],

  methods: [
    function send(msg) {
      this.delegate.send(this.SubBoxMessage.create({
        name: this.name,
        message: msg,
        errorBox: msg.errorBox,
        replyBox: msg.replyBox
      }));
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NameAlreadyRegisteredException',

  properties: [
    'name'
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NoSuchNameException',

  properties: [ 'name' ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'BoxRegistry',

  requires: [
    'foam.box.NoSuchNameException',
    'foam.box.BoxRegistration',
    'foam.box.SubBox'
  ],

  imports: [
    'me'
  ],

  properties: [
    {
      name: 'registry',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      name: 'lookup',
      returns: 'foam.box.Box',
      code: function lookup(name) {
        if ( this.registry[name] &&
             this.registry[name].exportBox )
          return this.registry[name].exportBox;

        throw this.NoSuchNameException.create({ name: name });
      }
    },
    {
      name: 'register',
      returns: 'foam.box.Box',
      code: function(name, exportBox, localBox) {
        // TODO: Verification
        // TODO: Only register exportBox from external registrations, maybe?
        // TODO: Only register localBox from local registrations, maybe?

        this.registry[name] = {
          exportBox: exportBox || this.SubBox.create({
            name: name,
            delegate: this.me
          }),
          localBox: localBox
        };

        return this.registry[name].exportBox;
      }
    },
    {
      name: 'unregister',
      returns: '',
      code: function(name) {
        delete this.registry[name];
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'BoxRegistryBox',
  extends: 'foam.box.BoxRegistry',

  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.box.SubBoxMessage',
    'foam.box.SkeletonBox'
  ],

  properties: [
    {
      name: 'registrySkeleton',
      factory: function() {
        return this.SkeletonBox.create({ data: this });
      }
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(msg) {
        if ( this.SubBoxMessage.isInstance(msg) ) {
          if ( this.registry[msg.name].localBox ) {
            this.registry[msg.name].localBox.send(msg.message);
          } else {
            // TODO: Error case if no sub box found
          }
        } else {
          this.registrySkeleton.send(msg);
        }
      }
    },

    function toRemote() {
      return this.me;
    }
  ]
});


// TODO: Use ContextFactories to create these on demand.
foam.CLASS({
  package: 'foam.box',
  name: 'ClientBoxRegistry',

  properties: [
    {
      class: 'Stub',
      of: 'foam.box.BoxRegistry',
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'PromisedBoxRegistry',

  properties: [
    {
      class: 'Promised',
      of: 'foam.box.BoxRegistry',
      name: 'delegate'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'LookupBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.ClientBoxRegistry',
    'foam.box.LookupRetryBox'
  ],

  properties: [
    {
      name: 'name'
    },
    {
      name: 'parentBox'
    },
    {
      name: 'registry',
      transient: true,
      factory: function() {
        return this.ClientBoxRegistry.create({
          delegate: this.parentBox
        });
      }
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.registry.lookup(this.name)
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'NamedBox',

  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.box.LookupBox',
  ],

  axioms: [
    foam.pattern.Multiton.create({ property: 'name' })
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        // RetryBox(LookupBox(name, NamedBox(subName)))
        // TODO Add retry box
        return this.LookupBox.create({
          name: this.getBaseName(),
          parentBox: this.getParentBox()
        });
      }
    }
  ],

  methods: [
    function send(msg) {
      this.delegate.send(msg);
    },

    function getParentBox() {
      return this.cls_.create({
        name: this.name.substring(0, this.name.lastIndexOf('/'))
      }, this);
    },

    function getBaseName() {
      return this.name.substring(this.name.lastIndexOf('/') + 1);
    }
  ]
});

// Retry on local errors.
foam.CLASS({
  package: 'foam.box',
  name: 'RetryBox',
  properties: [
    'attempts',
    'errorBox',
    'delegate',
    'message',
    {
      name: 'maxAttempts',
      value: 3
    }
  ],
  methods: [
    function send(msg) {
      if ( this.attempts == this.maxAttempts ) {
        this.errorBox && this.errorBox.send(msg);
        return;
      }

      this.delegate.send(this.message);
    },
    function toRemote() {
      return this.errorBox;
    }
  ]
});



foam.CLASS({
  package: 'foam.box',
  name: 'ReplyBox',
  extends: 'foam.box.ProxyBox',

  imports: [
    'registry'
  ],

  properties: [
    {
      name: 'id',
      factory: function() {
        // TODO: Do these need to be long lived?
        // Someone could store a box for days and then use it
        // at that point the ID might no longer be valid.
        return foam.next$UID();
      }
    }
  ],

  methods: [
    function exportBox() {
      return this.registry.register(this.id, null, this);
    },
    function send(msg) {
      this.registry.unregister(this.id);
      this.delegate.send(msg);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RPCReturnMessage',
  extends: 'foam.box.Message',
  properties: [
    'data'
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SubscribeMessage',
  extends: 'foam.box.Message',
  properties: [
    {
      name: 'topic'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RPCReturnBox',

  implements: ['foam.box.Box'],

  requires: [
    'foam.box.RPCReturnMessage'
  ],

  properties: [
    {
      name: 'promise',
      factory: function() {
        return new Promise(function(resolve, reject) {
          this.resolve_ = resolve;
          this.reject_ = reject;
        }.bind(this));
      }
    },
    {
      name: 'resolve_'
    },
    {
      name: 'reject_'
    }
  ],

  methods: [
    function send(msg) {
      if ( ! this.RPCReturnMessage.isInstance(msg) ) {
        // TODO: error ?
        return;
      }
      this.resolve_(msg.data);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RPCMessage',
  extends: 'foam.box.Message',

  requires: [
    'foam.box.RPCReturnMessage'
  ],

  properties: [
    'name',
    'args'
  ],

  methods: [
    function call(obj) {
      var p = obj[this.name].apply(obj, this.args);
      if ( ! this.replyBox ) return;

      if ( p instanceof Promise ) {
        p.then(
          function(data) {
            // Do we need to package data into a message?
            this.replyBox.send(
              this.RPCReturnMessage.create({ data: data }));
          }.bind(this),
          function(error) {
            // TODO
          }.bind(this));
      } else {
        this.replyBox.send(this.RPCReturnMessage.create({ data: p }));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'ClientDAO',
  extends: 'foam.dao.AbstractDAO',

  properties: [
    {
      class: 'Stub',
      of: 'foam.dao.DAO',
      name: 'delegate',
      methods: [
        'put',
        'remove',
        'select',
        'removeAll',
        'find'
      ]
    }
  ]
});


foam.CLASS({
  package :'foam.box',
  name: 'InvalidMessageException',

  properties: [
    'messageType'
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'EventMessage',
  extends: 'foam.box.Message',

  properties: [
    {
      name: 'args'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'EventDispatchBox',

  implements: ['foam.box.Box'],

  requires: [
    'foam.box.EventMessage',
    'foam.box.InvalidMessageException'
  ],

  properties: [
    {
      name: 'target'
    }
  ],

  methods: [
    function send(msg) {
      if ( ! this.EventMessage.isInstance(msg) ) {
        throw this.InvalidMessageException.create({
          messageType: message.cls_.id
        });
      }

      this.target.pub.apply(this.target, msg.args);
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'DiscoverMessage',
  extends: 'foam.box.Message'
});


foam.CLASS({
  package: 'foam.box',
  name: 'SkeletonBox',

  requires: [
    'foam.box.SubscribeMessage',
    'foam.box.RPCMessage',
    'foam.box.DiscoverMessage',
    'foam.box.InvalidMessageException'
  ],

  properties: [
    {
      name: 'data'
    }
  ],

  methods: [
    function send(message) {
      if ( this.RPCMessage.isInstance(message) ) {
        message.call(this.data);
        return;
      } else if ( this.SubscribeMessage.isInstance(message) ) {
        // TODO: Unsub support
        var dest = message.replyBox;
        var args = message.topic.slice();

        args.push(function() {
          var args = Array.from(arguments);

          // Cannot serialize the subscription object.
          args.shift();

          dest.send(foam.box.EventMessage.create({
            args: args
          }));
        });

        this.data.sub.apply(this.data, args);
        return;
      }

      throw this.InvalidMessageException.create({
        messageType: message.cls_.id
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'LoggingBox',

  extends: 'foam.box.ProxyBox',

  imports: [
    'log'
  ],

  properties: [
    'name'
  ],

  methods: [
    function send(msg) {
      this.log(this.name, ":", foam.json.Network.stringify(msg));
      this.delegate && this.delegate.send(msg);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NullBox',

  implements: ['foam.box.Box']
});


// Various messages
foam.CLASS({
  package: 'foam.box',
  name: 'TextMessage',
  extends: 'foam.box.Message',

  properties: [
    'data'
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SocketBox',
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.SocketConnectBox'
  ],
  axioms: [
    foam.pattern.Multiton.create({
      property: 'address'
    })
  ],
  properties: [
    {
      name: 'address'
    },
    {
      name: 'delegate',
      factory: function() {
        return foam.box.SocketConnectBox.create({
          address: this.address
        }, this);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'SocketBox2',
  imports: [
    'socketService',
  ],
  properties: [
    {
      name: 'socket',
      transient: true,
      factory: function() {
        return new require('net').Socket();
      },
      postSet: function(_, socket) {
        socket.on('connect', this.onConnect);
        socket.on('error', this.onError);
      }
    },
    {
      class: 'String',
      name: 'address'
    },
    {
      name: 'promise',
      transient: true,
      factory: function() {
      }
    }
  ],
  axioms: [
    foam.pattern.Multiton.create({
      property: 'address'
    })
  ],
  methods: [
    function send(m) {
    }
  ],
  listeners: [
    function onConnect() {
      this.socketService.addSocket(this);
      this.send(this.RegisterSelfMessage.create({
        name: this.me.name
      }));
      this.connect.pub();
    },
    function onError() {
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'SocketConnectBox',
  extends: 'foam.box.PromisedBox',

  requires: [
    'foam.net.Socket',
    'foam.box.RawSocketBox'
  ],

  properties: [
    {
      name: 'address'
    },
    {
      name: 'delegate',
      factory: function() {
        return this.Socket.create().connectTo(this.address).then(function(s) {
          return this.RawSocketBox.create({ socket: s });
        }.bind(this));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RawSocketBox',

  properties: [
    'socket'
  ],

  methods: [
    function send(msg) {
      this.socket.write(msg);
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'SendFailedError',
  extends: 'foam.box.Message',
  properties: [
    {
      name: 'original'
    },
    {
      name: 'error'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'RegisterSelfMessage',
  extends: 'foam.box.Message',

  properties: [
    {
      class: 'String',
      name: 'name'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'RawWebSocketBox',
  properties: [
    'socket'
  ],
  methods: [
    function send(msg) {
      try {
        this.socket.send(msg);
      } catch(e) {
        if ( msg.errorBox ) msg.errorBox.send(foam.box.SendFailedError.create());
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'WebSocketBox',

  requires: [
    'foam.net.WebSocket',
    'foam.box.RegisterSelfMessage'
  ],

  imports: [
    'webSocketService',
    'me'
  ],

  axioms: [
    foam.pattern.Multiton.create({
      property: 'uri'
    })
  ],

  properties: [
    {
      name: 'uri',
    },
    {
      name: 'socket',
      factory: function() {
        var ws = this.WebSocket.create({ uri: this.uri });

        return ws.connect().then(function(ws) {

          ws.disconnected.sub(function(sub) {
            sub.destroy();
            this.socket = undefined;
          }.bind(this));

          ws.send(this.RegisterSelfMessage.create({ name: this.me.name }));
          this.webSocketService.addSocket(ws);

          return ws;
        }.bind(this));
      }
    }
  ],
  methods: [
    function send(msg) {
      this.socket.then(function(s) {
        try {
          s.send(msg);
        } catch(e) {
          this.socket = undefined;
          if ( msg.errorBox ) {
            msg.errorBox.send(foam.box.SendFailedError.create());
          }
        }
      }.bind(this), function(e) {
        if ( msg.errorBox ) {
          msg.errorBox.send(e);
        }
        this.socket = undefined;
      }.bind(this));
    }
  ]
});



foam.CLASS({
  package: 'foam.box',
  name: 'Context',

  requires: [
    'foam.box.BoxRegistryBox',
    'foam.box.NamedBox'
  ],

  exports: [
    'messagePortService',
    'socketService',
    'webSocketService',
    'registry',
    'root',
    'me'
  ],

  properties: [
    {
      name: 'messagePortService',
      factory: function() {
        var model = foam.lookup('foam.messageport.MessagePortService', true);
        if ( model ) {
          return model.create({
            delegate: this.registry
          }, this);
        }
      }
    },
    {
      name: 'socketService',
      factory: function() {
        var model = foam.lookup('foam.net.SocketService', true);
        if ( model ) {
          return model.create({
            delegate: this.registry
          }, this);
        }
      }
    },
    {
      name: 'webSocketService',
      factory: function() {
        var model = foam.lookup('foam.net.node.WebSocketService', true) ||
            foam.lookup('foam.net.WebSocketService', true);

        if ( model ) {
          return model.create({
            delegate: this.registry
          }, this);
        }
      }
    },
    {
      name: 'registry',
      factory: function() {
        return this.BoxRegistryBox.create();
      }
    },
    {
      name: 'root',
      postSet: function(_, root) {
        foam.box.NamedBox.create({ name: '' }).delegate = root;
      }
    },
    {
      name: 'me',
      factory: function() {
        var me = this.NamedBox.create({
          name: '/com/foamdev/anonymous/' + foam.uuid.randomGUID()
        });
        me.delegate = this.registry;
        return me;
      }
    }
  ]
});
