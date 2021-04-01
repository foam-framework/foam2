/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.LIB({
  name: 'foam.util.AddressUtil',

  methods: [
    {
      name: 'parseAddress',
      documentation: 'Splits an address into the number and name, in that order, into an array',
      args: [
        {
          name: 'address1',
          type: 'String'
        },
        {
          name: 'address2',
          type: 'String'
        }
      ],
      type: 'StringArray',
      code: function(address1, address2) {
        var suitePattern = /\d+/g;
        if ( address1.indexOf('Unit') > 0) {
          var parts = address1.split('Unit');
          address1 = parts[0].trim();
          address2 = parts[1].trim();
        }
        if ( address1.endsWith(',') ) {
          address1.split(',')[0];
        }
        if ( address1.indexOf(',') > 0) {
          var parts = address1.split(',');
          address1 = parts[0];
          address2 = parts[1];
        }
        var street = address1;
        var suite = address2.match(suitePattern);
        if ( address1.indexOf('-') > 0) {
          var parts = address1.split('-');
          suite = parts[0].match(suitePattern);
          street = parts[1].trim();
        }
        street = street.replace(/[\#"]/g, "");
        var n = street.indexOf(' ');
        return [street.slice(0,n), street.slice(n+1)];
      }
    }
  ]
})