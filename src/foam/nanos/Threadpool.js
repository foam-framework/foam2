foam.CLASS({
  package: 'foam.nanos.jetty',
  name: 'ThreadPool',
  documentation: 'model of org.eclipse.jetty.server.ThreadPool',
  properties: [
    {
      name: 'minThreads',
      class: 'Int',
      value: 8
    },
    {
      name: 'maxThreads',
      class: 'Int',
      value: 200
    },
    {
      name: 'idleTimeout',
      class: 'Int',
      value: 60000
    }
  ]
});
