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
// REVIEW: implementation properties are class: 'Long' as we have a cyclic reference with User, and hence can't use class: 'Reference'. But even as Long, enable these interfaces causes genjava failures: ERROR: Unhandled promise rejection TypeError: Cannot read property 'id' of null
//    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
//    'foam.nanos.auth.LastModifiedByAware'
  ],

  requires: [
    'foam.nanos.theme.ThemeGlyphs'
  ],

  tableColumns: [
    'enabled',
    'name',
    'description',
    'domains',
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
      class: 'String',
      name: 'appName',
      section: 'infoSection',
    },
    {
      class: 'Image',
      name: 'loginImage',
      displayWidth: 60,
      view: {
        class: 'foam.u2.MultiView',
        views: [
          {
            class: 'foam.u2.tag.TextArea',
            rows: 4, cols: 80
          },
          { class: 'foam.u2.view.ImageView' },
        ]
      },
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
      class: 'String',
      name: 'navigationRootMenu',
      documentation: 'Specifies the root menu to be used in side navigation.'
    },
    {
      class: 'String',
      name: 'settingsRootMenu',
      documentation: 'Specifies the root menu to be used in top navigation settings drop-down.'
    },
    {
      class: 'Boolean',
      name: 'disableCurrencyChoice',
      value: false
    },
    {
      class: 'String',
      name: 'logoRedirect',
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
      view: {
        class: 'foam.u2.MultiView',
        views: [
          {
            class: 'foam.u2.tag.TextArea',
            rows: 4, cols: 80
          },
          { class: 'foam.u2.view.ImageView' },
        ]
      },
      section: 'images'
    },
    {
      class: 'Image',
      name: 'largeLogo',
      documentation: 'A large logo to display in the application.',
      displayWidth: 60,
      view: {
        class: 'foam.u2.MultiView',
        views: [
          {
            class: 'foam.u2.tag.TextArea',
            rows: 4, cols: 80
          },
          { class: 'foam.u2.view.ImageView' },
        ]
      },
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
      section: 'images'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.theme.ThemeGlyphs',
      name: 'glyphs',
      documentation: `
        Glyphs are simple vectors which can be used as menu items
        or indicators.
      `.replace('\n',' ').trim(),
      factory: function () {
        return this.ThemeGlyphs.create();
      }
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
      class: 'String',
      name: 'font1',
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
      name: 'secondary1',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'secondary2',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'secondary3',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'secondary4',
      section: 'colours'
    },
    {
      class: 'Color',
      name: 'secondary5',
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
      class: 'Color',
      name: 'white',
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
      class: 'Long',
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
      class: 'Long',
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
      class: 'Long',
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
    {
      class: 'String',
      name: 'supportPhone'
    },
    {
      class: 'String',
      name: 'supportEmail'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'supportAddress',
      factory: function() {
        return foam.nanos.auth.Address.create({});
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'personalSupportUser'
    }
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
    },
  ]
});
