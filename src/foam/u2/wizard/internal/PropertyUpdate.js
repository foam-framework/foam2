/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.internal',
  name: 'PropertyUpdate',
  flags: ['web'],

  properties: [
    {
      name: 'id',
      class: 'String',
      factory: function () {
        return foam.uuid.randomGUID();
      }
    },
    {
      name: 'path',
      class: 'StringArray',
      tableCellFormatter: function (value, obj, axiom) {
        this.add(value ? value.join('.') : '');
      }
    }
  ]
});
