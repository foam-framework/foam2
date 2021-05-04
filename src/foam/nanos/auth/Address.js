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
    'foam.nanos.auth.Region'
  ],

  imports: [
    'translationService'
  ],

  messages: [
    { name: 'CITY_REQUIRED', message: 'City required' },
    { name: 'COUNTRY_REQUIRED', message: 'Country required' },
    { name: 'REGION_REQUIRED', message: 'Region required' },
    { name: 'INVALID_ADDRESS_1', message: 'Invalid value for address line 1' },
    { name: 'INVALID_POSTAL_CODE', message: 'Valid Postal Code or ZIP Code required' },
    { name: 'POSTAL_CODE_REQUIRE', message: 'Postal Code required' },
    { name: 'STREET_NAME_REQUIRED', message: 'Street name required' },
    { name: 'STREET_NUMBER_REQUIRED', message: 'Street number required' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'structured',
      value: true,
      documentation: `Determines whether the address is shown in the following structure:
        Street Number, Street Name, Suite Number. For an unstructured address field,
        use address1 and/or address2.
      `,
      hidden: true
    },
    {
      class: 'String',
      name: 'address1',
      label: 'Address Line 1',
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
          errorMessage: 'INVALID_ADDRESS_1'
        }
      ],
      hidden: true
    },
    {
      class: 'String',
      name: 'address2',
      label: 'Address Line 2',
      width: 70,
      displayWidth: 50,
      documentation: 'An unstructured field for the sub postal address.',
      hidden: true
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      label: 'Country',
      of: 'foam.nanos.auth.Country',
      documentation: `A foreign key into the CountryDAO which represents the country.`,
      required: true,
      gridColumns: 6,
      tableWidth: 135,
      validateObj: function(countryId) {
        if ( typeof countryId !== 'string' || countryId.length === 0 ) {
          return this.COUNTRY_REQUIRED;
        }
      },
      postSet: function(oldValue, newValue) {
        if ( oldValue !== newValue ) {
          this.regionId = undefined;
        }
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Countries',
              dao: X.countryDAO
            }
          ]
        };
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
      gridColumns: 6,
      view: function(_, X) {
        var choices = X.data.slot(function(countryId) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryId || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        }, X);
      },
      required: true,
      javaValidateObj: `
        if ( ((Address) obj).getCountryId() != null && 
          ( ((Address) obj).getRegionId() == null || ((Address) obj).getRegionId().trim().length() == 0 ) 
        )
          throw new IllegalStateException(((Address) obj).REGION_REQUIRED);
      `,
      validateObj: function(regionId, countryId) {
        // If the country hasn't been selected yet, don't show this error.
        if ( countryId == null ) return;
        if ( typeof regionId !== 'string' || regionId.length === 0 ) {
          let regionError = this.translationService.getTranslation(foam.locale, `${countryId.toLowerCase()}.foam.nanos.auth.Address.REGION.error`);
          if ( ! regionError ) {
            regionError = this.translationService.getTranslation(foam.locale, `*.foam.nanos.auth.Address.REGION.error`);
          }
          return regionError ? regionError : this.REGION_REQUIRED;
        }
      }
    },
    {
      class: 'String',
      name: 'suite',
      documentation: 'The structured field for the suite number of the postal address.',
      gridColumns: 3,
      width: 16
    },
    {
      // TODO: Remove structured, street number, and street name. This should be a view concern
      // and not baked into the model.
      class: 'String',
      name: 'streetNumber',
      label: 'Street number',
      width: 16,
      documentation: 'The structured field for the street number of the postal address.',
      gridColumns: 3,
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
          errorMessage: 'STREET_NUMBER_REQUIRED'
        }
      ]
    },
    {
      class: 'String',
      name: 'streetName',
      label: 'Street name',
      width: 70,
      documentation: 'The structured field for the street name of the postal address.',
      gridColumns: 6,
      validationPredicates: [
        {
          args: ['structured', 'streetName'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(foam.nanos.auth.Address.STRUCTURED, false),
              e.REG_EXP(foam.nanos.auth.Address.STREET_NAME, /^\s*.+\s*$/)
            );
          },
          errorMessage: 'STREET_NAME_REQUIRED'
        }
      ]
    },
    {
      class: 'String',
      name: 'city',
      documentation: 'The city of the postal address.',
      required: true,
      gridColumns: 6,
      validateObj: function(city) {
        if ( city.length === 0 ) {
          return this.CITY_REQUIRED;
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
      gridColumns: 6,
      validationPredicates: [
        {
          args: ['postalCode'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: foam.nanos.auth.Address.POSTAL_CODE
              }), 0);
          },
          errorMessage: 'POSTAL_CODE_REQUIRE'
        },
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
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'US'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{5}(?:[-\s]\d{4})?$/i)
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Austria
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'AT'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{4}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Belgium
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'BE'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(?:(?:[1-9])(?:\d{3}))$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Brazil
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'BR'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{5}-?\d{3}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // China
        // Note: The postal services in Macau or Hong Kong Special Administrative Regions remain separate from
        // Mainland China, with no postal code system currently used
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'CN'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{6}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Cyprus
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'CY'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{4}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Estonia
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'EE'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{5}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Finland
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'FI'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{5}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // France
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'FR'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(?:[0-8]\d|9[0-8])\d{3}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Germany
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'DE'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{5}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Great Britain
        {
          args: ['postalCode', 'countryId'],
            predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'GB'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(GIR[ ]?0AA|((AB|AL|B|BA|BB|BD|BH|BL|BN|BR|BS|BT|CA|CB|CF|CH|CM|CO|CR|CT|CV|CW|DA|DD|DE|DG|DH|DL|DN|DT|DY|E|EC|EH|EN|EX|FK|FY|G|GL|GY|GU|HA|HD|HG|HP|HR|HS|HU|HX|IG|IM|IP|IV|JE|KA|KT|KW|KY|L|LA|LD|LE|LL|LN|LS|LU|M|ME|MK|ML|N|NE|NG|NN|NP|NR|NW|OL|OX|PA|PE|PH|PL|PO|PR|RG|RH|RM|S|SA|SE|SG|SK|SL|SM|SN|SO|SP|SR|SS|ST|SW|SY|TA|TD|TF|TN|TQ|TR|TS|TW|UB|W|WA|WC|WD|WF|WN|WR|WS|WV|YO|ZE)(\d[\dA-Z]?[ ]?\d[ABD-HJLN-UW-Z]{2}))|BFPO[ ]?\d{1,4})$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Greece
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'GR'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{3}\s{0,1}\d{2}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Ireland
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'IE'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /[A-Za-z]\d{2}\s[A-Za-z\d]{4}/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // India
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'IN'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{6}(?:[-\s]\d{4})?$/i
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Italy
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'IT'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{5}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Latvia
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'LV'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(LV-)?\d{4}$/i
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Lithuania
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'LT'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(LT-)?\d{5}$/i
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Luxembourg
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'LU'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{4}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Malta
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'MT'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^[A-Z]{3}\s?\d{4}$/i
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // the Netherlands
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'NL'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(?:NL-)?(?:[1-9]\d{3} ?(?:[A-EGHJ-NPRTVWXZ][A-EGHJ-NPRSTVWXZ]|S[BCEGHJ-NPRTVWXZ]))$/i
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Portugal: "NNNN-NNN", "NNNN NNN"
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'PT'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{4}[- ]{0,1}\d{3}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Slovakia
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'SK'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(SK-)?\d{3}\s?\d{2}$/i
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Slovenia
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'SI'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(SI-)?\d{4}$/i
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Spain
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'ES'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Sweden
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'SE'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(s-|S-){0,1}[0-9]{3}\s?[0-9]{2}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Jamaica
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'JM'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(JM)[a-zA-Z]{3}\d{2}$/i
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Lebanon
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'LB'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^(\d{4}|\d{8})$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Mexico
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'MX'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{5}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Malaysia
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'MY'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{5}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // Trinidad and Tobago
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'TT'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{6}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        // South Africa
        {
          args: ['postalCode', 'countryId'],
          predicateFactory: function(e) {
            return e.OR(
              e.NEQ(foam.nanos.auth.Address.COUNTRY_ID, 'ZA'),
              e.REG_EXP(
                foam.nanos.auth.Address.POSTAL_CODE,
                /^\d{4}$/
              )
            );
          },
          errorMessage: 'INVALID_POSTAL_CODE',
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        },
        {
          args: ['countryId'],
          predicateFactory: function(e) {
            return e.HAS(foam.nanos.auth.Address.COUNTRY_ID);
          },
          jsErr: function(X) {
            let postalCodeError = X.translationService.getTranslation(foam.locale, `${X.countryId.toLowerCase()}.foam.nanos.auth.Address.POSTAL_CODE.error`);
            if ( ! postalCodeError ) {
              postalCodeError = X.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.error');
            }
            return postalCodeError ? postalCodeError : X.INVALID_POSTAL_CODE;
          }
        }
      ],
      javaSetter: `
        postalCode_ = val.toUpperCase();
        postalCodeIsSet_ = true;
      `
    },
    {
      class: 'String',
      name: 'postalCodeLabel',
      expression: function(countryId) {
        let translatedPostalCodeLabel = this.translationService.getTranslation(foam.locale, `${countryId.toLowerCase()}.postalCode.label`);
        return translatedPostalCodeLabel ? translatedPostalCodeLabel : this.translationService.getTranslation(foam.locale, 'postalCode.label');
      },
      hidden: true
    },
    {
      class: 'Double',
      name: 'latitude',
      documentation: 'The latitude of the postal address location.',
      hidden: true
    },
    {
      class: 'Double',
      name: 'longitude',
      documentation: 'The longitude of the postal address location.',
      hidden: true
    },
    {
      class: 'Enum',
      name: 'propertyType',
      of: 'foam.nanos.auth.PropertyType',
      documentation: 'Defines property type of address.'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        var rtn = this.getShortAddress();
        rtn += ', ';
        rtn += this.city;
        rtn += ', ';
        rtn += this.regionId;
        rtn += ', ';
        rtn += this.countryId;
        rtn += ', ';
        rtn += this.postalCode;
        return rtn === ', , , , ' ? '' : rtn;
      },
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(getShortAddress());
        sb.append(", ");
        sb.append(this.getCity());
        sb.append(", ");
        sb.append(getRegionId());
        sb.append(", ");
        sb.append(getCountryId());
        sb.append(", ");
        sb.append(getPostalCode());
        String rtn = sb.toString();
        return rtn.equals(", , , , ") ? "" : rtn;
      `
    },
    {
      name: 'getShortAddress',
      type: 'String',
      code: function() {
        var rtn = '';
        if ( this.structured ) {
          rtn += this.suite;
          rtn += (this.suite ? '-' : '');
          rtn += this.streetNumber;
          rtn += ' ';
          rtn += this.streetName;
        } else {
          rtn += this.address1;
          rtn += ' ';
          rtn += this.address2;
        }
        return rtn.trim();
      },
      javaCode: `
      StringBuilder sb = new StringBuilder();
      if ( getStructured() ) {
        if ( getSuite() != null && ! getSuite().equals("") ) {
          sb.append(getSuite());
          sb.append("-");
        }
        sb.append(getStreetNumber());
        sb.append(" ");
        sb.append(getStreetName());
      } else {
        sb.append(getAddress1());
        sb.append(" ");
        sb.append(getAddress2());
      }
      return sb.toString().trim();
      `
    },
    {
      name: 'getAddress',
      type: 'String',
      code: function() {
        return this.getShortAddress();
      },
      javaCode: `
      return getShortAddress();
     `
    }
  ]
});
