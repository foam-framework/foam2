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
          name: this.name + '$proxy',
          type: 'ProxyDAO',
          initializer: `
let d = __context__.create(ProxyDAO.self, args: ["delegate": ${this.name}])!
_ = ${this.swiftSlotName}.sub(listener: { sub, topics in
  if let dao = topics.last as? DAO {
    d.delegate = dao
  } else {
    d.clearProperty("delegate")
  }
})
return d
          `,
        })
      )
    },
  ],
});
