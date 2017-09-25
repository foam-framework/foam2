foam.CLASS({
  name: 'RPCReturnBox',
  package: 'foam.swift.box',
  implements: ['foam.box.Box'],
  requires: [
    'foam.box.RPCReturnMessage'
  ],
  properties: [
    {
      swiftType: 'Future<Any?>',
      name: 'future',
      swiftFactory: 'return Future()',
    },
  ],
  methods: [
    {
      name: 'send',
      swiftCode: function() {/*
if let o = msg.object as? RPCReturnMessage {
  future.set(o.data)
  return
}
future.error(FoamError(msg.object))
      */},
    },
  ],
});
