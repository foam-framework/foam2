/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Script',

  properties: [
    {
      class: 'String',
      name: 'id',
      expression: function(package, name) {
        // Can't reference 'package' directly as a local variable, it's a
        // keyword and makes Closure compiler fail to parse the expression.
        const pkg = arguments[0];
        return pkg ? pkg + '.' + name : name;
      },
    },
    {
      class: 'String',
      name: 'package'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Function',
      name: 'code'
    },
    {
      name: 'flags'
    },
    {
      class: 'StringArray',
      name: 'requires'
    },
    'order'
  ]
});
