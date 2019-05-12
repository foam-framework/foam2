/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Address',

  documentation: 'The base model for the postal address.',

  implements: [
    {
      path: 'foam.mlang.Expressions',
      flags: ['js'],
    },
  ],

  requires: [
    'foam.nanos.auth.DayOfWeek',
    'foam.nanos.auth.Hours',
    'foam.nanos.auth.Region'
  ],

  properties: [
    {
      class: 'String',
      name: 'type',
      documentation: 'The type of address.'
    },
    {
      class: 'Boolean',
      name: 'verified',
      documentation: 'Verifies that the address exists.'
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Verifies that the address is deleted.'
    },
    {
      class: 'Boolean',
      name: 'structured',
      value: true,
      documentation: `Verifies that the address is shown in the following structure: 
        Street Number, Street Name, Suite Number. For an unstructured address field, 
        use address1 and/or address2.
      `
    },
    {
      class: 'String',
      name: 'address1',
      // required: true
      width: 70,
      displayWidth: 50,
      documentation: 'An unstructured field for the main postal address.',
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
      documentation: 'An unstructured field for the sub postal address.',
      validateObj: function(address2) {
        var address2Regex = /^[a-zA-Z0-9 ]{1,70}$/;

        if ( address2.length > 0 && ! address2Regex.test(address2) ) {
          return 'Invalid address line.';
        }
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country',
      documentation: `A foreign key into the CountryDAO which represents the country.`,
      required: true,
      validateObj: function(countryId) {
        if ( typeof countryId !== 'string' || countryId.length === 0 ) {
          return 'Country required';
        }
      },
      postSet: function(oldValue, newValue) {
        if ( oldValue !== newValue ) {
          this.regionId = undefined;
        }
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'regionDAO',
      name: 'regionId',
      of: 'foam.nanos.auth.Region',
      documentation: `A foreign key into the RegionDAO which represents
        the region of the country.`,
      view: function(_, X) {
        var choices = X.data.slot(function(countryId) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryId || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      },
      required: true,
      validateObj: function(regionId, countryId) {
        // If the country hasn't been selected yet, don't show this error.
        if ( countryId == null ) return;
        if ( typeof regionId !== 'string' || regionId.length === 0 ) {
          switch ( countryId ) {
            case 'CA':
              return 'Province required.';
            case 'US':
              return 'State required.';
            default:
              return 'Region required.';
          }
        }
      }
    },
    {
      class: 'String',
      name: 'streetNumber',
      width: 16,
      documentation: 'The structured field for the street number of the postal address.',
      validateObj: function(streetNumber) {
        if ( streetNumber.trim() === '' ) {
          return 'Street number required.';
        }
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
      documentation: 'The structured field for the street name of the postal address.',
      validateObj: function(streetName) {
        if ( streetName.trim() === '' ) {
          return 'Street name required.';
        }
        var streetNameRegex = /^[a-zA-Z0-9 ]{1,70}$/;
        if ( ! streetNameRegex.test(streetName) ) {
          return 'Invalid street name.';
        }
      }
    },
    {
      class: 'String',
      name: 'suite',
      documentation: 'The structured field for the suite number of the postal address.',
      width: 16,
      validateObj: function(suite) {
        var suiteRegex = /^[a-zA-Z0-9 ]{1,70}$/;
        if ( suite.length > 0 && ! suiteRegex.test(suite) ) {
          return 'Invalid address line 2.';
        }
      }
    },
    {
      class: 'String',
      name: 'city',
      documentation: 'The city of the postal address.',
      required: true,
      validateObj: function(city) {
        if ( city.trim().length === 0 ) {
          return 'City required.';
        }
        var cityRegex = /^[a-zA-Z ]{1,35}$/;
        if ( ! cityRegex.test(city) ) {
          return 'Invalid city name.';
        }
      }
    },
    {
      class: 'String',
      name: 'postalCode',
      documentation: 'The postal code of the postal address.',
      preSet: function(oldValue, newValue) {
        return newValue.toUpperCase();
      },
      required: true,
      validateObj: function(postalCode, countryId) {
        if ( postalCode.trim().length === 0 ) {
          switch ( countryId ) {
            case 'CA':
              return 'Postal code required.';
            case 'US':
              return 'Zip code required.';
          }
        }
        var caRe = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i; // Canadian Format
        var usRe = /^^\d{5}(?:[-\s]\d{4})?$/i; // US Format
        switch ( countryId ) {
          case 'CA':
            if ( ! caRe.test(postalCode) ) {
              return 'Invalid postal code.';
            }
            break;
          case 'US':
            if ( ! usRe.test(postalCode) ) {
              return 'Invalid zip code.';
            }
            break;
        }
      },
      javaSetter:
        `postalCode_ = val.toUpperCase();
        postalCodeIsSet_ = true;`
    },
    {
      class: 'Boolean',
      name: 'encrypted',
      documentation: 'Verifies that the address is encrypted.'
    },
    {
      class: 'Double',
      name: 'latitude',
      documentation: 'The latitude of the postal address location.'
    },
    {
      class: 'Double',
      name: 'longitude',
      documentation: 'The longitude of the postal address location.'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.Hours',
      name: 'hours',
      documentation: `
        The opening and closing hours for this address if the address represents
        a business.
      `,
      factory: function() { return []; },
      javaFactory: 'return new Hours[] {};'
    }
  ],

  methods: [
    {
      name: 'getAddress',
      type: 'String',
      code: function() { return this.structured ? this.streetNumber + ' ' + this.streetName : this.address1; },
      javaCode: `return getStructured() ? getStreetNumber() + " " + getStreetName() : getAddress1();`
    }
  ]
});
