foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'Log',

  tableColumns: ['time', 'from', 'description'],

  properties: [
    {
      class: 'Long',
      name: 'id',
      factory: function() {
        return Math.floor(Math.random() * 1000000000);
      }
    },
    {
      class: 'DateTime',
      name: 'time'
    },
    {
      class: 'String',
      name: 'from'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'String',
      name: 'detail'
    }
  ]
})