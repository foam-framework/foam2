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
        String firstName = this.getFirstName();
        String middleName = this.getMiddleName();
        String lastName = this.getLastName();

        StringBuilder sb = new StringBuilder();

        if ( ! firstName.isEmpty() ) sb.append(firstName + " ");
        if ( ! middleName.isEmpty() ) sb.append(middleName + " ");
        if ( ! lastName.isEmpty() ) sb.append(lastName);
            
        return sb.toString().trim();
      `
    }
  ]
});
