foam.CLASS({
  package: 'com.google.foam.demos.daolist',
  name: 'Person',
  properties: [
    {
      name: 'id',
    },
    {
      class: 'String',
      name: 'firstName',
    },
    {
      class: 'String',
      name: 'lastName',
    },
    {
      class: 'Int',
      name: 'age',
    },
    {
      class: 'String',
      name: 'fullName',
      expression: function(firstName, lastName) {
        return firstName + ' ' + lastName;
      },
    },
  ],
});
