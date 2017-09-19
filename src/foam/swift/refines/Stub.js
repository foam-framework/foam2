foam.CLASS({
  refines: 'foam.core.StubMethod',
  properties: [
    {
      name: 'swiftCode',
      expression: function(swiftName, swiftReturnType, swiftArgs) {
        return this.swiftCodeGenerator();
      }
    }
  ],
  templates: [
    {
      name: 'swiftCodeGenerator',
      args: [],
      template: function() {/*
<% if (this.swiftReturnType) { %>
let replyBox = ReplyBox_create([
  "delegate": RPCReturnBox_create()
])
let registeredReplyBox = (registry as! BoxRegistryInterface).register(
  replyBox.id,
  delegateReplyPolicy as? BoxService,
  replyBox)
<% } %>

let msg = Message_create([
  "object": RPCMessage_create([
    "name": "<%=this.swiftName%>",
    "args": [<%=this.swiftArgs.map(function(a) { return a.localName }).join(', ')%>] as [Any?],
  ]),
])

<% if (this.swiftReturnType) { %>
msg.attributes["replyBox"] = registeredReplyBox
msg.attributes["errorBox"] = registeredReplyBox
<% } %>

try? delegate.send(msg)

<% if (this.swiftReturnType) { %>
  <% if (this.swiftReturnType == 'Any?') { %>
return (try? (replyBox.delegate as? RPCReturnBox)?.future.get())
  <% } else { %>
if let o = (try? (replyBox.delegate as? RPCReturnBox)?.future.get()) as? <%=this.swiftReturnType%> {
  return o
}
fatalError()
  <% } %>
<% } %>
      */},
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Stub',
  properties: [
    {
      name: 'swiftType',
      value: 'Box',
    }
  ]
});
