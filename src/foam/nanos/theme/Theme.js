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

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  tableColumns: [
    'enabled',
    'name',
    'description',
    'domains',
    'priority',
    'preview'
  ],

  sections: [
    {
      name: 'infoSection',
      title: 'Info'
    },
    {
      name: 'urlMapping',
      title: 'URL Mapping'
    },
    {
      name: 'colours',
      title: 'Colours'
    },
    {
      name: 'images',
      title: 'Icons / Images'
    },
    {
      name: 'sectionCss',
      title: 'CSS'
    },
    {
      name: 'navigation',
      title: 'Navigation'
    },
    {
      name: 'inputs',
      title: 'Inputs'
    },
    {
      name: 'applicationSection',
      title: 'Application'
    },
    {
      name: 'administration'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      includeInDigest: true,
      section: 'infoSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'name',
      section: 'infoSection',
    },
    {
      // deprecated
      class: 'String',
      name: 'appName',
      section: 'infoSection',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'description',
      section: 'infoSection',
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true,
      includeInDigest: true,
      section: 'administration'
    },
    {
      class: 'Long',
      name: 'priority',
      includeInDigest: true,
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
      section: 'infoSection'
    },
    {
      name: 'domains',
      class: 'Array',
      of: 'String',
      factory: function(){
        return  ['localhost'];
      },
      javaFactory: 'return new String[] { "localhost" };',
      includeInDigest: true,
      section: 'urlMapping'
    },
    {
      class: 'Reference',
      targetDAOKey: 'menuDAO',
      name: 'defaultMenu',
      documentation: 'Menu user redirects to after login.',
      of: 'foam.nanos.menu.Menu',
      section: 'navigation'
    },
    {
      class: 'Image',
      name: 'logo',
      documentation: 'The logo to display in the application.',
      displayWidth: 60,
      section: 'images'
    },
    {
      class: 'Image',
      name: 'largeLogo',
      documentation: 'A large logo to display in the application.',
      displayWidth: 60,
      section: 'images'
    },
    {
      class: 'Boolean',
      name: 'largeLogoEnabled',
      documentation: 'Uses largeLogo image on various views instead of logo.',
      section: 'images'
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
      displayWidth: 45,
      section: 'navigation'
    },
    {
      class: 'String',
      name: 'footerView',
      documentation: 'A custom footer view to use.',
      value: 'foam.nanos.u2.navigation.FooterView',
      displayWidth: 45,
      section: 'navigation'
    },
    {
      class: 'Code',
      name: 'customCSS',
      section: 'sectionCss'
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
    },
    {
      name: 'appConfig',
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.app.AppConfig',
      section: 'applicationSection',
      factory: function() { return foam.nanos.app.AppConfig.create({}); }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      includeInDigest: true,
      documentation: `The unique identifier of the user.`,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then((user) => {
            if ( user ) {
              this.add(user.legalName);
            }
          })
          .catch((error) => {
            this.add(value);
          });
      },
      section: 'administration'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      visibility: 'HIDDEN',
    },
    {
      class: 'DateTime',
      name: 'created',
      includeInDigest: true,
      documentation: 'The date and time the User was last modified.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'administration'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      includeInDigest: true,
      documentation: `The unique identifier of the user.`,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then((user) => {
            if ( user ) {
              this.add(user.legalName);
            }
          })
          .catch((error) => {
            this.add(value);
          });
      },
      section: 'administration'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      includeInDigest: true,
      documentation: 'The date and time the User was last modified.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'administration'
    },
 ],

  actions: [
    {
      name: 'preview',
      tableWidth: 100,
      code: function(X) {
        X.ctrl.theme = this;
      },
      section: 'infoSection'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: function() {
        return this.name + ' ' + this.description;
      }
    }
  ]
});
