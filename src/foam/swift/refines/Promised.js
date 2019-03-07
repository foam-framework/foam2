/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'PromisedMethodSwiftRefinement',
  refines: 'foam.core.PromisedMethod',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftCode',
      getter: function() {
        return `
if !self.delegate!.hasOwnProperty("${this.property}") { self.delegate!.${this.property}Sem.wait() }
${this.swiftType != 'void' ? 'return ' : ''}${this.swiftThrows ? 'try ' : ''}self.delegate!
  .${this.name}(${this.swiftArgs.map(a => a.localName).join(', ')});
        `;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'PromisedSwiftRefinement',
  refines: 'foam.core.Promised',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      expression: function(of) {
        return foam.lookup(of).model_.swiftName;
      }
    },
    {
      name: 'swiftPostSet',
      expression: function(name, stateName) {
        return `
${stateName} = newValue
while ${name}Sem.signal() > 0 {}
        `;
      }
    }
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      this.SUPER(cls, parentCls);
      cls.field({
        name: `${this.name}Sem`,
        type: 'DispatchSemaphore',
        initializer: 'DispatchSemaphore(value: 0)'
      });
    }
  ]
});