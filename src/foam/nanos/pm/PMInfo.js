foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMInfo',
  documentation: '',

  properties: [
    {
      class: 'String',
      name: 'clsname'
    },
    {
      class: 'String',
      name: 'pmname'
    },
    {
      class: 'Long',
      name: 'mintime'
    },
    {
      class: 'Long',
      name: 'maxtime'
    },
    {
      class: 'Long',
      name: 'totaltime'
    },
    {
      class: 'Int',
      name: 'numoccurrences'
    }
  ]
});
