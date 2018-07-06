/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.ProxiedMethod',
  properties: [
    {
      name: 'swiftCode',
      getter: function() {
        var args = this.swiftArgs.map(function(arg) {
          return arg.localName;
        });
        return (this.swiftReturns ? 'return ' : '') +
          (this.swiftThrows ? 'try ' : '') + 
          this.property + '.' + this.swiftName + '(' + args.join(', ') + ')';
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Proxy',
  properties: [
    {
      name: 'swiftType',
      expression: function(of) {
        return foam.lookup(of).model_.swiftName;
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.ProxySub',
  methods: [
    function writeToSwiftClass(cls) {
      return
      cls.fields.push(
        foam.swift.Field.create({
          name: `${this.prop}EventProxy_`,
          visibility: 'private',
          type: foam.core.EventProxy.model_.swiftName,
          lazy: true,
          initializer: `
return __context__.create(foam_core_EventProxy.self, args: [
  "dest": self,
  "src": ${this.prop},
])!
          `,
        })
      );
      cls.methods.push(
        foam.swift.Method.create({
          visibility: 'public',
          name: 'sub',
          override: true,
          args: [
            foam.swift.Argument.create({
              externalName: 'topics',
              localName: 'topics',
              defaultValue: '[]',
              type: '[String]',
            }),
            foam.swift.Argument.create({
              externalName: 'listener',
              localName: 'l',
              escaping: true,
              type: 'Listener',
            }),
          ],
          returnType: 'Subscription',
          body: `
${this.prop}EventProxy_.addProxy(topics)
return super.sub(topics: topics, listener: l)
          `,
        })
      );
    },
  ],
});
