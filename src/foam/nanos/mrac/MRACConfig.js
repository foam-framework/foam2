foam.ENUM({
    package: 'foam.nanos.mrac',
    name: 'Type',
  
    documentation: `
      Type of a node in clustering
    `,
  
    values: [
      {
        name: 'PRIMARY',
        label: 'Primary',
        documentation: 'Master - receives all ‘put’ operations'
      },
      {
        name: 'SECONDARY',
        label: 'Secondary',
        documentation: 'Slave - handles any ‘read’ operation. Involved in voting for new PRIMARY '
      },
      {
        name: 'REPLICA',
        label: 'Replica',
        documentation: 'Can handle any ‘read’ operation (nanopay instance)'
      }
    ]
  });
  
  foam.ENUM({
    package: 'foam.nanos.mrac',
    name: 'Status',
  
    documentation: `
      Status of a node in clustering
    `,
  
    values: [
      {
        name: 'ONLINE',
        label: 'Online',
        documentation: 'Active node'
      },
      {
        name: 'OFFLINE',
        label: 'Offline',
        documentation: 'Removed from a clustering considerations: failed, maintenance, etc '
      }
    ]
  });
  
  foam.ENUM({
    package: 'foam.nanos.mrac',
    name: 'Mode',
  
    documentation: `
      Mode of a node in clustering
    `,
  
    values: [
      {
        name: 'RO',
        label: 'Read-Only'
      },
      {
        name: 'RO',
        label: 'Read-Write'
      },
      {
        name: 'WO',
        label: 'Write-Only'
      }
    ]
  });
  
  foam.CLASS({
    package: 'foam.nanos.mrac',
    name: 'MRACConfig',
  
    documentation: 'Multi-role active clustering - used by high availability system and clustering.',
  
    properties: [
      {
        class: 'String',
        name: 'hostname',
        documentation: 'Local instance hostname'
      },
      {
        class: 'String',
        name: 'realm',
        documentation: 'Group of nodes'
      },
      {
        class: 'String',
        name: 'region',
        documentation: 'Geographic region of group nodes'
      },
      {
        class: 'Enum',
        of: 'foam.nanos.mrac.Type',
        name: 'type',
        documentation: 'Type of a node'
      },
      {
        class: 'Enum',
        of: 'foam.nanos.mrac.Status',
        name: 'status',
        documentation: 'Status of a node'
      },
      {
        class: 'Enum',
        of: 'foam.nanos.mrac.Mode',
        name: 'mode',
        documentation: 'Mode of a node (read-only, read-write or write-only)'
      },
      {
        class: 'Int',
        name: 'port',
        value: 9001
      },
    ]
  });
  