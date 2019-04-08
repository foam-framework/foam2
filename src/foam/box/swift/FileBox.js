/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'FileBox',
  package: 'foam.box.swift',
  implements: ['foam.box.Box'],
  requires: [
    'foam.swift.parse.json.output.Outputter',
  ],
  properties: [
    {
      swiftType: 'URL',
      name: 'path',
    },
  ],
  methods: [
    {
      name: 'send',
      swiftCode: `
let str = Outputter_create().swiftStringify(msg)!
let data = str.data(using: .utf8)!
try data.write(to: path)
      `,
    },
  ],
});
