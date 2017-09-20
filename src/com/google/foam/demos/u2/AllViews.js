/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AllViews',

  properties: [
    {
      class: 'Boolean',
      name: 'defaultBoolean',
      label: 'CheckBox',
      view: 'foam.u2.CheckBox' // default
    },
    {
      class: 'Boolean',
      name: 'mdCheckboxBoolean',
      label: 'md.CheckBox',
      view: 'foam.u2.md.CheckBox'
    },
  ]
})
