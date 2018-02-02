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
      view: { class: 'foam.u2.CheckBox' }// default
    },
    {
      class: 'Boolean',
      name: 'mdCheckboxBoolean',
      label: 'md.CheckBox',
      view: { class: 'foam.u2.md.CheckBox' }
    },
    {
      class: 'FObjectProperty',
      name: 'fObjectViewWithChoices',
      view: {
        class: 'foam.u2.view.FObjectView',
        choices: [
          [ 'foam.nanos.menu.DAOMenu',  'DAO'     ],
          [ 'foam.nanos.menu.SubMenu',  'SubMenu' ],
          [ 'foam.nanos.menu.TabsMenu', 'Tabs'    ]
        ]
      }
    },
    {
      class: 'FObjectProperty',
      name: 'fObjectView',
      view: { class: 'foam.u2.view.FObjectView' }
    }
  ]
})
