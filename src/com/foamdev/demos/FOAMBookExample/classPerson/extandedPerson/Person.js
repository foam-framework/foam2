foam.CLASS({
  package: 'foam.foamdev.demos.FOAMBookExample.classPerson.extandedPerson',
  name: 'Person',
  
  properties: [
    {type: 'Int'    , name: 'id'},
    {type: 'String' , name: 'firstName'},
    {type: 'String' , name: 'lastName'},
    {type: 'Int'    , name: 'age'},
    {type: 'Boolean', name: 'married'}
  ],

  methods: [
    function fullName() {
      return this.firstName + ' ' + this.lastName;
    }
  ],

  actions: [
    function sayHello() {
      window.alert("Hello, I'm " + this.firstName);
    }
  ]
});