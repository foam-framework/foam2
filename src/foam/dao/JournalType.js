foam.ENUM({
  package: 'foam.dao',
  name: 'JournalType',

  documentation: 'Types of journals for journalling.',

  values: [
    {
      name: 'NO_JOURNAL',
      label: 'No journal'
    },
    {
      name: 'SINGLE_JOURNAL',
      label: 'Single'
    },
    {
      name: 'SHARED_JOURNAL',
      label: 'Shared journal'
    },
  ]
});
