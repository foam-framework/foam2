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
      getter: function() {
        return this.swiftThrows ? this.swiftCodeGenerator() : 'fatalError()';
      }
    }
  ],
  templates: [
    {
      name: 'swiftCodeGenerator',
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
  ]
});
