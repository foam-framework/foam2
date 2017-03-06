/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
          swiftType: 'inout String',
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
      swiftReturnType: 'String',
      swiftCode: function() {/*
return data.replacingOccurrences(of: "\"", with: "\\\"")
      */},
    },
    {
      name: 'outputNil',
      args: [
        {
          swiftType: 'inout String',
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
          swiftType: 'inout String',
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
          swiftType: 'inout String',
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
      name: 'outputNumber',
      args: [
        {
          swiftType: 'inout String',
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
      name: 'output',
      args: [
        {
          swiftType: 'inout String',
          name: 'out',
        },
        {
          swiftType: 'Any?',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
if let data = data as? FObject {
  outputFObject(&out, data)
} else if let data = data as? String {
  outputString(&out, data)
} else if let data = data as? Bool {
  outputBoolean(&out, data)
} else if let data = data as? NSNumber {
  outputNumber(&out, data)
} else if data == nil {
  outputNil(&out)
}
      */},
    },
    {
      name: 'outputFObject',
      args: [
        {
          swiftType: 'inout String',
          name: 'out',
        },
        {
          swiftType: 'FObject',
          name: 'data',
        },
      ],
      swiftCode: function() {/*
let info = type(of:data).classInfo()
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
      swiftReturnType: 'String',
      swiftCode: function() {/*
var s = ""
output(&s, data)
return s
      */},
    },
  ]
});
