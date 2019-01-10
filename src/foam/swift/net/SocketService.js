/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.net',
  name: 'SocketService',

  requires: [
    'foam.box.Message',
    'foam.swift.net.Socket',
    'foam.swift.parse.json.FObjectParser',
    'foam.swift.net.RawSocketBox',
  ],

  imports: [
    {
      name: 'creationContext',
      key: 'creationContext',
      swiftType: 'Context',
    },
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'delegate',
    },
    {
      swiftType: '[String:Future<FObject>]',
      name: 'futureMap',
      swiftFactory: `return [:]`,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.parse.json.FObjectParser',
      name: 'parser',
      swiftFactory: `return FObjectParser_create()`,
    }
  ],

  methods: [
    {
      name: 'addSocket_',
      args: [
        {
          swiftType: 'Socket',
          name: 'socket',
        },
      ],
      swiftCode: `
let X = creationContext.createSubContext(args: [
  "returnBox": RawSocketBox_create(["socket": socket])
])

let messageSub = socket.message.sub(listener: { [weak self] _, args in
  guard let msgStr = args.last as? String else {
    NSLog("Received non string as last arg. Why?")
    return
  }

  guard let fobj = self?.parser?.parseString(msgStr, X) else {
    NSLog("Unable to parse msgStr: %@", msgStr)
    return
  }

  guard let msg = fobj as? Message else {
    NSLog("Got non-message %@", fobj.ownClassInfo().id)
    NSLog("Payload was %@", msgStr)
    return
  }

  try? self?.delegate?.send(msg)
})

_ = socket.disconnect.sub(listener: { s, _ in
  s.detach()
  messageSub.detach()
})
      `,
    },
    {
      name: 'getSocketBoxFuture',
      args: [
        {
          type: 'String',
          name: 'address',
        },
      ],
      swiftType: 'Future<FObject>',
      swiftCode: `
if let fut = futureMap[address] { return fut }

let fut = Future<FObject>()
futureMap[address] = fut

let socket = Socket_create()
_ = socket.connect.sub(listener: { s, _ in
  s.detach()
  self.addSocket_(socket)
  fut.set(self.RawSocketBox_create(["socket": socket]))
})
socket.connectTo(address)
return fut
      `,
    },
  ]
});
