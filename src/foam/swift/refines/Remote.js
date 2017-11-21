/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.box.Remote',
  requires: [
    'foam.swift.Method',
    'foam.swift.Argument',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftClientClass',
      expression: function(clientClass) { return clientClass },
    }
  ],
  methods: [
    function writeToSwiftClass(cls, superAxiom, parentCls) {
      cls.method(this.Method.create({
        visibility: 'public',
        override: true,
        name: 'toJSON',
        args: [
          this.Argument.create({
            localName: 'outputter',
            externalName: 'outputter',
            type: 'Outputter',
          }),
          this.Argument.create({
            localName: 'out',
            externalName: 'out',
            type: 'inout String',
          }),
        ],
        body: this.swiftCode(),
      }));
    }
  ],
  templates: [
    {
      name: 'swiftCode',
      template: `
<% var cls = this.lookup(this.clientClass) %>

let X = __subContext__
let registry = X["registry"] as! BoxRegistry

var box: Box = X.create(SkeletonBox.self, args: ["data": self])!
box = registry.register(nil, nil, box)

let obj = __context__.create(<%=cls.model_.swiftName%>.self)!
obj.delegate = box;

obj.toJSON(outputter: outputter, out: &out)
      `,
    },
  ]
});
