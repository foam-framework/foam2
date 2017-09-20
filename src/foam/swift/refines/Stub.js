foam.CLASS({
  refines: 'foam.core.StubMethod',
  properties: [
    {
      name: 'swiftCode',
      expression: function(swiftName, swiftReturns, swiftArgs) {
        return this.swiftCodeGenerator();
      }
    }
  ],
  templates: [
    {
      name: 'swiftCodeGenerator',
      args: [],
      template: function() {/*
<% if (this.swiftReturns) { %>
let replyBox = ReplyBox_create([
  "delegate": RPCReturnBox_create()
])
let registeredReplyBox = (registry as! BoxRegistry).register(
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

<% if (this.swiftReturns) { %>
msg.attributes["replyBox"] = registeredReplyBox
msg.attributes["errorBox"] = registeredReplyBox
<% } %>

try? delegate.send(msg)

<% if (this.swiftReturns) { %>
  <% if (this.swiftReturns == 'Any?') { %>
return (try? (replyBox.delegate as? RPCReturnBox)?.future.get())
  <% } else { %>
if let o = (try? (replyBox.delegate as? RPCReturnBox)?.future.get()) as? <%=this.swiftReturns%> {
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
