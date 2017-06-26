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
  package: 'foam.core',
  name: 'StubMethod',
  extends: 'Method',
  properties: [
    'replyPolicyName',
    'boxPropName',
    {
      name: 'code',
      factory: function() {
        var returns = this.returns;
        var replyPolicyName = this.replyPolicyName;
        var boxPropName = this.boxPropName;
        var name = this.name;

        return function() {
          if ( returns ) {
            var replyBox = this.ReplyBox.create({
              delegate: this.RPCReturnBox.create()
            });

            var ret = replyBox.delegate.promise;

            replyBox = this.registry.register(
              replyBox.id,
              this[replyPolicyName],
              replyBox);

            // TODO: Move this into RPCReturnBox ?
            if ( returns !== 'Promise' ) {
              ret = this.lookup(returns).create({ delegate: ret });
            }
          }

          var msg = this.Message.create({
            object: this.RPCMessage.create({
              name: name,
              args: Array.from(arguments)
            })
          });

          if ( replyBox ) {
            msg.attributes.replyBox = replyBox;
            msg.attributes.errorBox = replyBox;
          }

          this[boxPropName].send(msg);

          return ret;
        };
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'StubAction',
  extends: 'Action',
  properties: [
    'replyPolicyName',
    'boxPropName',
    {
      name: 'stubMethod',
      factory: function() {
        return foam.core.StubMethod.create({
          name: this.name,
          replyPolicyName: this.replyPolicyName,
          boxPropName: this.boxPropName
        });
      }
    },
    {
      name: 'code',
      factory: function() {
        return function(ctx, action) {
          action.stubMethod.code.call(this);
        };
      }
    }
  ],
  methods: [
    function installInProto(proto) {
      proto[this.name] = this.stubMethod.code;
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'Stub',
  extends: 'Property',

  properties: [
    'of',
    {
      name: 'replyPolicyName',
      expression: function(name) {
        return name + 'ReplyPolicy'
      }
    },
    {
      class: 'StringArray',
      name: 'methods',
      factory: function() { return null; }
    },
    {
      name: 'methods_',
      expression: function(of, name, methods, replyPolicyName) {
        var cls = this.lookup(of);

        return (
          methods ?
            methods.map(function(m) { return cls.getAxiomByName(m); }) :
          cls.getAxiomsByClass(foam.core.Method).filter(function (m) { return cls.hasOwnAxiom(m.name); }) ).
          map(function(m) {
            var returns = m.returns;
            if ( m.returns && m.returns !== 'Promise' ) {
              var id = m.returns.split('.');
              id[id.length - 1] = 'Promised' + id[id.length - 1];
              returns = id.join('.');
            }

            return foam.core.StubMethod.create({
              name: m.name,
              replyPolicyName: replyPolicyName,
              boxPropName: name,
              returns: returns
            });
          });
      }
    },
    {
      class: 'StringArray',
      name: 'actions',
      factory: function() { return null; }
    },
    {
      name: 'actions_',
      expression: function(of, name, actions, replyPolicyName) {
        var cls = this.lookup(of);

        return (
          actions ? actions.map(function(a) { return cls.getAxiomByName(a); }) :
          cls.getAxiomsByClass(foam.core.Action).filter(function(m) { return cls.hasOwnAxiom(m.name); }) ).
          map(function(m) {
            return foam.core.StubAction.create({
              name: m.name,
              isEnabled: m.isEnabled,
              replyPolicyName: replyPolicyName,
              boxPropName: name
            });
          });
      }
    },
    {
      class: 'Array',
      name: 'topics',
      factory: function() { return null; }
    },
    {
      name: 'topics_',
      expression: function(of, name, topics, replyPolicyName) {
        return topics ? topics :
            foam.lookup(of).getAxiomsByClass(foam.core.Topic);
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      var model = this.lookup(this.of);
      var propName = this.name;

      cls.installAxiom(foam.core.Property.create({
        name: this.replyPolicyName,
        hidden: true
      }));

      var replyPolicyName = this.replyPolicyName;
      var topics = this.topics_;
      var SUB = model.getAxiomByName('sub');
      topics.length && SUB && cls.installAxiom(foam.core.Method.create({
        name: 'sub',
        code: function() {
          var nextTopics = topics;
          var idx = 0;
          for ( var i = 0; i < nextTopics.length; i++ ) {
            if ( nextTopics[i].name === arguments[idx] ) {
              nextTopics = nextTopics[i].topics;
              i = 0;
              idx++;
            }
          }
          if ( idx !== arguments.length - 1 )
            return SUB.code.apply(this, arguments);

          var replyBox = this.ReplyBox.create({
            delegate: this.RPCReturnBox.create()
          });

          var promise = replyBox.delegate.promise;

          replyBox = this.registry.register(
            replyBox.id,
            this[replyPolicyName],
            replyBox);

          var msg = this.Message.create({
            object: this.RPCMessage.create({
              name: 'subBox',
              args: Array.from(arguments)
            })
          });

          msg.attributes.replyBox = replyBox;
          msg.attributes.errorBox = replyBox;

          this[propName].send(msg);

          // TODO(markdittmer): This seems wrong.
          // Assumptions:
          // - This's delegate chain leads to a "raw communication box".
          // - Returned box is of the form SubBox(NamedBox()).
          //
          // Rebind returned box to "raw communication box".
          var rawBox = this.delegate;
          while ( rawBox.delegate ) rawBox = rawBox.delegate;
          promise = promise.then(function(box) {
            foam.assert(this.SubBox.isInstance(box),
                        'Stub topic bindings: Expected subBox');
            foam.assert(this.NamedBox.isInstance(box.delegate),
                        'Stub topic bindings: Expected subBox');
            box.delegate.delegate = rawBox;
            return box;
          }.bind(this));

          return this.SubscriptionStub.create({
            delegate: this.PromisedBox.create({ delegate: promise })
          });
        }
      }));

      for ( var i = 0 ; i < this.methods_.length ; i++ ) {
        cls.installAxiom(this.methods_[i]);
      }

      for ( i = 0 ; i < this.actions_.length ; i++ ) {
        cls.installAxiom(this.actions_[i]);
      }

      for ( i = 0 ; i < this.topics_.length ; i++ ) {
        cls.installAxiom(this.topics_[i]);
      }

      [
        'foam.box.Event',
        'foam.box.Message',
        'foam.box.NamedBox',
        'foam.box.PromisedBox',
        'foam.box.RPCMessage',
        'foam.box.RPCReturnBox',
        'foam.box.ReplyBox',
        'foam.box.SubBox',
        'foam.box.SubscriptionStub'
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
        'registry'
      ].map(function(s) {
        cls.installAxiom(foam.core.Import.create({
          key: s,
          name: s
        }));
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'StubClass',

  axioms: [
    foam.pattern.Multiton.create({ property: 'of' })
  ],

  requires: [
    'foam.core.Model',
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
      class: 'String',
      name: 'package',
      factory: function() { return this.of.package; }
    },
    {
      class: 'String',
      name: 'name',
      factory: function() { return `${this.of.name}Stub`; }
    },
    {
      class: 'String',
      name: 'id',
      factory: function() { return `${this.package}.${this.name}`; }
    },
    {
      class: 'FObjectProperty',
      of: 'Model',
      name: 'stubModel',
      factory: function() {
        return this.Model.create({
          package: this.package,
          name: this.name,

          properties: [
            {
              class: 'Stub',
              of: this.of.id,
              name: 'delegate'
            }
          ]
        });
      }
    },
    {
      name: 'stubCls',
      factory: function() {
        return this.buildClass_();
      }
    }
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();
    },
    function buildClass_() {
      this.stubModel.validate();
      var cls = this.stubModel.buildClass();
      cls.validate();
      this.__subContext__.register(cls);
      foam.package.registerClass(cls);

      return this.stubModel.buildClass();
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'StubFactory',

  requires: [ 'foam.core.StubClass' ],

  methods: [
    function get(cls) {
      return this.StubClass.create({ of: cls }).stubCls;
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'StubFactorySingleton',
  extends: 'foam.core.StubFactory',

  axioms: [ foam.pattern.Singleton.create() ],
});
