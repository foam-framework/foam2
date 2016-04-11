/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'PropertyRefinements',
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'Boolean',
      name: 'transient'
    },
    {
      class: 'Boolean',
      name: 'networkTransient',
      expression: function(transient) {
        return transient;
      }
    },
    {
      class: 'Boolean',
      name: 'storageTransient',
      expression: function(transient) {
        return transient
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'Box',
  methods: [
    function send(message) {},
    function toRemote_() { return this; }
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
    function toRemote_() {
      // TODO: Do we need a shallow clone here?
      // Or do we need to override cloning
      var m = this.cls_.create(this);
      if ( m.replyBox ) m.replyBox = m.replyBox.toRemote_();
      if ( m.errorBox ) m.errorBox = m.errorBox.toRemote_();
      return m;
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

// NOT serializable
foam.CLASS({
  package: 'foam.box',
  name: 'WindowPostMessageBox',
  implements: ['foam.box.Box'],
  properties: [
    {
      name: 'target',
      transient: true
    }
  ],
  methods: [
    function send(message) {
      // TODO: What is the right serialization?
      this.target.postMessage(foam.json.stringify(message.toRemote_()), '*');
    }
  ]
});

// Also not serializable
foam.CLASS({
  package: 'foam.box',
  name: 'WorkerPostMessageBox',
  implements: ['foam.box.Box'],
  properties: [
    {
      name: 'target',
      transient: true
    }
  ],
  methods: [
    function send(message) {
      this.target.postMessage(foam.json.stringify(message.toRemote_()));
    }
  ]
});

// TODO: this should probably import self or something
// also a better name would help.
foam.CLASS({
  package: 'foam.box',
  name: 'SelfPostMessageBox',
  implements: ['foam.box.Box'],
  methods: [
    function send(message) {
      self.postMessage(foam.json.stringify(message.toRemote_()));
    }
  ]
});

// On the local side, we need to hook the socket upto a composite box that messages
// are delivered too.  Sub box/messages can be used to dispatch to multiple local boes
// Do we export a box?  or just hook a skeleton to a socket essentially, so that RPC messages
// are handled.

//  A BoxServer, listens on a some type of input stream, and dispatches messages to a box
foam.CLASS({
  package: 'foam.box',
  name: 'BoxServer',
  properties: [
    {
      name: 'delegate'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'OnMessageBoxServer',
  imports: [
    'registry'
  ],
  exports: [
    'as server'
  ],
  properties: [
    {
      name: 'source',
      postSet: function(old, nu) {
        old && old.removeEventListener('message', this.onMessage);
        nu && nu.addEventListener('message', this.onMessage);
      }
    },
    {
      name: 'delegate'
    },
    {
      name: 'inbox_',
      factory: function() {
        return this.registry.register('INBOX');
      }
    }
  ],
  methods: [
    function inbox() {
      return this.inbox_;
    }
  ],
  listeners: [
    {
      name: 'onMessage',
      code: function(e) {
        // TODO: What is the right serialization/deserialization
        // this is unsecure since parseString currently uses eval().
        var msg = foam.json.parse(foam.json.parseString(e.data));
        this.delegate.send(msg);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'ForwardBox',
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
  name: 'RelayMessage',
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
  name: 'RelayBox',
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


HTTP Box?

WebSocket Box

*/



// a registry box of some sort
// Some form of box which responds to a SubBoxMessage, unpacks it and
// send it to the sub box

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
  ],
  methods: [
    function toRemote_() {
      var m = this.SUPER();
      m.msg = m.msg.toRemote_();
      return m;
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
  name: 'RegisterMessage',
  properties: [
    {
      class: 'String',
      name: 'path'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'UnregisterMessage',
  properties: [
    {
      class: 'String',
      name: 'path'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'NamedBox',
  implements: ['foam.box.Box'],
  imports: [
    'registry'
  ],
  properties: [
    {
      class: 'String',
      name: 'path'
    }
  ],
  methods: [
    function send(msg) {
      var subPath = this.path.substring(0, this.path.lastIndexOf("/"));
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NoSuchNameException',
  properties: [

  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'RegistryBox',
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.SubBoxMessage'
  ],
  properties: [
    {
      class: 'Map',
      name: 'registry'
    }
  ],
  methods: [
    function register(name, box) {
      if ( this.registry[name] ) {
        // TODO: Is this an error?
        throw this.NameAlreadyRegisteredException({ name: name });
      }
      return this.registry[name] = this.cls_.create({
        delegate: box
      });
    },
    function get(name) {
      if ( this.registry[name] ) {
        return Promise.resolve(this.registry[name]);
      }
      return Promise.reject(this.NoSuchNameException.create({ name: name }));
    },
    function unregister(name) {
      delete this.registry[name];
    },
    function send(msg) {
      if ( this.SubBoxMessage.isInstance(msg) ) {
        // TODO: Should this be an error?
        if ( ! this.registry[msg.name] ) return;

        this.registry[msg.name].send(msg.msg);
      } else if ( this.delegate ) {
        // TODO: Should it be an error if we have no delegate here?
        this.delegate.send(msg);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'OneShotBox',
  extends: 'foam.box.ProxyBox',
  imports: [
    'registry'
  ],
  methods: [
    function send(msg) {
      this.registry.unregister(this.id, this);
      this.delegate.send(msg)
    },
    function toRemote_() {
      return this.cls_.create({
        delegate: this.delegate.toRemote_()
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'AnonymousReplyBox',
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.SubBox'
  ],
  imports: [
    'registry',
    'server'
  ],
  properties: [
    {
      name: 'id',
      factory: function() {
        // TODO: Do these need to be long lived?
        // Someone could store a box for days and then use it
        // at that point the ID might no longer be valid.
        return {}.$UID;
      }
    }
  ],
  methods: [
    function init() {
      this.server.inbox().register(this.id, this);
    },
    function send(msg) {
      debugger;
      this.registry.unregister(this.id);
      this.delegate.send(msg);
    },
    function toRemote_() {
      return this.SubBox.create({
        name: this.id,
        delegate: this.server.inbox()
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'PromiseBox',
  properties: [
    'promise',
  ],
  methods: [
    function send(msg) {
      // TODO: Error handling
      this.promise.then(function(box) { box.send(msg); });
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

      p.then(
        function(data) {
          // Do we need to package data into a message?
          this.replyBox.send(
            this.RPCReturnMessage.create({ data: data }));
        }.bind(this),
        function(error) {
          // TODO
        }.bind(this));
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

      var methods = this.methods
          .map(function(name) { return model.getAxiomByName(name); })
          .map(function(m) {
            var m2 = foam.core.Method.create({
              name: m.name,
              returns: m.returns ? 'Promise' : '',
              code: function() {
                if ( m.returns ) {
                  var promise = this.RPCReturnBox.create();
                  var replyBox = this.AnonymousReplyBox.create({
                    delegate: promise
                  });
                }

                var msg = this.RPCMessage.create({
                  name: m.name,
                  args: foam.Array.argsToArray(arguments)
                });
                if ( replyBox ) msg.replyBox = replyBox;

                this.box.send(msg);

                return replyBox ? promise.promise : undefined;
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
        'foam.box.AnonymousReplyBox',
        'foam.box.RPCMessage',
      ].map(function(s) {
        var path = s.split('.');
        return foam.core.Requires.create({
          path: s,
          as: path[path.length - 1]
        });
      }).forEach(function(a) {
        cls.installAxiom(a);
      });

      cls.installAxiom(foam.core.Property.create({
        name: 'box'
      }));

      cls.installAxiom(foam.core.Method.create({
        name: 'init',
        code: function() {
          this.SUPER();
          var proxy = this.AnonymousReplyBox.create({
          });
          this.box.send(this.SubscribeMessage.create({
            destination: this.replyBox
          }));
        }
      }));
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'StubDAO',
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
  package: 'foam.core',
  name: 'Stub2',
  properties: [
    'of',
  ],
  axioms: [
    {
      installInClass: function(cls) {
        var oldCreate = cls.create;
        var cache = {};
        cls.create = function(args, p) {
          var key = args.of;
          if ( ! cache[key] ) {
            var model = foam.lookup(args.of);
            var methods = model.getAxiomsByClass(foam.core.Method)
                .filter(function(m) {
                  return model.hasOwnAxiom(m.name);
                })
                .map(function(m) {
                  var m2 = foam.core.Method.create({
                    name: m.name,
                    returns: m.returns ? 'Promise' : '',
                    code: function() {
                      if ( m.returns ) {
                        var promise = this.RPCReturnBox.create();
                        var replyBox = this.AnonymousReplyBox.create({
                          delegate: promise
                        });
                      }

                      var msg = this.RPCMessage.create({
                        name: m.name,
                        args: foam.Array.argsToArray(arguments)
                      });
                      if ( replyBox ) msg.replyBox = replyBox;

                      this.box.send(msg);

                      return replyBox ? promise.promise : undefined;
                    }
                  });
                  return m2;
                });

            cache[key] = foam.CLASS({
              package: model.package,
              name: model.name + 'Stub',
              requires: [
                'foam.box.RPCReturnBox',
                'foam.box.AnonymousReplyBox',
                'foam.box.RPCMessage',
              ],
              properties: [
                'box'
              ],
              methods: methods
            });
          }
          return cache[key].create(args, p);
        };
      }
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

      target.pub.apply(target, msg.args);
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
          dest.send(foam.box.EventMessage.create({
            args: foam.Array.argsToArray(arguments)
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
      this.log(msg);
      this.delegate.send(msg);
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
          s.write(msg)
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
