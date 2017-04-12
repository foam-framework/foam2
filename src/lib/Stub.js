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
              ret = foam.lookup(returns).create({ delegate: ret });
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
      name: 'methods',
      expression: function(of, name, replyPolicyName) {
        var cls = foam.lookup(of);

        return cls.getAxiomsByClass(foam.core.Method).
          filter(function (m) { return cls.hasOwnAxiom(m.name); }).
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
      name: 'actions',
      expression: function(of, name, replyPolicyName) {
        var cls = foam.lookup(of);

        return cls.getAxiomsByClass(foam.core.Action).
          filter(function(m) { return cls.hasOwnAxiom(m.name); }).
          map(function(m) {
            return foam.core.StubAction.create({
              name: m.name,
              isEnabled: m.isEnabled,
              replyPolicyName: replyPolicyName,
              boxPropName: name
            })
          });
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      var model = foam.lookup(this.of);
      var propName = this.name;

      cls.installAxiom(foam.core.Property.create({
        name: this.replyPolicyName,
        hidden: true
      }));

      for ( var i = 0 ; i < this.methods.length ; i++ ) {
        cls.installAxiom(this.methods[i]);
      }

      for ( i = 0 ; i < this.actions.length ; i++ ) {
        cls.installAxiom(this.actions[i]);
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
