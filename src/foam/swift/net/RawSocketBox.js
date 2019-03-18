/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
let msg = msg!
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
