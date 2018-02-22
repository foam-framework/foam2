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
      documentation: 'for an unstructured address, use this as a main address field.'
    },
    {
      class: 'String',
      name: 'address2',
      width: 70,
      displayWidth: 50,
      documentation: 'for an unstructured address, use this as a sub address field.'
    },
    {
      class: 'String',
      name: 'suite',
      width: 16
    },
    {
      class: 'String',
      name: 'city',
      required: true
    },
    {
      class: 'String',
      name: 'postalCode',
      required: true
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
      documentation: 'for an structured address, use this field.'
    },
    {
      class: 'String',
      name: 'streetName',
      width: 70,
      documentation: 'for an structured address, use this field.'
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
