/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'StubMethodSwiftRefinement',
  refines: 'foam.core.StubMethod',
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
      args: [],
      template: function() {/*
let replyBox = RPCReturnBox_create()

let msg = Message_create([
  "object": RPCMessage_create([
    "name": "<%=this.swiftName%>",
    "args": [<%=this.swiftArgs.map(function(a) { return a.localName }).join(', ')%>] as [Any?],
  ]),
])

msg.attributes["replyBox"] = replyBox

try? <%=this.boxPropName%>.send(msg)
replyBox.detach()
msg.detach()

let o = try replyBox.promise.get()
if let o = o as? Error {
  throw o
}

<% if (this.swiftType != 'Void') { %>
  <% if (this.swiftType == 'Any?') { %>
return o
  <% } else { %>
if let o = o as? <%=this.swiftType%> {
  return o
}
throw FoamError(o ?? "Failed to cast response to <%=this.swiftName%> as <%=this.swiftType%>")
  <% } %>
<% } %>
      */},
    },
  ],
});


foam.CLASS({
  package: 'foam.swift.refines',
  name: 'StubNotificationSwiftRefinement',
  refines: 'foam.core.StubNotification',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftCode',
      expression: function(swiftName, swiftType, swiftArgs, swiftThrows) {
        return swiftThrows ? this.swiftCodeGenerator() : 'fatalError()';
      }
    }
  ],
  templates: [
    {
      name: 'swiftCodeGenerator',
      args: [],
      template: function() {/*
let msg = Message_create([
  "object": RPCMessage_create([
    "name": "<%=this.swiftName%>",
    "args": [<%=this.swiftArgs.map(function(a) { return a.localName }).join(', ')%>] as [Any?],
  ]),
])
try? delegate.send(msg)
      */},
    },
  ],
});

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'StubSwiftRefinement',
  refines: 'foam.core.Stub',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      factory: function() { return foam.box.Box.model_.swiftName },
    }
  ]
});
