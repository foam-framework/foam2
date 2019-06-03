/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Country',

  documentation: 'The base model for country information.',

  ids: ['code'],

  axioms: [
    // ! Temporary remember to remove
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Shadow Accounts',
      predicateFactory: function(e) {
        return e.FALSE;
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Aggregate Accounts',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Virtual Accounts',
      predicateFactory: function(e) {
        return e.FALSE;
      }
    },
    // TODO: Figure out how to distinguish between viewViews and browseViews since they both use foam.comics.v2.NamedView
    {
      class: 'foam.comics.v2.NamedView',
      name: 'Table',
      view: { class: 'foam.u2.view.ScrollTableView' },
      icon: 'images/list-view-enabled.svg',
    },
    {
      class: 'foam.comics.v2.NamedView',
      name: 'Tree',
      view: { class: 'foam.u2.view.ScrollTableView' },
      icon: 'images/account-structure-enabled.svg',
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'code',
      documentation: `[ISO 3166](https://www.iso.org/iso-3166-country-codes.html)
        -1 alpha-2 Country codes.`,
    },
    {
      class: 'String',
      name: 'iso31661Code',
      label: 'ISO Code',
      documentation: `[ISO 3166](https://www.iso.org/iso-3166-country-codes.html)
        -1 alpha-3 country codes.`,
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'The name of the country.'
    },
    {
      class: 'StringArray',
      name: 'alternativeNames',
      documentation: `A list of known alternative country names.`,
    }
  ],
  methods: [{
    name: 'toString',
    type: 'String',
    code: function() {
      return 'Country: ' + this.code + ', ' + this.name;
    },
    javaCode: `
      return "{ code:" + this.getCode() + ", name:" + this.getName() + " }";
    `
  }],
  actions: [
    {
      name: 'helloWorld',
      code: function() {
        alert('Hello World!');
      }
    },
  ]
});
