/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'ModelSwiftRefinement',
  refines: 'foam.core.Model',
  flags: ['swift'],
  requires: [
    'foam.swift.SwiftClass',
  ],
  properties: [
    {
      class: 'String',
      name: 'swiftName',
      expression: function(id) {
        return id.replace(/\./g, '_')
      },
    },
    {
      class: 'Boolean',
      name: 'generateSwift',
      value: true,
    },
    {
      class: 'StringArray',
      name: 'swiftImports',
    },
    {
      class: 'String',
      name: 'swiftExtends',
      factory: function() {
        // TODO: This should be an expression on extends but putting extends in
        // the args makes js unhappy.
        if ( this.extends == 'FObject' ) return 'AbstractFObject';
        return this.extends.replace(/\./g, '_');
//        return foam.lookup(this.extends).model_.swiftName;
      },
    },
    {
      class: 'StringArray',
      name: 'swiftImplements',
    },
    {
      name: 'swiftAllImplements',
    },
    {
      class: 'String',
      name: 'swiftCode',
    },
  ],
});
