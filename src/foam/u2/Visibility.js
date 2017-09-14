foam.ENUM({
  package: 'foam.u2',
  name: 'Visibility',

  documentation: 'View visibility mode combines with current ControllerModel to determine DisplayMode.',

  values: [
    { name: 'RW',       label: 'Read-Write' },
    { name: 'FINAL',    label: 'Final',     documentation: 'FINAL views are editable only in CREATE ControllerMode.' },
    { name: 'DISABLED', label: 'Disabled',  documentation: 'DISABLED views are visible but not editable.' },
    { name: 'RO',       label: 'Read-Only'  },
    { name: 'HIDDEN',   label: 'Hidden'     }
  ]
});