/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.u2',
  name: 'SampleData',
  properties: [
    'id', 'name', 'value'
  ],
  methods: [
    function toSummary() { return this.id + ' ' + this.value; }
  ]
});

foam.CLASS({
  package: 'foam.demos.u2',
  name: 'SampleData2',
  properties: [
    {
      class: 'String',
      name: 'firstName',
      label: 'First name',
      gridColumns: 6,
      xxxvalidationPredicates: [
        {
          args: ['firstName'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: foam.demos.u2.FIRST_NAME
              }), 0);
          },
          errorString: 'Please enter a first name.'
        }
      ]
    },
    {
      class: 'String',
      name: 'lastName',
      label: 'Last name',
      gridColumns: 6,
      xxxvalidationPredicates: [
        {
          args: ['lastName'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: foam.demos.u2.LAST_NAME
              }), 0);
          },
          errorString: 'Please enter a last name'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.demos.u2',
  name: 'SampleData3',
  properties: [
    {
      name: 'check',
      class: 'Boolean',
      validateObj: function (check) {
        return check ? '' : 'Please check the box';
      }
    }
  ],
});

foam.CLASS({
  package: 'foam.demos.u2',
  name: 'AllViews',

  requires: [
    'foam.demos.u2.SampleData',
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.u2.MultiView',
    'foam.u2.view.ReferenceView',
    'foam.u2.layout.DisplayWidth'
   ],

  exports: [ 'sampleDataDAO', 'displayWidth' ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.layout.DisplayWidth',
      name: 'displayWidth',
      factory: function() {
        return this.DisplayWidth.VALUES
          .sort((a, b) => b.minWidth - a.minWidth)
          .find(o => o.minWidth <= window.innerWidth);
      }
    },
    {
      name: 'sampleDataDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: this.SampleData,
          daoType: 'MDAO',
          testData: [
            { id: 'key1', name: 'John',  value: 'value1' },
            { id: 'key2', name: 'John',  value: 'value2' },
            { id: 'key3', name: 'Kevin', value: 'value3' },
            { id: 'key4', name: 'Kevin', value: 'value4' },
            { id: 'key5', name: 'Larry', value: 'value5' },
            { id: 'key6', name: 'Linda', value: 'value6' }
          ]
        });
      },
      view: {
        class: 'foam.u2.MultiView',
        views: [
          {
            class: 'foam.u2.DAOList',
            rowView: { class: 'foam.demos.heroes.CitationView' }
          },
          {
            class: 'foam.u2.GroupingDAOList',
            rowView: { class: 'foam.demos.heroes.CitationView' },
            groupExpr: foam.demos.u2.SampleData.NAME
          }
        ]
      },
      xxxview: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.demos.heroes.CitationView' }
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      label: 'DAO',
      createVisibility: '',
      factory: function() { return this.sampleDataDAO; }
    },
    {
      class: 'Reference',
      of: 'foam.demos.u2.SampleData',
      name: 'reference',
      view: function(_, X) {
        return foam.u2.MultiView.create({
          views: [
            X.data.ReferenceView.create({dao: X.data.sampleDataDAO, of: X.data.SampleData}),
            foam.u2.TextField.create()
          ]
        });
      }
    },
    {
      class: 'Reference',
      of: 'foam.demos.u2.SampleData',
      name: 'referenceWithCustomObjToChoice',
      view: { class: 'foam.u2.view.ReferenceView', objToChoice: function(obj) { return [obj.id, obj.name]; } },
      targetDAOKey: 'sampleDataDAO'
    },
    {
      class: 'Int',
      name: 'defaultInt'
    },
    {
      class: 'Int',
      name: 'tooltip',
      view: { class: 'foam.u2.view.IntView', tooltip: 'Please enter a number.' }
    },
    {
      class: 'Int',
      name: 'intWithIntView',
      view: {
        class: 'foam.u2.view.IntView',
        onKey: true,
        displayWidth: 50
      }
    },
    {
      class: 'Int',
      name: 'intWithMinAndMax',
      min: 1,
      max: 5,
      value: 3,
      units: 'rating (1-5)'
    },
    {
      class: 'Int',
      name: 'intWithRangeView',
      view: {
        class: 'foam.u2.RangeView'
      }
    },
    {
      class: 'Int',
      name: 'intWithTemperatureView',
      view: {
        class: 'foam.nanos.pm.TemperatureCView'
      }
    },
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
      name: 'intWithMultiView',
      view: {
        class: 'foam.u2.MultiView',
        views: [ 'foam.u2.RangeView', 'foam.u2.IntView' ]
      }
    },
    {
      class: 'Int',
      name: 'intWithMultiViewVertical',
      view: {
        class: 'foam.u2.MultiView',
        horizontal: false,
        views: [ 'foam.u2.RangeView', { class: 'foam.u2.view.IntView', onKey: true } ]
      }
    },
    {
      class: 'Int',
      name: 'intWithDualView2',
      view: {
        class: 'foam.u2.view.DualView',
        viewa: 'foam.u2.RangeView',
        viewb: 'foam.u2.ProgressView'
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
      documentation: 'Like a Combo-Box.',
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
        size: 10,
        choices: ['Yes', 'No', 'Maybe']
      }
    },
    {
      class: 'String',
      name: 'choiceViewWithSize',
      view: {
        class: 'foam.u2.view.ChoiceView',
        size: 3,
        choices: ['Yes', 'No', 'Maybe']
      }
    },
    {
      class: 'String',
      name: 'choiceViewWithPlaceholder',
      value: 'Yes',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'placeholder',
        choices: ['Yes', 'No', 'Maybe']
      }
    },
    {
      class: 'String',
      name: 'choiceViewWithMultipleViews',
      value: 'Yes',
      view: {
        class: 'foam.u2.MultiView',
        views: [
          {
            class: 'foam.u2.view.ChoiceView',
            size: 10,
            choices: ['Yes', 'No', 'Maybe']
          },
          {
            class: 'foam.u2.view.ChoiceView',
            size: 3,
            choices: ['Yes', 'No', 'Maybe']
          },
          {
            class: 'foam.u2.view.ChoiceView',
            placeholder: 'placeholder',
            choices: ['Yes', 'No', 'Maybe']
          },
          'foam.u2.TextField'
        ]
      }
    },
    {
      class: 'String',
      name: 'choiceViewWithValues',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ [1, 'Yes'], [0, 'No'], [0.5, 'Maybe']]
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
      name: 'radioViewHorizontal',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: ['Yes', 'No', 'Maybe'],
        isHorizontal: true
      }
    },
    {
      class: 'String',
      name: 'radioViewHorizontalMoreOptions',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [1, 2, 3, 4, 5, 6, 7],
        isHorizontal: true
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
      name: 'defaultDate',
      postSet: function (o,n) { console.log('date', n); }
    },
    {
      class: 'Date',
      name: 'dateRWAndRO',
      factory: function() { return new Date(); },
      view: {
        class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.view.DateView', onKey: false },
          { class: 'foam.u2.view.DateView', onKey: false },
          { class: 'foam.u2.view.DateView', mode: foam.u2.DisplayMode.RO }
        ]
      }
    },
    {
      class: 'Date',
      name: 'dateRWAndROOnKey',
      factory: function() { return new Date(); },
      view: {
        class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.view.DateView', onKey: true },
          { class: 'foam.u2.view.ValueView' },
          { class: 'foam.u2.view.DateView', onKey: true },
          { class: 'foam.u2.view.DateView', mode: foam.u2.DisplayMode.RO }
        ]
      }
    },
    {
      class: 'DateTime',
      name: 'defaultDateTime',
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
      precision: 2,
      value: 3.1415926
    },
    {
      class: 'Double',
      name: 'defaultDouble'
    },
    {
      class: 'Float',
      name: 'multiViewFloat',
      view: {
        class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.TextField', placeholder: 'textfield', onKey: true },
          { class: 'foam.u2.FloatView', placeholder: 'floatview', onKey: true },
          { class: 'foam.u2.TextField', onKey: false },
          { class: 'foam.u2.FloatView', onKey: false },
          { class: 'foam.u2.FloatView', onKey: false, precision: 2 },
          { class: 'foam.u2.FloatView', onKey: false, precision: 2, trimZeros: false }
        ]
      }
    },
    {
      class: 'StringArray',
      name: 'defaultStringArray'
    },
    {
      class: 'StringArray',
      name: 'stringArrayRowView',
      view: { class: 'foam.u2.MultiView', views: [ 'foam.u2.view.StringArrayRowView', 'foam.u2.view.StringArrayRowView' ] },
      xxview: 'foam.u2.view.StringArrayRowView',
      factory: function() { return ['row1', 'row2', 'row3']; }
    },
    {
      class: 'FObjectArray',
      name: 'FObjectArrayMultiView',
      of: 'foam.demos.u2.SampleData',
      view: { class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.view.TitledArrayView', valueView: 'foam.demos.heroes.CitationView' },
          { class: 'foam.u2.view.FObjectArrayView', valueView: 'foam.demos.heroes.CitationView' }
        ]
      }
    },
    {
      class: 'FObjectArray',
      name: 'fobjectArray2',
      of: 'foam.demos.u2.SampleData',
      factory: function() {
        return this.sampleDataDAO.testData;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'xxxxxxx',
      of: 'foam.demos.u2.SampleData2',
      value: foam.demos.u2.SampleData2.create()
    },
    {
      class: 'FObjectArray',
      name: 'FObjectArray3MultiView',
      of: 'foam.demos.u2.SampleData2',
      view: {
        class: 'foam.u2.MultiView',
        horizontal: false,
        views: [
          {
            class: 'foam.u2.view.TitledArrayView',
            mode: 'RW',
            enableAdding: true,
            enableRemoving: true,
            defaultNewItem: '',
            title: 'Element'
          },
          {
            class: 'foam.u2.view.FObjectArrayView',
            mode: 'RW',
            enableAdding: true,
            enableRemoving: true,
            defaultNewItem: ''
          }
        ]
      },
      autoValidate: true,
      validationTextVisible: true,
      validateObj: function(FObjectArray3MultiView) {
        if ( FObjectArray3MultiView.length < 1 )
          return 'Please enter FObjectArray3MultiView information'

        for ( var i = 0; i < FObjectArray3MultiView.length; i++ ) {
          if ( FObjectArray3MultiView[i].errors_$ != null ) {
            FObjectArray3MultiView[i].errors_$.sub(this.errorsUpdate);

            return this.errorsUpdate(null, null, null, FObjectArray3MultiView[i].errors_$);
          }
        }
      }
    },
    {
      class: 'FObjectArray',
      name: 'fobjectArray4',
      of: 'foam.demos.u2.SampleData',
      view: { class: 'foam.u2.view.DAOtoFObjectArrayView', xxxdelegate: { class: 'foam.comics.InlineBrowserView' } },
      factory: function() {
        return this.sampleDataDAO.testData;
      }
    },
    {
      class: 'FObjectArray',
      name: 'TitledfobjectArray5',
      of: 'foam.demos.u2.SampleData3',
      view: {
        class: 'foam.u2.view.TitledArrayView',
        mode: 'RW',
        enableAdding: true,
        enableRemoving: true,
        defaultNewItem: '',
        title: 'Title'
      },
      autoValidate: true,
      validationTextVisible: true,
      validateObj: function(TitledfobjectArray5, TitledfobjectArray5$errors) {
        console.log('called');
        if ( TitledfobjectArray5.length < 1 )
          return 'Please enter fobjectArray5 information'
        console.log('...', TitledfobjectArray5$errors);
        return TitledfobjectArray5$errors;
      }
    },
    {
      class: 'EMail',
      name: 'defaultEMail',
      value: 'someone@somewhere.com'
    },
    {
      class: 'EMail',
      name: 'requiredEMail',
      required: true,
      value: ''
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
      class: 'Image',
      name: 'dualImageView',
      view: {
        class: 'foam.u2.MultiView',
        views: [
          'foam.u2.TextField',
          'foam.u2.view.ImageView'
        ]
      },
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
      class: 'Color',
      name: 'readOnlyColor',
      value: 'orange',
      view: 'foam.u2.view.ReadColorView'
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
      class: 'UnitValue',
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
      name: 'defaultBooleanWithLabel',
      view: { class: 'foam.u2.CheckBox', label: "Label goes here"}
    },
    {
      class: 'Boolean',
      name: 'booleanWithRadio',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, 'Yes'],
            [false, 'No']
          ],
          isHorizontal: true
        };
      }
    },
    {
      class: 'Boolean',
      name: 'booleanWithRadio2',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, 'Yes'],
            [false, 'No']
          ],
          isHorizontal: true
        };
      }
    },
    {
      class: 'String',
      name: 'htmlView',
      value: '<b>bold</b><br/><i>italic</i>',
      view: 'foam.u2.HTMLView'
    },
    {
      class: 'Map',
      name: 'map'
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
          [ 'foam.util.Timer',         'Timer' ],
          [ 'foam.core.Property',      'Property' ],
          [ 'foam.nanos.menu.DAOMenu', 'DAO' ]
        ]
      }
    },
    {
      class: 'FObjectProperty',
      name: 'finalFObjectView',
      label: 'Final FObject',
      factory: function() { return foam.util.Timer.create(); },
      view: {
        class: 'foam.u2.view.FObjectView',
        classIsFinal: true,
        choices: [
          [ 'foam.util.Timer', 'Timer' ],
          [ 'foam.core.Property', 'Property' ],
          [ 'foam.nanos.menu.DAOMenu',  'DAO'     ],
          [ 'foam.nanos.menu.SubMenu',  'SubMenu' ],
          [ 'foam.nanos.menu.TabsMenu', 'Tabs'    ]
        ]
      }
    },
    {
      class: 'FObjectProperty',
      name: 'fObjectViewWithOneChoice',
      label: 'FObjectView With One Choice',
      view: {
        class: 'foam.u2.view.FObjectView',
        choices: [
          [ 'foam.util.Timer', 'Timer' ]
        ]
      }
    },
    {
      class: 'FObjectProperty',
      name: 'fObjectViewWithChoicesValueSet',
      label: 'FObjectView With Choices (Value Set)',
      value: foam.util.Timer.create(),
      view: {
        class: 'foam.u2.view.FObjectView',
        choices: [
          [ 'foam.core.Property', 'Property' ],
          [ 'foam.util.Timer', 'Timer' ],
          [ 'foam.nanos.menu.DAOMenu',  'DAO'     ],
          [ 'foam.nanos.menu.SubMenu',  'SubMenu' ],
          [ 'foam.nanos.menu.TabsMenu', 'Tabs'    ]
        ]
      }
    },
    {
      class: 'FObjectProperty',
      name: 'fObjectViewWithChoicesAndCustomClasses',
      label: 'FObjectView With Choices and Custom Classes',
      view: {
        class: 'foam.u2.view.FObjectView',
        allowCustom: true,
        choices: [
          [ 'foam.util.Timer', 'Timer' ],
          [ 'foam.core.Property', 'Property' ],
          [ 'foam.nanos.menu.DAOMenu',  'DAO'     ],
          [ 'foam.nanos.menu.SubMenu',  'SubMenu' ],
          [ 'foam.nanos.menu.TabsMenu', 'Tabs'    ]
        ]
      }
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function (_, __ ,___, errs) {
        return errs.get();
      }
    }
  ],
})
