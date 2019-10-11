/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Stub',
  extends: 'Property',
  requires: [
    'foam.box.Message',
    'foam.box.RPCMessage',
    'foam.box.RPCReturnBox',
    'foam.box.ReplyBox',
    'foam.core.StubMethod',
    'foam.core.StubNotification',
  ],
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
        var cls = this.__context__.lookup(of);

        return (
          methods ?
            methods.map(function(m) {
              var axiom = cls.getAxiomByName(m);
              foam.assert(axiom, 'Stub Error: Cannot find method name', m, 'for class', of);
              return axiom;
            }) :
          cls.getAxiomsByClass(foam.core.Method).filter(function (m) { return cls.hasOwnAxiom(m.name); }) ).
          map(function(m) {
                foam.assert(m.async || m.type == 'Void',
                            'Cannot stub non-void non-async method', m.name, 'on class', cls.id);

                return foam.core.StubMethod.create({
                  name: m.name,
                  replyPolicyName: replyPolicyName,
                  boxPropName: name,
                  type: m.type,
                  javaType: m.javaType,
                  swiftType: m.swiftType,
                  args: m.args
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
        var cls = this.__context__.lookup(of);

        return notifications && notifications.
          map(function(m) {
            var axiom = cls.getAxiomByName(m);
            foam.assert(axiom, 'Stub Error: Cannot find method name', m, 'for class', of);
            return axiom;
          }).
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
        var cls = this.__context__.lookup(of);

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
    ['type',     'foam.box.Box'],
    {
      name: 'javaInfoType',
      value: 'foam.core.AbstractFObjectPropertyInfo',
      flags: ['java'],
    },
  ],

  methods: [
    function installInClass(cls) {
      var model = this.__context__.lookup(this.of);
      var propName = this.name;

      cls.installAxiom(foam.core.Object.create({
        name: this.replyPolicyName,
        type: 'foam.box.BoxService',
        hidden: true
      }));

      cls.installAxioms(this.methods_);
      cls.installAxioms(this.notifications_);
      cls.installAxioms(this.actions_);

      cls.installAxioms([
        'foam.box.RPCReturnBox',
        'foam.box.ReplyBox',
        'foam.box.RPCMessage',
        'foam.box.OneTimeBox',
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
        type: 'foam.box.BoxRegistry',
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
  ],
  methods: [
    {
      name: 'buildJavaClass',
      flags: [ 'java' ],
      code: function buildJavaClass(cls) {
        if ( ! this.javaSupport ) return;

        var name = this.name;
        var args = this.args;
        var boxPropName = foam.String.capitalize(this.boxPropName);

        var code =
`foam.box.Message message = getX().create(foam.box.Message.class);
foam.box.RPCMessage rpc = getX().create(foam.box.RPCMessage.class);
rpc.setName("${name}");
Object[] args = { ${ args.map( a => a.name ).join(',') } };
rpc.setArgs(args);

message.setObject(rpc);
get${boxPropName}().send(message);
`;

        this.javaCode = code;

        this.SUPER(cls);
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
