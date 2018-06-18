/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json.output',
  name: 'Outputter',
  properties: [
    {
      name: 'beforeKey',
      class: 'String',
      value: '"',
    },
    {
      name: 'afterKey',
      class: 'String',
      value: '"',
    },
  ],
  methods: [
    {
      name: 'outputProperty',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: 'FObject',
          name: 'o',
        },
        {
          swiftType: 'PropertyInfo',
          name: 'p',
        },
      ],
      swiftCode: function() {/*
out.append(beforeKey)
out.append(p.name)
out.append(afterKey)
out.append(":")
p.toJSON(outputter: self, out: &out, value: p.get(o))
      */},
    },
    {
      name: 'escape',
      args: [
        {
          swiftType: 'String',
          name: 'data',
        },
      ],
      swiftReturns: 'String',
      swiftCode: function() {/*
return data.replacingOccurrences(of: "\"", with: "\\\"")
      */},
    },
    {
      name: 'outputNil',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
      ],
      swiftCode: function() {/*
out.append("null")
      */},
    },
    {
      name: 'outputString',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: 'String',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
out.append("\"")
out.append(escape(data))
out.append("\"")
      */},
    },
    {
      name: 'outputBoolean',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: 'Bool',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
out.append(data ? "true" : "false")
      */},
    },
    {
      name: 'outputMap',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: '[String:Any?]',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
out.append("{")
for (i, d) in data.keys.enumerated() {
  outputString(&out, d)
  out.append(":")
  output(&out, data[d]!)
  if i < data.count - 1 { out.append(",") }
}
out.append("}")
      */},
    },
    {
      name: 'outputArray',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: '[Any?]',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
out.append("[")
for (i, d) in data.enumerated() {
  output(&out, d)
  if i < data.count - 1 { out.append(",") }
}
out.append("]")
      */},
    },
    {
      name: 'outputNumber',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: 'NSNumber',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
out.append(data.stringValue)
      */},
    },
    {
      name: 'outputDate',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out'
        },
        {
          swiftType: 'Date',
          name: 'data'
        }
      ],
      swiftCode: function() {/*
let formatter = DateFormatter()
formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
out.append("\"\(formatter.string(from: data))\"")
      */}
    },
    {
      name: 'output',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: 'Any?',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
if let data = data as? JSONOutputter {
  data.toJSON(outputter: self, out: &out)
} else if let data = data as? PropertyInfo {
  outputPropertyInfo(&out, data)
} else if let data = data as? String {
  outputString(&out, data)
} else if let data = data as? Bool {
  outputBoolean(&out, data)
} else if let data = data as? NSNumber {
  outputNumber(&out, data)
} else if let data = data as? [Any?] {
  outputArray(&out, data)
} else if let data = data as? [String:Any?] {
  outputMap(&out, data)
} else if let data = data as? Date {
  outputDate(&out, data)
} else if data == nil {
  outputNil(&out)
} else {
  NSLog("Unable to output %@", (data as AnyObject).description)
  outputNil(&out)
}
      */},
    },
    {
      name: 'outputPropertyInfo',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: 'PropertyInfo',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
out.append("{");
outputString(&out, "class");
out.append(":");
outputString(&out, "__Property__");
out.append(",");
outputString(&out, "forClass_");
out.append(":");
outputString(&out, data.classInfo.id);
out.append(",");
outputString(&out, "name");
out.append(":");
outputString(&out, data.name);
out.append("}");
      */},
    },
    {
      name: 'outputFObject',
      args: [
        {
          swiftAnnotations: ['inout'],
          swiftType: 'String',
          name: 'out',
        },
        {
          swiftType: 'FObject',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
let info = data.ownClassInfo()
out.append("{")

out.append(beforeKey)
out.append("class")
out.append(afterKey)
out.append(":")
outputString(&out, info.id)

for p in info.axioms(byType: PropertyInfo.self) {
  if !p.transient && data.hasOwnProperty(p.name) {
    out.append(",")
    outputProperty(&out, data, p)
  }
}

out.append("}");
      */},
    },
    {
      // Can't call it stringify because that method is actually inherited so
      // hacks are required to not have the args clobbered.
      name: 'swiftStringify',
      args: [
        {
          swiftType: 'FObject',
          name: 'data',
        },
      ],
      swiftReturns: 'String',
      swiftCode: function() {/*
var s = ""
output(&s, data)
return s
      */},
    },
  ]
});
