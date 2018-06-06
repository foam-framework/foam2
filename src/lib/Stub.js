/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
        var returns         = foam.String.isInstance(this.returns) ?
            this.returns :
            this.returns && this.returns.typeName;
        var replyPolicyName = this.replyPolicyName;
        var boxPropName     = this.boxPropName;
        var name            = this.name;

        return function() {
          var replyBox = this.RPCReturnBox.create()

          var ret = replyBox.promise;

          // Automatically wrap RPCs that return a "PromisedAbc" or similar
          // TODO: Move this into RPCReturnBox ?
          if ( returns && returns !== 'Promise' ) {
            ret = this.lookup(returns).create({ delegate: ret });
          }

          var msg = this.Message.create({
            object: this.RPCMessage.create({
              name: name,
              args: Array.from(arguments)
            })
          });

          msg.attributes.replyBox = replyBox;

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
                var returns = foam.String.isInstance(m.returns) ?
                    m.returns :
                    m.returns && m.returns.typeName ;

                if ( returns && returns !== 'Promise' ) {
                  var id = returns.split('.');
                  id[id.length - 1] = 'Promised' + id[id.length - 1];
                  returns = id.join('.');
                }

                return foam.core.StubMethod.create({
                  name: m.name,
                  replyPolicyName: replyPolicyName,
                  boxPropName: name,
                  swiftReturns: m.swiftReturns,
                  args: m.args,
                  returns: returns
                });
              });
      }
    },
    {
      class: 'StringArray',
      name: 'notifications',
      factory: function() { return null; }
    },
    {
      name: 'notifications_',
      expression: function(of, name, notifications) {
        var cls = this.lookup(of);

        return notifications && notifications.
          map(function(m) { return cls.getAxiomByName(m); }).
          map(function(m) {
            return foam.core.StubNotification.create({
              name: m.name,
              boxPropName: name,
              args: m.args
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
    ['javaType',     'foam.box.Box'],
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo']
  ],

  methods: [
    function installInClass(cls) {
      var model = this.lookup(this.of);
      var propName = this.name;

      cls.installAxiom(foam.core.Object.create({
        name: this.replyPolicyName,
        javaType: 'foam.box.BoxService',
        hidden: true
      }));

      cls.installAxioms(this.methods_);
      cls.installAxioms(this.notifications_);
      cls.installAxioms(this.actions_);

      cls.installAxioms([
        'foam.box.RPCReturnBox',
        'foam.box.ReplyBox',
        'foam.box.RPCMessage',
        'foam.box.Message'
      ].map(function(s) {
        var path = s.split('.');
        return foam.core.Requires.create({
          path: s,
          name: path[path.length - 1]
        });
      }));

      cls.installAxiom(foam.core.Import.create({
        key: 'registry',
        name: 'registry',
        javaType: 'foam.box.BoxRegistry',
      }));
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
          implements: [this.of.id],

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
  name: 'StubNotification',
  documentation: "Similar to a StubMethod but doesn't register a reply box.  Useful when you don't care whether the method evaluates successfully on the target but just want to send a notification to the target.",
  extends: 'Method',

  properties: [
    'boxPropName',
    {
      name: 'code',
      factory: function() {
        var boxPropName = this.boxPropName;
        var name        = this.name;

        return function() {
          var msg = this.Message.create({
            object: this.RPCMessage.create({
              name: name,
              args: Array.from(arguments)
            })
          });

          this[boxPropName].send(msg);

          return;
        };
      }
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
