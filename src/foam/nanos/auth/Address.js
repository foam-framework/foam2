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
      documentation: 'Determines whether the address exists.'
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Determines whether the address is deleted.'
    },
    {
      class: 'Boolean',
      name: 'structured',
      value: true,
      documentation: `Determines whether the address is shown in the following structure: 
        Street Number, Street Name, Suite Number. For an unstructured address field, 
        use address1 and/or address2.
      `
    },
    {
      class: 'String',
      name: 'address1',
      width: 70,
      displayWidth: 50,
      documentation: 'An unstructured field for the main postal address.',
      expression: function(structured, streetNumber, streetName) {
        return structured ? streetNumber + ' ' + streetName : '';
      },
      validationPredicates: [
        {
          args: ['structured', 'address1'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(foam.nanos.auth.Address.STRUCTURED, true),
              e.GTE(foam.mlang.StringLength.create({
                arg1: foam.nanos.auth.Address.ADDRESS1
              }), 1)
            );
          },
          errorString: 'Invalid value for address 1.'
        }
      ]
    },
    {
      class: 'String',
      name: 'address2',
      width: 70,
      displayWidth: 50,
      documentation: 'An unstructured field for the sub postal address.'
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      label: 'Country',
      of: 'foam.nanos.auth.Country',
      documentation: `A foreign key into the CountryDAO which represents the country.`,
      required: true,
      validateObj: function(countryId) {
        if ( typeof countryId !== 'string' || countryId.length === 0 ) {
          return 'Country required.';
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
      label: 'Region',
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
      // TODO: Remove structured, street number, and street name. This should be a view concern
      // and not baked into the model.
      class: 'String',
      name: 'streetNumber',
      width: 16,
      documentation: 'The structured field for the street number of the postal address.',
      validationPredicates: [
        {
          args: ['structured', 'streetNumber'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(foam.nanos.auth.Address.STRUCTURED, false),
              e.GTE(foam.mlang.StringLength.create({
                arg1: foam.nanos.auth.Address.STREET_NUMBER
              }), 1)
            );
          },
          errorString: 'Invalid street number.'
        }
      ]
    },
    {
      class: 'String',
      name: 'streetName',
      width: 70,
      documentation: 'The structured field for the street name of the postal address.',
      validationPredicates: [
        {
          args: ['structured', 'streetName'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(foam.nanos.auth.Address.STRUCTURED, false),
              e.REG_EXP(foam.nanos.auth.Address.STREET_NAME, /^\s*.+\s*$/)
            );
          },
          errorString: 'Invalid street name.'
        }
      ]
    },
    {
      class: 'String',
      name: 'suite',
      documentation: 'The structured field for the suite number of the postal address.',
      width: 16
    },
    {
      class: 'String',
      name: 'city',
      documentation: 'The city of the postal address.',
      required: true,
      minLength: 1
    },
    {
      class: 'String',
      name: 'postalCode',
      documentation: 'The postal code of the postal address.',
      preSet: function(oldValue, newValue) {
        return newValue.toUpperCase();
      },
      validationPredicates: [
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'CA'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i)
            );
          },
          errorString: 'Invalid postal code'
        },
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'US'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^^\d{5}(?:[-\s]\d{4})?$/i)
            );
          },
          errorString: 'Invalid zip code'
        }
      ],
      javaSetter:
        `postalCode_ = val.toUpperCase();
        postalCodeIsSet_ = true;`
    },
    {
      class: 'Boolean',
      name: 'encrypted',
      documentation: 'Determines whether the address is encrypted.'
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
