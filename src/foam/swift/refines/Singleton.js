/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.pattern.Singleton',
  flags: ['swift'],
  requires: [
    'foam.swift.Field',
  ],
  methods: [
    function writeToSwiftClass(cls, parentCls) {
      var classInfo = cls.getClass('ClassInfo_');
      classInfo.fields.push(this.Field.create({
        visibility: 'private',
        type: foam.core.FObject.model_.swiftName + '?',
        name: 'instance',
      }));
      classInfo.getMethod('create').body = `
if instance == nil {
  instance = ${parentCls.model_.swiftName}(args, x)
}
return instance!
      `;
    },
  ],
});
