foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ImportDataMessage',
  properties: [
    {
      name: 'result',
      class: 'Int'//-1 for error/ > 0 for num of records inserted
    }
  ]
});