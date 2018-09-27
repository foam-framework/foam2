/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'HumanNameTrait',

  properties: [
    {
      class: 'String',
      name: 'firstName',
      tableWidth: 160,
      documentation: 'First name of user.',
      validateObj: function(firstName) {
        if ( firstName.length > 70 ) {
          return 'First name cannot exceed 70 characters.';
        }

        if ( /\d/.test(firstName) ) {
          return 'First name cannot contain numbers.';
        }
      }
    },
    {
      class: 'String',
      name: 'middleName',
      documentation: 'Middle name of user.',
      validateObj: function(middleName) {
        if ( middleName.length > 70 ) {
          return 'Middle name cannot exceed 70 characters.';
        }

        if ( /\d/.test(middleName) ) {
          return 'Middle name cannot contain numbers.';
        }
      }
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'Last name of user.',
      tableWidth: 160,
      validateObj: function(lastName) {
        if ( lastName.length > 70 ) {
          return 'Last name cannot exceed 70 characters.';
        }

        if ( /\d/.test(lastName) ) {
          return 'Last name cannot contain numbers.';
        }
      }
    },
    {
      class: 'String',
      name: 'legalName',
      documentation: 'Full legal name of user. Appends first, middle & last name.',
      transient: true,
      expression: function(firstName, middleName, lastName) {
        return middleName != '' ? firstName + ' ' + middleName + ' ' + lastName : firstName + ' ' + lastName;
      },
      javaGetter: `
        return ! getMiddleName().equals("")
          ? getFirstName() + " " + getMiddleName() + " " + getLastName()
          : getFirstName() + " " + getLastName();
      `,
    }
  ]
});
