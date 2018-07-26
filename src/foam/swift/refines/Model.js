/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
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
        return foam.lookup(this.extends).model_.swiftName;
      },
    },
    {
      class: 'StringArray',
      name: 'swiftImplements',
    },
    {
      name: 'swiftImplementsCode_',
      expression: function(swiftImplements) {
        return this.swiftImplements.concat(
          ( this.implements || [] )
            .map(function(i) { return foam.lookup(i.path).model_ })
            .filter(function(i) {
              return foam.core.InterfaceModel.isInstance(i);
            })
            .map(function(i) { return i.swiftName })
        );
      },
    },
    {
      class: 'String',
      name: 'swiftCode',
    },
  ],
});
