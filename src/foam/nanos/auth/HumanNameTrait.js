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
        java.util.List<String> filteredNameList = java.util.Arrays
          .asList(this.getFirstName(), this.getMiddleName(), this.getLastName())
          .stream()
          .filter(name -> !name.isEmpty())
          .collect(java.util.stream.Collectors.toList());
            
        return String.join(" ", filteredNameList);
      `
    }
  ]
});
