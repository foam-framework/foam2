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

  tableColumns: [
    'id',
    'priority',
    'description',
    'preview'
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
      class: 'Image',
      name: 'largeLogo',
      documentation: 'A large logo to display in the application.',
      displayWidth: 60
    },
    {
      class: 'Boolean',
      name: 'largeLogoEnabled',
      documentation: 'Uses largeLogo image on various views instead of logo.'
    },
    {
      class: 'Color',
      name: 'logoBackgroundColour',
      documentation: 'The logo background colour to display in the application.',
      section: 'colours'
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
      class: 'Code',
      name: 'customCSS'
    },
    {
      class: 'Color',
      name: 'primary1',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'primary2',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'primary3',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'primary4',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'primary5',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'approval1',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'approval2',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'approval3',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'approval4',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'approval5',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'warning1',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'warning2',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'warning3',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'warning4',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'warning5',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'destructive1',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'destructive2',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'destructive3',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'destructive4',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'destructive5',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'grey1',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'grey2',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'grey3',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'grey4',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'grey5',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'black',
      section: 'colours'
    },
    {
      class: 'String',
      name: 'inputHeight',
      documentation: 'Used to enforce consistent height across text-based inputs.',
      section: 'inputs'
    },
    {
      class: 'String',
      name: 'inputVerticalPadding',
      section: 'inputs'
    },
    {
      class: 'String',
      name: 'inputHorizontalPadding',
      section: 'inputs'
    }
  ],

  actions: [
    {
      name: 'preview',
      tableWidth: 100,
      code: function(X) {
        X.ctrl.theme = this;
      }
    }
  ]
});
