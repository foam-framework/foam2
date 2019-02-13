/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'PromisedMethodSwiftRefinement',
  refines: 'foam.core.PromisedMethod',
  flags: ['swift'],
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
<% if (this.swiftType) { %>
return try! method(args) as! <%=this.swiftType%>
<% } else { %>
_ = try! method(args)
<% } %>
      */},
    },
  ],
});

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'PromisedSwiftRefinement',
  refines: 'foam.core.Promised',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      factory: function() {
        return 'Future<foam_core_FObject>';
      },
    },
    {
      name: 'swiftFactory',
      value: 'return Future<foam_core_FObject>()',
    },
  ]
});
