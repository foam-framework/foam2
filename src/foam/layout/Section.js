	/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.layout',
  name: 'Section',
  properties: [
    {
      class: 'Function',
      name: 'isAvailable',
      value: function() { return true; }
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class:  'FObjectArray',
      of: 'foam.core.Property',
      name: 'properties'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'actions'
    }
  ]
}); 
