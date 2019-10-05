/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'Theme',

  documentation: `
    An object that specifies how the web app should look and feel. Anything that
    relates to appearance or behaviour that can be configured should be stored
    here.
  `,

  imports: [
    'theme',
  ],

  tableColumns: [
    'id',
    'priority',
    'description',
    'preview'
  ],

  constants: [
    {
      name: 'MACROS',
      value: [
        'customCSS',
        'primary1',
        'primary2',
        'primary3',
        'primary4',
        'primary5',
        'approval1',
        'approval2',
        'approval3',
        'approval4',
        'approval5',
        'warning1',
        'warning2',
        'warning3',
        'warning4',
        'warning5',
        'destructive1',
        'destructive2',
        'destructive3',
        'destructive4',
        'destructive5',
        'grey1',
        'grey2',
        'grey3',
        'grey4',
        'grey5',
        'black',
        'inputHeight',
        'inputVerticalPadding',
        'inputHorizontalPadding'
      ]
    }
  ],

  sections: [
    {
      name: 'colours',
      title: 'Colour Scheme'
    },
    {
      name: 'inputs',
      title: 'Inputs'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 70
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'String',
      name: 'appName'
    },
    {
      class: 'String',
      name: 'spid'
    },
    {
      class: 'Long',
      name: 'priority',
      documentation: `
        When multiple Theme objects could be applied to a given situation,
        this property is used to determine which one will be used.

        For example, if an application has a default Theme but a user
        copies it and modifies it to create their own Theme object, then
        when that user logs in, we could either give them their own Theme
        or the app's default Theme. Whichever Theme has the higher
        priority will be used, which in this case should be the user's custom
        Theme (assuming its priority was set to be greater than the
        default Theme's priority).
      `,
      tableWidth: 100
    },
    {
      class: 'Reference',
      targetDAOKey: 'menuDAO',
      name: 'defaultMenu',
      documentation: 'Menu user redirects to after login.',
      of: 'foam.nanos.menu.Menu'
    },
    {
      class: 'Image',
      name: 'logo',
      documentation: 'The logo to display in the application.',
      displayWidth: 60
    },
    {
      class: 'String',
      name: 'topNavigation',
      documentation: 'A custom top nav view to use.',
      value: 'foam.nanos.u2.navigation.TopNavigation',
      displayWidth: 45
    },
    {
      class: 'String',
      name: 'footerView',
      documentation: 'A custom footer view to use.',
      value: 'foam.nanos.u2.navigation.FooterView',
      displayWidth: 45
    },
    {
      class: 'String',
      name: 'customCSS',
      view: { class: 'foam.u2.tag.TextArea', rows: 16, cols: 60 },
    },
    {
      class: 'Color',
      name: 'primary1',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'primary2',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'primary3',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'primary4',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'primary5',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'approval1',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'approval2',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'approval3',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'approval4',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'approval5',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'warning1',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'warning2',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'warning3',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'warning4',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'warning5',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'destructive1',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'destructive2',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'destructive3',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'destructive4',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'destructive5',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'grey1',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'grey2',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'grey3',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'grey4',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'grey5',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'Color',
      name: 'black',
      section: 'colours',
      value: 'unset'
    },
    {
      class: 'String',
      name: 'inputHeight',
      documentation: 'Used to enforce consistent height across text-based inputs.',
      section: 'inputs',
      value: 'unset'
    },
    {
      class: 'String',
      name: 'inputVerticalPadding',
      section: 'inputs',
      value: 'unset'
    },
    {
      class: 'String',
      name: 'inputHorizontalPadding',
      section: 'inputs',
      value: 'unset'
    }
  ],

  actions: [
    {
      name: 'preview',
      tableWidth: 100,
      code: function() {
        this.theme = this;
      }
    }
  ]
});
