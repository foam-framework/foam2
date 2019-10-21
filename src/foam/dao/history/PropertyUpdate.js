/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history',
  name: 'PropertyUpdate',
  documentation: `Model containing the name of the property
    being updated, the old value, and the new value`,
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Object',
      name: 'oldValue',
      view: 'foam.u2.view.AnyView',
    },
    {
      class: 'Object',
      name: 'newValue',
      view: 'foam.u2.view.AnyView'
    }
  ]
});
