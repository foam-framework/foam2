/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'FragmentedTextFieldFragment',

  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.TextField',
        onKey: true,
        data: this.data
      }
    },
    {
      class: 'String',
      name: 'data'
    },
    {
      class: 'Int',
      name: 'maxLength'
    }
  ]
})