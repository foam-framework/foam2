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
        return [firstName, middleName, lastName].filter(name => name).join(' ');
      },
      javaGetter: `
        String firstName = getFirstName();
        String middleName = getMiddleName();
        String lastName = getLastName();

        StringBuilder sb = new StringBuilder();

        if ( ! firstName.isEmpty() ) sb.append(firstName);
        if ( ! middleName.isEmpty() ) {
          if ( sb.length() > 0 ) sb.append(" ");
          sb.append(middleName);
        }
        if ( ! lastName.isEmpty() ) {
          if( sb.length() > 0 ) sb.append(" ");
          sb.append(lastName);
        }
            
        return sb.toString();
      `
    }
  ]
});
