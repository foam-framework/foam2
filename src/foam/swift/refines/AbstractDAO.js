/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.dao.DAOProperty',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      expression: function(required) {
        var d = foam.dao.DAO.model_.swiftName;
        var f = foam.core.FObject.model_.swiftName;
        var o = required ? '' : '?';
        return `(${d} & ${f})${o}`;
      },
    },
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      if ( ! parentCls.hasOwnAxiom(this.name) ) return;
      this.SUPER(cls, parentCls);
      cls.fields.push(
        foam.swift.Field.create({
          lazy: true,
          visibility: 'public',
          name: this.name + '$proxy',
          type: foam.dao.ProxyDAO.model_.swiftName,
          initializer: `
let d = __context__.create(foam_dao_ProxyDAO.self, args: ["delegate": ${this.name}])!
_ = ${this.swiftSlotName}.sub(listener: { sub, topics in
  if let dao = topics.last as? foam_dao_DAO {
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
