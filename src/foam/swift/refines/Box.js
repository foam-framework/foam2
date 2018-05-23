/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'RPCReturnBox',
  package: 'foam.swift.box',
  implements: [ 'foam.box.Box' ],

  requires: [
    'foam.box.RPCReturnMessage'
  ],

  properties: [
    {
      swiftType: 'Future<Any?>',
      name: 'future',
      swiftFactory: 'return Future()'
    }
  ],

  methods: [
    {
      name: 'send',
      swiftCode: `
if let o = msg.object as? RPCReturnMessage {
  future.set(o.data)
  return
}
future.error(FoamError(msg.object))
      `
    }
  ]
});
