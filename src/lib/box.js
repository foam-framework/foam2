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
      name: 'delegate'
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'Stub',
  extends: 'Property',
  properties: [
    'of',
    'replyBox',
    {
      name: 'methods',
      expression: function(of) {
        var cls = foam.lookup(of);

        if ( cls ) {
          return cls.getAxiomsByClass(foam.core.Method)
            .filter(function (m) { return cls.hasOwnAxiom(m.name); })
            .map(function(m) { return m.name; })
        }
      }
    }
  ],
  methods: [
    function installInClass(cls) {
      var model = foam.lookup(this.of);
      var propName = this.name;

      var methods = this.methods
          .map(function(name) { return model.getAxiomByName(name); })
          .map(function(m) {
            var returns = m.returns;
            if ( m.returns && m.returns !== 'Promise' ) {
              var name = m.returns.split('.');
              name[name.length - 1] = 'Promised' + name[name.length - 1];
              returns = name.join('.');
            }

            var m2 = foam.core.Method.create({
              name: m.name,
              returns: returns,
              code: function() {
                if ( returns ) {
                  var returnBox = this.RPCReturnBox.create();
                  var replyBox = this.ReplyBox.create({
                    delegate: returnBox
                  });

                  var ret = returnBox.promise;

                  // TODO: Move this into RPCReturnBox ?
                  if ( returns !== 'Promise' ) {
                    ret = foam.lookup(returns).create({ delegate: ret });
                  }
                }

                var msg = this.RPCMessage.create({
                  name: m.name,
                  args: foam.Array.argsToArray(arguments)
                });
                if ( replyBox ) msg.replyBox = replyBox.exportBox();

                this[propName].send(msg);

                return ret;
              }
            });
            return m2;
          });

      for ( var i = 0 ; i < methods.length ; i++ ) {
        cls.installAxiom(methods[i]);
      }


      [
        'foam.box.SubscribeMessage',
        'foam.box.OneShotBox',
        'foam.box.RPCReturnBox',
        'foam.box.ReplyBox',
        'foam.box.RPCMessage',
      ].map(function(s) {
        var path = s.split('.');
        return foam.core.Requires.create({
          path: s,
          name: path[path.length - 1]
        });
      }).forEach(function(a) {
        cls.installAxiom(a);
      });

      [
      ].map(function(s) {
        cls.installAxiom(foam.core.Imports.create({
          key: s,
          name: s
        }));
      });


      cls.installAxiom(foam.core.Method.create({
        name: 'init',
        code: function() {
          this.SUPER();

          // var events = foam.next$UID();

          // this.server.inbox().subBox(
          //   events,
          //   foam.box.EventDispatchBox.create({
          //     target: this
          //   }));

          // this[propName].send(this.SubscribeMessage.create({
          //   destination: foam.box.SubBox.create({
          //     name: events,
          //     delegate: this.server.inbox()
          //   })
          // }));
        }
      }));
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
  implements: ['foam.box.Box'],
  imports: [
    'messagePortService'
  ],
  properties: [
    {
      name: 'id'
    }
  ],
  methods: [
    function send(msg) {
      // TODO: Improved serialization
      this.messagePortService
        .getPortForDst(this.id)
        .send(foam.json.stringify(msg));
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'EchoBox',
  implements: ['foam.box.Box'],
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
  extends: 'foam.box.Message',
  properties: [
    {
      name: 'nextBox'
    },
    {
      name: 'msg'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'ForwardBox',
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.RelayMessage'
  ],
  methods: [
    function send(msg) {
      if ( this.RelayMessage.isInstance(msg) ) {
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
  extends: 'foam.box.Message',
  properties: [
    {
      name: 'name'
    },
    {
      name: 'msg'
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
        msg: msg
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
    'foam.box.SubBox'
  ],
  properties: [
    {
      name: 'registry',
      factory: function() { return {}; }
    },
    {
      name: 'me'
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
            this.registry[msg.name].localBox.send(msg.msg);
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
  requires: [
    'foam.box.ClientBoxRegistry'
  ],
  imports: [
    'root'
  ],
  properties: [
    {
      name: 'name',
    },
    {
      name: 'parentBox',
    },
    {
      name: 'registry',
      factory: function() {
        return this.ClientBoxRegistry.create({
          delegate: this.parentBox
        });
      }
    },
    {
      name: 'promise',
      factory: function() {
        if ( this.name === '' ) {
          return this.root;
        }
        return this.registry.lookup(this.name);
      }
    }
  ],
  methods: [
    function send(msg) {
      this.promise.send(msg);
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
      // TODO: Unregister
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
    'destination'
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
  name: 'SkeletonBox',
  requires: [
    'foam.box.SubscribeMessage',
    'foam.box.RPCMessage',
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
        var dest = message.destination;
        this.data.sub(function() {
          var args = Array.from(arguments);

          // Cannot serialize the subscription object.
          args.shift();

          dest.send(foam.box.EventMessage.create({
            args: args
          }));
        });
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
      this.log(this.name, ":", foam.json.stringify(msg));
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
  implements: ['foam.box.Box'],
  imports: [
    'socketService'
  ],
  properties: [
    'host',
    'port'
  ],
  methods: [
    function send(msg) {
      this.socketService.getSocket(this.host, this.port).then(
        function(s) {
          s.write(foam.json.stringify(msg))
        },
        function(e) {
          // TODO: Handle error
        });
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'WebSocketBox',
  imports: [
    'webSocketService'
  ],
  properties: [
    'uri'
  ],
  methods: [
    function send(msg) {
      this.webSocketService.getSocket(this.uri).then(function(s) {
        s.send(foam.json.stringify(msg));
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.messaging',
  name: 'MessagePort',
  properties: [
    {
      name: 'port',
      postSet: function(old, port) {
        if ( old ) {
          old.onmessage = null;
        }
        if ( port ) {
          //          port.addEventListener('message', this.onMessage);
          // The onmessage setter starts the port, so use that instead of addEventListener
          port.onmessage = this.onMessage;
        }
      }
    },
    {
      name: 'id'
    }
  ],
  topics: [
    'message'
  ],
  methods: [
    function send(msg) {
      this.port.postMessage(msg);
    }
  ],
  listeners: [
    function onMessage(e) {
      var msg = foam.json.parse(foam.json.parseString(e.data), undefined, this);
      this.message.pub(msg);
    }
  ]
});

foam.CLASS({
  package: 'foam.messaging',
  name: 'MessagePortService',
  requires: [
    'foam.messaging.MessagePort',
    'foam.box.MessagePortBox'
  ],
  properties: [
    {
      class: 'Map',
      name: 'portsBySrc'
    },
    {
      class: 'Map',
      name: 'portsByDst'
    },
    {
      name: 'delegate'
    },
    {
      name: 'source'
    },
    {
      name: 'inbox_',
      factory: function() {
        this.MessagePortBox.create({
          id: this.$UID
        });
      }
    }
  ],
  topics: [
    'connected'
  ],
  methods: [
    function start() {
      this.source.addEventListener('message', this.onConnect);
    },
    function inbox() {
      return this.inbox_;
    },
    function connect(target) {
      var channel = new MessageChannel();

      target.postMessage({
        type: 'CONNECT',
        port: channel.port2
      }, [channel.port2]);

      var port = channel.port1;
      return new Promise(foam.Function.bind(function(resolve, reject) {
        port.onmessage = foam.Function.bind(function(e) {
          if ( e.data && e.data.type === "ID" ) {
            this.inbox_ = this.MessagePortBox.create({
              id: e.data.youAre
            });

            this.addPort(this.MessagePort.create({
              port: port,
              id: e.data.iAm
            }));

            resolve(this.MessagePortBox.create({
              id: e.data.iAm
            }));
          }
        }, this);
      }, this));
    },
    function getPortForDst(id) {
      return this.portsByDst[id];
    },
    function addPort(port) {
      this.portsByDst[port.id] = port;
      port.message.sub(this.onMessage);
      this.connected.pub(port.id);
    }
  ],
  listeners: [
    function onConnect(e) {
      if ( e.data && e.data.type == 'CONNECT' ) {
        var port = e.ports[0];
        var resp = {
          type: 'ID',
          youAre: foam.next$UID(),
          iAm: this.$UID
        };
        this.addPort(this.MessagePort.create({
          port: port,
          id: resp.youAre
        }));
        port.postMessage(resp);
      }
    },
    function onMessage(s, _, msg) {
      if ( this.delegate ) {
        this.delegate.send(msg);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.messaging',
  name: 'SharedWorkerMessagePortService',
  extends: 'foam.messaging.MessagePortService',
  methods: [
    function start() {
      this.source.onconnect = function(e) {
        var port = e.ports[0];
        port.onmessage = this.onConnect;
      }.bind(this);
      this.inbox_ = this.MessagePortBox.create({
        id: this.$UID
      });
    }
  ]
});
