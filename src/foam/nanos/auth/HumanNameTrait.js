/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'HumanNameTrait',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'firstName',
      tableWidth: 160,
      documentation: 'First name of user.'
    },
    {
      class: 'String',
      name: 'middleName',
      documentation: 'Middle name of user.'
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'Last name of user.',
      tableWidth: 160
    },
    {
      class: 'String',
      name: 'legalName',
      documentation: 'Full legal name of user. Appends first, middle & last name.',
      transient: true,
      expression: function(firstName, middleName, lastName) {
        if ( firstName && middleName && lastName ) {
          return `${firstName} ${middleName} ${lastName}`;
        }

        if ( firstName && lastName ) {
          return `${firstName} ${lastName}`;
        }

        return '';
      },
      javaGetter: `
        String firstName = this.getFirstName();
        String middleName = this.getMiddleName();
        String lastName = this.getLastName();

        if ( ! SafetyUtil.isEmpty(firstName) && 
             ! SafetyUtil.isEmpty(middleName) &&
             ! SafetyUtil.isEmpty(lastName) ) {

          return firstName + " " + middleName + " " + lastName;
        }

        if ( ! SafetyUtil.isEmpty(firstName) && ! SafetyUtil.isEmpty(lastName) ) {
          return firstName + " " + lastName;
        }

        return "";
      `,
    }
  ]
});
