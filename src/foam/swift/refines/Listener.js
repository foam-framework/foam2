/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Listener',
  requires: [
    'foam.swift.Field',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftListenerName',
      expression: function(swiftName) { return swiftName + '_listener'; },
    },
    {
      class: 'String',
      name: 'swiftListenerDispatchQueue',
      value: 'DispatchQueue.main',
    },
    {
      class: 'String',
      name: 'swiftListenerMethodName',
      expression: function(swiftName) { return swiftName + '_method'; },
    },
    {
      name: 'swiftArgs',
      factory: function() {
        return [
          this.SwiftArgument.create({
            localName: 'sub',
            defaultValue: 'Subscription(detach: {})',
            type: 'Subscription',
          }),
          this.SwiftArgument.create({
            localName: 'args',
            defaultValue: '[]',
            type: '[Any?]',
          }),
        ];
      },
    },
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( !this.swiftCode ) return;
      var superAxiom = parentCls.getSuperClass().getAxiomByName(this.name);
      var override = !!(superAxiom && superAxiom.swiftCode)
      cls.field(this.Field.create({
        name: this.swiftListenerName,
        initializer: this.swiftInit(),
        type: 'Listener',
        override: override,
        lazy: true,
      }));
      if (!override) {
        cls.method(this.Method.create({
          name: this.swiftName,
          args: this.swiftArgs,
          body: this.swiftListenerName + '(sub, args)',
          override: !!(superAxiom && superAxiom.swiftCode),
        }));
        cls.fields.push(this.Field.create({
          visibility: 'public',
          static: true,
          final: true,
          name: this.swiftPrivateAxiomName,
          type: 'MethodInfo',
          initializer: this.swiftMethodInfoInit(parentCls),
        }));
        cls.methods.push(this.Method.create({
          visibility: 'public',
          class: true,
          name: this.swiftAxiomName,
          returnType: 'MethodInfo',
          body: 'return ' + this.swiftPrivateAxiomName,
          override: this.getSwiftOverride(parentCls),
        }));
        cls.fields.push(this.Field.create({
          lazy: true,
          name: this.swiftSlotName,
          initializer: this.slotInit(),
          type: foam.swift.core.Slot.model_.swiftName,
        }));
      }
      cls.method(this.Method.create({
        name: this.swiftListenerMethodName,
        body: this.swiftCode,
        args: this.swiftArgs,
        visibility: 'private',
        override: !!(superAxiom && superAxiom.swiftCode),
      }));
    },
  ],
  templates: [
    {
      name: 'swiftInit',
      args: [],
      template: function() {/*
<% if ( this.isMerged || this.isFramed ) { %>

var triggered = false
return { [weak self] sub, args in
  if triggered { return }
  triggered = true
  DispatchQueue.main.async {
    Timer.scheduledTimer(
        withTimeInterval: <%= (this.isMerged ? this.mergeDelay : 30)/1000 %>,
        repeats: false) { _ in
      triggered = false
      <%=this.swiftListenerDispatchQueue%>.async {
        self?.<%=this.swiftListenerMethodName%>(sub, args)
      }
    }
  }
} as (Subscription, [Any?]) -> Void

<% } else { %>

return { [weak self] sub, args in
  self?.<%=this.swiftListenerMethodName%>(sub, args)
} as (Subscription, [Any?]) -> Void

<% } %>
      */},
    }
  ],
});
