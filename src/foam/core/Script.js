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
        return package ? package + '.' + name : name;
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
    }
  ]
});
