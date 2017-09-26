foam.ENUM({
  package: 'foam.lib.json',
  name: 'OutputterMode',

  documentation: 'Defines the mode for JSON Outputter',

  values: [
    {
      name: 'NETWORK',
      label: 'Network'
    },
    {
      name: 'STORAGE',
      label: 'Storage'
    },
    {
      name: 'FULL',
      label: 'Full'
    }
  ]
});