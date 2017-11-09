/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.dao.DAOProperty',
  properties: [
    {
      name: 'swiftType',
      expression: function(required) {
        return '(DAO & FObject)' + (required ? '' : '?');
      },
    },
  ],
  methods: [
    function writeToSwiftClass(cls, superAxiom, parentCls) {
      this.SUPER(cls, superAxiom, parentCls);
      cls.fields.push(
        foam.swift.Field.create({
          lazy: true,
          visibility: 'public',
          name: this.swiftName + '$proxy',
          type: 'ProxyDAO',
          initializer: `
let d = __context__.create(ProxyDAO.self, args: ["delegate": ${this.swiftName}])!
_ = ${this.swiftSlotName}.sub(listener: { _, topics in
  d.delegate = topics.last as! DAO
})
return d
          `,
        })
      )
    },
  ],
});
