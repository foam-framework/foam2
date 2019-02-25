/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Country',

  documentation: 'Country information.',

  ids: ['code'],

  properties: [
    {
      class: 'String',
      name: 'code',
      documentation: 'ISO 3166-1 alpha-2 Country codes.',
      view: {
        class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.TextField' },
          { class: 'foam.u2.Element', nodeName: 'br' },
          { class: 'foam.u2.tag.TextArea' }
        ]
      }
    },
    {
      class: 'String',
      name: 'iso31661Code',
      label: 'ISO Code',
      documentation: 'ISO 3166-1 alpha-3 country codes.'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Country name.'
    },
    {
      class: 'StringArray',
      name: 'alternativeNames'
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
  }]
});
