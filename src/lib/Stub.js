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
  name: 'Stub',
  extends: 'Property',

  properties: [
    'of',
    {
      class: 'Boolean',
      name: 'eventProxy',
      value: false
    },
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

      var replyPolicyName = this.name + 'ReplyPolicy';

      cls.installAxiom(foam.core.Property.create({
        name: replyPolicyName
      }));

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

                  var exportBox = this.registry.register2(
                    replyBox.id,
                    this[replyPolicyName],
                    replyBox
                  );

                  var ret = returnBox.promise;

                  // TODO: Move this into RPCReturnBox ?
                  if ( returns !== 'Promise' ) {
                    ret = foam.lookup(returns).create({ delegate: ret });
                  }
                }

                var msg = this.Message.create({
                  object: this.RPCMessage.create({
                    name: m.name,
                    args: Array.from(arguments)
                  })
                });

                if ( exportBox ) msg.attributes.replyBox = exportBox;

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

      if ( this.eventProxy ) {
        cls.installAxiom(foam.core.Method.create({
          name: 'sub',
          code: function() {
            this.SUPER.apply(this, arguments);

            if ( arguments.length < 2 ) {
              throw 'Currently network subscriptions must include at least one topic.';
            }

            var replyBox = this.registry.register2(
              foam.next$UID(),
              this[replyPolicyName],
              foam.box.EventDispatchBox.create({ target: this }));

            this[propName].send(this.SubscribeMessage.create({
              replyBox: replyBox,
              topic: Array.from(arguments).slice(0, -1)
            }));
          }
        }));
      }
    }
  ]
});
