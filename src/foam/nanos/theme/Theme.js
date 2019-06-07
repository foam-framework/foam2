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
      name: 'primaryColor',
      documentation: 'The following color properties can determine the color scheme of the GUI.'
    },
    { class: 'Color', name: 'secondaryColor' },
    { class: 'Color', name: 'secondaryHoverColor' },
    { class: 'Color', name: 'secondaryDisabledColor' },
    { class: 'Color', name: 'backgroundColor' },
    { class: 'Color', name: 'headerColor' },
    { class: 'Color', name: 'destructiveColor' },
    { class: 'Color', name: 'destructiveHoverColor' },
    { class: 'Color', name: 'destructiveDisabledColor' },
    { class: 'Color', name: 'tableColor' },
    { class: 'Color', name: 'tableHoverColor' },
    { class: 'Color', name: 'accentColor' },
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
