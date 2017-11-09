/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.PromisedMethod',
  properties: [
    {
      name: 'swiftCode',
      expression: function(swiftName, property, swiftReturns, swiftArgs, swiftThrows) {
        return swiftThrows ? this.swiftCodeGenerator() : 'fatalError()';
      }
    }
  ],
  templates: [
    {
      name: 'swiftCodeGenerator',
      args: [],
      template2: ``,
      template: function() {/*
let delegate = try! self.obj.<%=this.property%>.get()
let method = delegate.getSlot(key: "<%=this.swiftName%>")!.swiftGet() as! MethodSlotClosure
let args = [<%=this.swiftArgs.map(function(a) { return a.localName }).join(', ')%>] as [Any?]
<% if (this.swiftReturns) { %>
return try! method(args) as! <%=this.swiftReturns%>
<% } else { %>
_ = try! method(args)
<% } %>
      */},
    },
  ],
  methods: [
  ],
});

foam.CLASS({
  refines: 'foam.core.Promised',
  properties: [
    {
      name: 'swiftType',
      value: 'Future<FObject>',
    },
    {
      name: 'swiftFactory',
      value: 'return Future<FObject>()',
    },
    {
      name: 'swiftPostSet',
      expression: function(name) {
        return `
clearProperty("${name}State")
clearProperty("${name}Delegate")
DispatchQueue.global(qos: .background).async {
  self.${name}Delegate = try? newValue.get()
}
        `;
      },
    },
  ]
});
