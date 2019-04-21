/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AllViews',

  properties: [
    {
      class: 'Int',
      name: 'defaultInt'
    },
    {
      class: 'String',
      name: 'defaultString'
    },
    {
      class: 'String',
      name: 'stringWithDisplayWidth',
      displayWidth: 40
    },
    {
      class: 'String',
      name: 'stringWithTextArea',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 8, cols: 80,
      }
    },
    {
      class: 'Date',
      name: 'defaultDate'
    },
    {
      class: 'DateTime',
      name: 'defaultDateTime'
    },
    {
      class: 'Time',
      name: 'defaultTime'
    },
    {
      class: 'Byte',
      name: 'defaultByte'
    },
    {
      class: 'Short',
      name: 'defaultShort'
    },
    {
      class: 'Long',
      name: 'defaultLong'
    },
    {
      class: 'Float',
      name: 'defaultFloat'
    },
    {
      class: 'Double',
      name: 'defaultDouble'
    },
    {
      class: 'StringArray',
      name: 'defaultStringArray'
    },
    {
      class: 'EMail',
      name: 'defaultEMail'
    },
    {
      class: 'Image',
      name: 'defaultImage'
    },
    {
      class: 'URL',
      name: 'defaultURL'
    },
    {
      class: 'PhoneNumber',
      name: 'defaultPhoneNumber'
    },
    {
      class: 'Currency',
      name: 'defaultCurrency'
    },
    {
      class: 'FObjectProperty',
      name: 'defaultFObjectProperty'
    },
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
