/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json.output',
  name: 'Outputter',
  requires: [
    'foam.json2.Outputter',
  ],
  properties: [
    {
      swiftType: '((foam_core_FObject, PropertyInfo) -> Bool)',
      swiftRequiresEscaping: true,
      name: 'propertyPredicate',
      swiftValue: `{ (_: foam_core_FObject, p: PropertyInfo) -> Bool in
        return !p.transient
      }`,
    },
  ],
  methods: [
    {
      name: 'output',
      args: [
        {
          of: 'foam.json2.Outputter',
          name: 'out',
        },
        {
          swiftType: 'Any?',
          name: 'data',
        },
      ],
      swiftCode: `
if let data = data as? JSONOutputter {
  data.toJSON(outputter: self, out: out)
} else if let data = data as? ClassInfo {
  _ = out.obj()
    .key("class")
    .s("__Class__")
    .key("forClass_")
    .s(data.id)
    .end()
} else if let data = data as? PropertyInfo {
  _ = out.obj()
    .key("class")
    .s("__Property__")
    .key("forClass_")
    .s(data.classInfo.id)
    .key("name")
    .s(data.name)
    .end()
} else if let data = data as? String {
  _ = out.s(data)
} else if let data = data as? Bool {
  _ = out.b(data)
} else if let data = data as? NSNumber {
  _ = out.n(data)
} else if let data = data as? [Any?] {
  _ = out.array()
  for d in data {
    output(out, d)
  }
  _ = out.end()
} else if let data = data as? [String:Any?] {
  _ = out.obj()
  for d in data.keys {
    _ = out.key(d)
    output(out, data[d]!)
  }
  _ = out.end()
} else if let data = data as? Date {
  let formatter = DateFormatter()
  formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
  _ = out.s(formatter.string(from: data))
} else if data == nil {
  _ = out.nul()
} else {
  NSLog("Unable to output %@", (data as AnyObject).description)
  _ = out.nul()
}
      `,
    },
    {
      name: 'outputFObject',
      args: [
        {
          of: 'foam.json2.Outputter',
          name: 'out',
        },
        {
          of: 'FObject',
          name: 'data',
        },
      ],
      swiftCode: `
let info = data.ownClassInfo()
_ = out.obj()

_ = out.key("class").s(info.id)

for p in info.axioms(byType: PropertyInfo.self) {
  if !data.hasOwnProperty(p.name) { continue }
  if propertyPredicate(data, p) {
    _ = out.key(p.name)
    p.toJSON(outputter: self, out: out, value: p.get(data))
  }
}

_ = out.end()
      `,
    },
    {
      // Can't call it stringify because that method is actually inherited so
      // hacks are required to not have the args clobbered.
      name: 'swiftStringify',
      args: [
        {
          of: 'FObject',
          name: 'data',
        },
      ],
      swiftReturns: 'String',
      swiftCode: `
let s = Outputter_create()
output(s, data)
return s.out.output()
      `,
    },
  ]
});
