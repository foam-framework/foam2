/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.box.RPCReturnBox',
  implements: [ 'foam.box.Box' ],

  properties: [
    {
      swiftType: 'Future<Any?>',
      name: 'promise',
      swiftFactory: 'return Future()'
    }
  ],

  methods: [
    {
      name: 'send',
      swiftCode: `
if let o = msg.object as? foam_box_RPCReturnMessage {
  promise.set(o.data)
  return
}
promise.error(FoamError(msg.object))
      `
    }
  ]
});
