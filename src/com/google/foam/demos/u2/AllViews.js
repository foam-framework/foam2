/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AllViews',
  package: 'com.google.foam.demos.u2',

  properties: [
    {
      class: 'Int',
      name: 'defaultInt'
    },
    {
      class: 'Int',
      name: 'intWithMinAndMax',
      min: 1,
      max: 5,
      value: 3,
      units: ' rating (1-5)'
    },
    {
      class: 'Int',
      name: 'intWithRangeView',
      view: {
        class: 'foam.u2.RangeView'
      }
    },
    /*
    {
      class: 'Int',
      name: 'intWithTemperatureView',
      view: {
        class: 'foam.nanos.pm.TemperatureCView'
      }
    },
    */
    {
      class: 'Int',
      name: 'intWithProgressView',
      view: {
        class: 'foam.u2.ProgressView'
      },
      value: 42
    },
    {
      class: 'Int',
      name: 'intWithDualView',
      view: {
        class: 'foam.u2.view.DualView',
        viewa: 'foam.u2.RangeView',
        viewb: 'foam.u2.IntView'
      }
    },
    {
      class: 'String',
      name: 'defaultString'
    },
    {
      class: 'String',
      name: 'emptyRequiredString',
      validateObj: function(emptyRequiredString) { return emptyRequiredString ? '' : 'value required'; }
//      required: true
    },
    {
      class: 'String',
      name: 'requiredString',
      value: 'someValue',
      validateObj: function(requiredString) { return requiredString ? '' : 'value required'; }
//      required: true
    },
    {
      class: 'String',
      name: 'textFieldWithPlaceholder',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'placeholder'
      }
    },
    {
      class: 'String',
      name: 'textFieldWithPlaceholder2',
      placeholder: 'placeholder'
    },
    {
      class: 'String',
      name: 'textFieldWithChoices',
      view: {
        class: 'foam.u2.TextField',
        choices: ['Yes', 'No', 'Maybe']
      }
    },
    {
      class: 'String',
      name: 'choiceView',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: ['Yes', 'No', 'Maybe']
      }
    },
    {
      class: 'String',
      name: 'radioView',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: ['Yes', 'No', 'Maybe']
      }
    },
    {
      class: 'String',
      name: 'stringWithDisplayWidth',
      displayWidth: 4
    },
    {
      class: 'String',
      name: 'stringWithTextFieldWithSize',
      displayWidth: 4,
      view: {
        class: 'foam.u2.TextField',
        maxLength: 4
      }
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
      class: 'Float',
      name: 'floatWithPrecision',
      precision: 2
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
      class: 'StringArray',
      name: 'stringArrayRowView',
      view: 'foam.u2.view.StringArrayRowView',
      factory: function() { return ['row1', 'row2', 'row3']; }
    },
    {
      class: 'EMail',
      name: 'defaultEMail',
      value: 'someone@somewhere.com'
    },
    {
      class: 'Image',
      name: 'defaultImage',
      value: 'Dragon.png'
    },
    {
      class: 'Image',
      name: 'imageView',
      view: 'foam.u2.view.ImageView',
      value: 'Dragon.png'
    },
    {
      class: 'URL',
      name: 'defaultURL'
    },
    {
      class: 'Color',
      name: 'defaultColor'
    },
    {
      class: 'Password',
      name: 'defaultPassword',
      value: 'secret'
    },
    {
      class: 'Password',
      name: 'passwordView',
      view: 'foam.u2.view.PasswordView',
      value: 'secret'
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
      class: 'String',
      name: 'htmlView',
      value: '<b>bold</b><br/><i>italic</i>',
      view: 'foam.u2.HTMLView'
    },
    {
      class: 'FObjectProperty',
      name: 'defaultFObjectProperty',
      value: foam.util.Timer.create()
    },
    {
      class: 'FObjectProperty',
      name: 'fObjectView',
      label: 'FObjectView',
      view: { class: 'foam.u2.view.FObjectView' },
      value: foam.util.Timer.create()
    },
    {
      class: 'FObjectProperty',
      name: 'fObjectViewWithChoices',
      label: 'FObjectView With Choices',
      view: {
        class: 'foam.u2.view.FObjectView',
        choices: [
          [ 'foam.nanos.menu.DAOMenu',  'DAO'     ],
          [ 'foam.nanos.menu.SubMenu',  'SubMenu' ],
          [ 'foam.nanos.menu.TabsMenu', 'Tabs'    ]
        ]
      }
    }
  ]
})
