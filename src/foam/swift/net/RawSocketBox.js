foam.CLASS({
  package: 'foam.swift.net',
  name: 'RawSocketBox',
  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.box.ReplyBox'
  ],

  imports: [
    {
      name: 'registry',
      key: 'registry',
      swiftType: 'BoxRegistry',
    },
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.net.Socket',
      name: 'socket',
    },
    {
      swiftType: 'JSONOutputter',
      name: 'outputter',
      swiftFactory: `return JSONOutputter_create()`,
    },
  ],

  classes: [
    {
      name: 'JSONOutputter',
      extends: 'foam.swift.parse.json.output.Outputter',
      requires: [ 'foam.box.ReturnBox' ],
      imports: [ 
        {
          name: 'me',
          key: 'me',
          swiftType: 'Box',
        },
      ],
      methods: [
        {
          name: 'output',
          swiftCode: `
if data as AnyObject === me as AnyObject {
  return super.output(&out, ReturnBox_create())
}
return super.output(&out, data)
          `,
        },
      ]
    }
  ],

  methods: [
    {
      name: 'send',
      swiftCode: `
let replyBox = msg.attributes["replyBox"] as? Box
if replyBox != nil {
  let export = registry.register(nil, nil, replyBox!) as! SubBox
  msg.attributes["replyBox"] = export
}
let payload = outputter.swiftStringify(msg)
socket?.write(payload)
msg.attributes["replyBox"] = replyBox
      `,
    }
  ]
});
