/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Address',

  documentation: 'Postal address.',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.auth.DayOfWeek',
    'foam.nanos.auth.Hours',
    'foam.nanos.auth.Region'
  ],

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'Boolean',
      name: 'deleted'
    },
    {
      class: 'Boolean',
      name: 'structured',
      value: true,
      documentation: 'Checked, shown Street Number, Street Name, Suite. Unchecked, shown Address1, Address2.'
    },
    {
      class: 'String',
      name: 'address1',
      //required: true
      width: 70,
      displayWidth: 50,
      documentation: 'for an unstructured address, use this as a main address field.',
      validateObj: function(address1) {
        var address1Regex = /^[a-zA-Z0-9 ]{1,70}$/;

        if ( address1.length > 0 && ! address1Regex.test(address1) ) {
          return 'Invalid address line.';
        }
      }
    },
    {
      class: 'String',
      name: 'address2',
      width: 70,
      displayWidth: 50,
      documentation: 'for an unstructured address, use this as a sub address field.',
      validateObj: function(address2) {
        var address2Regex = /^[a-zA-Z0-9 ]{1,70}$/;

        if ( address2.length > 0 && ! address2Regex.test(address2) ) {
          return 'Invalid address line.';
        }
      }
    },
    {
      class: 'String',
      name: 'suite',
      width: 16,
      validateObj: function (suite) {
        var suiteRegex = /^[a-zA-Z0-9 ]{1,70}$/;

        if ( suite.length > 0 && ! suiteRegex.test(suite) ) {
          return 'Invalid address line.';
        }
      }
    },
    {
      class: 'String',
      name: 'city',
      required: true,
      validateObj: function (city) {
        var cityRegex = /^[a-zA-Z ]{1,35}$/;

        if ( ! cityRegex.test(city) ) {
          return 'Invalid city name.';
        }
      }
    },
    {
      class: 'String',
      name: 'postalCode',
      required: true,
      validateObj: function (postalCode) {
        var postalCodeRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
        if ( ! postalCodeRegex.test(postalCode) ) {
          return 'Invalid postal code.';
        }
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'Reference',
      targetDAOKey: 'regionDAO',
      name: 'regionId',
      of: 'foam.nanos.auth.Region',
      view: function (_, X) {
        var choices = X.data.slot(function (countryId) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryId || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      }
    },
    {
      class: 'Boolean',
      name: 'encrypted'
    },
    {
      class: 'Double',
      name: 'latitude'
    },
    {
      class: 'Double',
      name: 'longitude'
    },
    {
      class: 'String',
      name: 'streetNumber',
      width: 16,
      documentation: 'for an structured address, use this field.',
      validateObj: function (streetNumber) {
        var streetNumberRegex = /^[0-9]{1,16}$/;

        if ( ! streetNumberRegex.test(streetNumber) ) {
          return 'Invalid street number.';
        }
      }
    },
    {
      class: 'String',
      name: 'streetName',
      width: 70,
      documentation: 'for an structured address, use this field.',
      validateObj: function (streetName) {
        var streetNameRegex = /^[a-zA-Z0-9 ]{1,70}$/;

        if ( ! streetNameRegex.test(streetName) ) {
          return 'Invalid street name.'
        }
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.Hours',
      name: 'hours',
      documentation: 'Opening and closing hours for this address',
      factory: function () { return []; },
      javaFactory: 'return new Hours[] {};'
    }
  ],

  methods: [
    {
      name: 'getAddress',
      javaReturns: 'String',
      code: function() { return this.structured ? this.streetNumber + ' ' + this.streetName : this.address1; },
      javaCode: `return getStructured() ? getStreetNumber() + " " + getStreetName() : getAddress1();`
    }
  ]
});
