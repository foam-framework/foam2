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
      name: 'swiftListenerMethodName',
      expression: function(swiftName) { return swiftName + '_method'; },
    },
  ],
  methods: [
    function writeToSwiftClass(cls, superAxiom) {
      if ( !this.swiftCode ) return;
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
          body: this.swiftListenerName + '(Subscription(detach: {}), [])',
          override: !!(superAxiom && superAxiom.swiftCode),
        }));
        cls.fields.push(this.Field.create({
          visibility: 'public',
          static: true,
          final: true,
          name: this.swiftAxiomName,
          type: 'MethodInfo',
          initializer: this.swiftMethodInfoInit(),
        }));
      }
      cls.method(this.Method.create({
        name: this.swiftListenerMethodName,
        body: this.swiftCode,
        args: [
          this.SwiftArgument.create({
            localName: 'sub',
            type: 'Subscription',
          }),
          this.SwiftArgument.create({
            localName: 'args',
            type: '[Any?]',
          }),
        ],
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
  Timer.scheduledTimer(
      withTimeInterval: <%= (this.isMerged ? this.mergeDelay : 30)/1000 %>,
      repeats: false) { _ in
    triggered = false
    self?.<%=this.swiftListenerMethodName%>(sub, args)
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
