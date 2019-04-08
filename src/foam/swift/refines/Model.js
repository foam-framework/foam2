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
        // TODO: remove this property.
        return foam.swift.toSwiftName(id);
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
        return foam.swift.toSwiftType(this.extends)
      },
    },
    {
      class: 'StringArray',
      name: 'swiftImplements',
    },
    {
      class: 'String',
      name: 'swiftCode',
    },
  ],
  methods: [
    function swiftAllImplements() {
      // Return a list of everything the model implements including swift
      // specific protocols and models that are implemented.
      return this.swiftImplements.concat(
        ( this.implements || [] )
        .filter(foam.util.flagFilter(['swift']))
        // Remove anything that's not actually an interface to avoid multiple inheritence.
        .filter(i => foam.core.InterfaceModel.isInstance(foam.lookup(i.path).model_))
        .map(function(i) {
          return foam.swift.toSwiftName(i.path)
        })
      );
    },
  ],
});
