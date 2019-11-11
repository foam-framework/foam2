foam.ENUM({
  package: 'foam.nanos.ticket',
  name: 'TicketStatus',

  documentation: `Status for tickets. Each Ticket type is
expected to subclass TicketStatus`,

  values: [
    {
      name: 'OPEN',
      label: 'Open',
      documentation: 'Initial status of ticket when first created.',
      ordinal: 0
    },
    {
      name: 'CLOSED',
      label: 'Closed',
      documentation: 'Final status of ticket indicating no more activity will occur.',
      ordinal: 19
    }
  ]
});
