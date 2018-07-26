/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.pattern.Multiton',
  flags: ['swift'],
  requires: [
    'foam.swift.Field',
    'foam.swift.Method',
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      var classInfo = cls.getClass('ClassInfo_');
      var property = parentCls.getAxiomByName(this.property);
      classInfo.fields.push(foam.swift.Field.create({
        defaultValue: '[:]',
        lazy: true,
        type: `[${property.swiftType}:${foam.core.FObject.model_.swiftName}]`,
        name: 'multitonMap',
      }));
      classInfo.fields.push(foam.swift.Field.create({
        defaultValue: `${property.swiftAxiomName}()`,
        lazy: true,
        type: 'PropertyInfo',
        name: 'multitonProperty',
      }));
      classInfo.getMethod('create').body = `
if let key = args[multitonProperty.name] as? ${property.swiftType},
   let value = multitonMap[key] {
  return value
} else {
  let value = ${parentCls.model_.swiftName}(args, x)
  if let key = multitonProperty.get(value) as? ${property.swiftType} {
    multitonMap[key] = value
  }
  return value
}
      `;
    },
  ],
});
