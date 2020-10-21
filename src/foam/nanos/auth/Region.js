/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Region',

  documentation: 'Region (province/state) information.',

  ids: ['code'],

  searchColumns: [
    'code',
    'name'
  ],

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'StringArray',
      name: 'alternativeNames'
    }
  ],

  methods: [
    {
      name: 'getRegionCode',
      type: 'String',
      code: function() {
        if ( this.code && this.code.length > 3 ) {
          return this.code.substring(3, this.code.length);
        }
        return '';
      },
      javaCode: `
        String c = getCode();
        if ( null != c && c.length() > 3 ) {
          return c.substring(3, c.length());
        }
        return "";
      `
    }
  ],
});
