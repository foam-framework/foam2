/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Address',

  documentation: 'Postal address.',

  requires: [
    'foam.nanos.auth.Hours',
    'foam.nanos.auth.DayOfWeek'
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
      of: 'foam.nanos.auth.Region'
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
      factory: function () {
        return [
          this.Hours.create({ day: this.DayOfWeek.SUNDAY, open: true }),
          this.Hours.create({ day: this.DayOfWeek.MONDAY, open: true }),
          this.Hours.create({ day: this.DayOfWeek.TUESDAY, open: true }),
          this.Hours.create({ day: this.DayOfWeek.WEDNESDAY, open: true }),
          this.Hours.create({ day: this.DayOfWeek.THURSDAY, open: true }),
          this.Hours.create({ day: this.DayOfWeek.FRIDAY, open: true }),
          this.Hours.create({ day: this.DayOfWeek.SATURDAY, open: true }),
        ];
      },
      javaFactory:
`return new Hours[] {
    new Hours(DayOfWeek.SUNDAY, true, null, null),
    new Hours(DayOfWeek.MONDAY, true, null, null),
    new Hours(DayOfWeek.TUESDAY, true, null, null),
    new Hours(DayOfWeek.WEDNESDAY, true, null, null),
    new Hours(DayOfWeek.THURSDAY, true, null, null),
    new Hours(DayOfWeek.FRIDAY, true, null, null),
    new Hours(DayOfWeek.SATURDAY, true, null, null)
};`
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
