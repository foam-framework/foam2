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
        var returns         = foam.String.isInstance(this.returns) ?
            this.returns :
            this.returns && this.returns.typeName;
        var replyPolicyName = this.replyPolicyName;
        var boxPropName     = this.boxPropName;
        var name            = this.name;

        return function() {
          if ( returns ) {
            var replyBox = this.ReplyBox.create({
              delegate: this.RPCReturnBox.create()
            });

            var errorBox = replyBox;

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
  ],
  methods: [
    function buildJavaClass(cls) {
      if ( ! this.javaSupport ) return;

      var name = this.name;
      var args = this.args;
      var boxPropName = foam.String.capitalize(this.boxPropName);
      var replyPolicyName = foam.String.capitalize(this.replyPolicyName);

      var code = `
foam.box.Message message = getX().create(foam.box.Message.class);
foam.box.RPCMessage rpc = getX().create(foam.box.RPCMessage.class);
rpc.setName("${name}");
Object[] args = { ${ args.map( a => a.name ).join(',') } };
rpc.setArgs(args);

message.setObject(rpc);`;

      if ( this.javaReturns && this.javaReturns !== "void" ) {
        code += `
foam.box.ReplyBox reply = getX().create(foam.box.ReplyBox.class);
foam.box.RPCReturnBox handler = getX().create(foam.box.RPCReturnBox.class);
reply.setDelegate(handler);

foam.box.SubBox export = (foam.box.SubBox)getRegistry().register(null, get${replyPolicyName}(), reply);
reply.setId(export.getName());

message.getAttributes().put("replyBox", export);
message.getAttributes().put("errorBox", export);

get${boxPropName}().send(message);

try {
  handler.getSemaphore().acquire();
} catch (InterruptedException e) {
  throw new RuntimeException(e);
}

Object result = handler.getMessage().getObject();
if ( result instanceof foam.box.RPCReturnMessage )
  return (${this.javaReturns})((foam.box.RPCReturnMessage)result).getData();

if ( result instanceof foam.box.RPCErrorMessage )
  throw new RuntimeException(((foam.box.RPCErrorMessage)result).getData().toString());

throw new RuntimeException("Invalid repsonse type: " + result.getClass());
`;
      } else {
        code += `get${boxPropName}().send(message);`;
      }

      this.javaCode = code;

      this.SUPER(cls);
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
            var returns = foam.String.isInstance(m.returns) ? m.returns :
                m.returns && m.returns.typeName;
            if ( returns && returns !== 'Promise' ) {
              var id = returns.split('.');
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
    ['javaType', 'foam.box.Box'],
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

      for ( var i = 0 ; i < this.methods_.length ; i++ ) {
        cls.installAxiom(this.methods_[i]);
      }

      for ( i = 0 ; i < this.actions_.length ; i++ ) {
        cls.installAxiom(this.actions_[i]);
      }

      [
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
      }).forEach(function(a) {
        cls.installAxiom(a);
      });

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
