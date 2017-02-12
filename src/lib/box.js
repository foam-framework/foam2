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

foam.INTERFACE({
  package: 'foam.box',
  name: 'Box',

  methods: [
    {
      name: 'send',
      args: [
        'message'
      ]
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
  name: 'ProxyBox',
  implements: ['foam.box.Box'],

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
  name: 'Message',

  properties: [
    {
      class: 'Map',
      name: 'attributes'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      name: 'object'
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'SubBoxMessage',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      name: 'object'
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
    {
      class: 'String',
      name: 'name'
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(msg) {
        msg.object = this.SubBoxMessage.create({
          name: this.name,
          object: msg.object
        });
        this.delegate.send(msg);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NameAlreadyRegisteredException',

  properties: [
    {
      class: 'String',
      name: 'name'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'NoSuchNameException',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'message',
      expression: function(name) {
        return 'Could not find registration for ' + name;
      }
    }
  ]
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

  classes: [
    {
      name: 'Registration',
      properties: [
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'exportBox'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          name: 'localBox'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'doLookup',
      returns: 'foam.box.Box',
      code: function doLookup(name) {
        if ( this.registry[name] &&
             this.registry[name].exportBox )
          return this.registry[name].exportBox;

        throw this.NoSuchNameException.create({ name: name });
      },
      args: [
        'name'
      ]
    },
    {
      name: 'register',
      returns: 'foam.box.Box',
      code: function(name, service, localBox) {
        var exportBox = this.SubBox.create({ name: name, delegate: this.me });
        exportBox = service ? service.clientBox(exportBox) : exportBox;

        this.registry[name] = {
          exportBox: exportBox,
          localBox: service ? service.serverBox(localBox) : localBox
        };

        return this.registry[name].exportBox;
      },
      args: [ 'name', 'service', 'box' ]
    },
    {
      name: 'unregister',
      returns: '',
      code: function(name) {
        delete this.registry[name];
      },
      args: [
        'name'
      ]
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
        if ( this.SubBoxMessage.isInstance(msg.object) ) {
          if ( this.registry[msg.object.name].localBox ) {
            this.registry[msg.object.name].localBox.send(msg.object.object);
          } else {
            // TODO: Error case if no sub box found
          }
        } else {
          this.registrySkeleton.send(msg);
        }
      }
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
        return this.registry.doLookup(this.name)
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
    function send(msg) {
      this.registry.unregister(this.id);
      this.delegate.send(msg);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RPCReturnMessage',
  properties: [
    {
      class: 'Object',
      name: 'data'
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'SubscribeMessage',
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
      if ( this.RPCReturnMessage.isInstance(msg) ) {
        this.resolve_(msg.data);
        return;
      }
      this.reject_(msg);
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'RPCMessage',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Array',
      name: 'args'
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
      eventProxy: true,
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
  package: 'foam.dao',
  name: 'EventlessClientDAO',
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
      ],
      eventProxy: false
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PollingClientDAO',
  extends: 'foam.dao.EventlessClientDAO',
  requires: [
    'foam.dao.ArraySink'
  ],
  methods: [
    function put(obj) {
      var self = this;
      return this.SUPER(obj).then(function(o) {
        self.on.put.pub(o);
        return o;
      });
    },

    function remove(obj) {
      var self = this;
      return this.SUPER(obj).then(function(o) {
        self.on.remove.pub(obj);
        return o;
      });
    },

    function select(sink, skip, limit, order, predicate) {
      // TODO: Determine which sinks are serializable.
      sink = sink || this.ArraySink.create();

      var self = this;
      return this.SUPER(null, skip, limit, order, predicate).then(function(a) {
        var fc = self.FlowControl.create();

        for ( var i = 0 ; i < a.a.length ; i++ ) {
          if ( fc.stopped ) break;
          if ( fc.errorEvt ) {
            sink.error(fc.errorEvt);
            throw fc.errorEvt;
          }

          sink.put(a.a[i], fc);
        }

        sink.eof();

        return sink;
      });
    },

    function removeAll(skip, limit, order, predicate) {
      this.SUPER(skip, limit, order, predicate);
      this.on.reset.pub();
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
      class: 'Array',
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
      if ( ! this.EventMessage.isInstance(msg.object) ) {
        throw this.InvalidMessageException.create({
          messageType: message.cls_.id
        });
      }

      this.target.pub.apply(this.target, msg.object.args);
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'SkeletonBox',

  requires: [
    'foam.box.Message',
    'foam.box.SubscribeMessage',
    'foam.box.EventMessage',
    'foam.box.RPCMessage',
    'foam.box.RPCReturnMessage',
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
          object: e
        }));

        return;
      }

      var replyBox = message.attributes.replyBox;

      if ( p instanceof Promise ) {
        p.then(
          function(data) {
            // Do we need to package data into a message?
            replyBox.send(this.Message.create({
              object: this.RPCReturnMessage.create({ data: data })
            }));
          },
          function(error) {
            // TODO
            message.attributes.errorBox && message.attributes.errorBox.send(
              this.Message.create({
                object: error
              }));
          });
      } else {
        replyBox.send(this.Message.create({
          object: this.RPCReturnMessage.create({ data: p })
        }));
      }
    },

    function send(message) {
      if ( this.RPCMessage.isInstance(message.object) ) {
        this.call(message);
        return;
      } else if ( this.SubscribeMessage.isInstance(message.object) ) {
        // TODO: Unsub support
        var dest = message.attributes.replyBox;
        var args = message.object.topic.slice();

        var self = this;

        args.push(function() {
          var args = Array.from(arguments);

          // Cannot serialize the subscription object.
          args.shift();

          dest.send(self.Message.create({
            object: self.EventMessage.create({
              args: args
            })
          }));
        });

        this.data.sub.apply(this.data, args);
        return;
      }

      throw this.InvalidMessageException.create({
        messageType: message.cls_ && message.cls_.id
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'NullBox',

  implements: ['foam.box.Box'],

  methods: [
    {
      name: 'send',
      code: function() {}
    }
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
  name: 'RawMessagePortBox',
  implements: [ 'foam.box.Box' ],
  properties: [
    {
      name: 'port'
    }
  ],
  methods: [
    function send(m) {
      this.port.postMessage(foam.json.Network.stringify(m));
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'WebSocketBox',

  requires: [
    'foam.net.WebSocket',
    'foam.box.Message',
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
            sub.detach();
            this.socket = undefined;
          }.bind(this));

          ws.send(this.Message.create({
            object: this.RegisterSelfMessage.create({ name: this.me.name })
          }));

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
      class: 'String',
      name: 'myname'
    },
    {
      name: 'me',
      factory: function() {
        var me = this.NamedBox.create({
          name: this.myname || ( '/com/foamdev/anonymous/' + foam.uuid.randomGUID() )
        });
        me.delegate = this.registry;
        return me;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'BoxService',

  properties: [
    {
      class: 'Class',
      name: 'server'
    },
    {
      class: 'Class',
      name: 'client'
    }
  ],
  methods: [
    function serverBox(box) {
      box = this.next ? this.next.serverBox(box) : box;
      return this.server.create({ delegate: box })
    },

    function clientBox(box) {
      box = this.client.create({ delegate: box });
      return this.next ?
        this.next.clientBox(box) :
        box;
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'HTTPReplyBox',
  implements: ['foam.box.Box'],

  imports: [
    // Optional import.
    //    'httpResponse'
  ],

  methods: [
    {
      name: 'send',
      code: function(m) {
        throw 'unimplemented';
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'AuthenticatedBox',
  extends: 'foam.box.ProxyBox',
  imports: [
    'idToken'
  ],
  methods: [
    function send(m) {
      m.attributes.idToken = this.idToken;
      this.SUPER(m);
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'CheckAuthenticationBox',
  extends: 'foam.box.ProxyBox',
  imports: [
    'tokenVerifier'
  ],
  methods: [
    {
      name: 'send',
      code: function send() {
        throw new Error('Unimplemented.');
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'HTTPBox',

  implements: ['foam.box.Box'],

  requires: [
    'foam.net.HTTPRequest'
  ],

  imports: [
    'me'
  ],

  properties: [
    {
      name: 'url'
    },
    {
      name: 'method'
    }
  ],

  classes: [
    {
      name: 'JSONOutputter',
      extends: 'foam.json.Outputer',
      requires: [
        'foam.box.HTTPReplyBox'
      ],
      imports: [
        'me'
      ],
      methods: [
        function output(o) {
          if ( o === this.me ) {
            return this.SUPER(this.HTTPReplyBox.create());
          }
          return this.SUPER(o);
        }
      ]
    }
  ],

  methods: [
    {
      name: 'send',
      code: function(msg) {
        var outputter = this.JSONOutputter.create().copyFrom(foam.json.Network);

        var req = this.HTTPRequest.create({
          url: this.url,
          method: this.method,
          payload: outputter.stringify(msg)
        }).send();

        req.then(function(resp) {
          return resp.payload;
        }).then(function(p) {
          this.me.send(foam.json.parseString(p, this));
        }.bind(this));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.box',
  name: 'MessagePortBox',
  extends: 'foam.box.ProxyBox',
  requires: [
    'foam.box.RawMessagePortBox',
    'foam.box.RegisterSelfMessage',
    'foam.box.Message'
  ],
  imports: [ 'messagePortService', 'me' ],
  properties: [
    {
      name: 'target'
    },
    {
      name: 'delegate',
      factory: function() {
	var channel = new MessageChannel();
	this.messagePortService.addPort(channel.port1);

	this.target.postMessage('', '*', [channel.port2]);

        channel.port1.postMessage(foam.json.Network.stringify(this.Message.create({
          object: this.RegisterSelfMessage.create({ name: this.me.name })
        })));

	return this.RawMessagePortBox.create({ port: channel.port1 });
      }
    }
  ]
});
