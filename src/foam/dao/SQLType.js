foam.ENUM({
  package: 'foam.dao',
  name: 'SQLType',

  documentation: 'Represents the SQL Type. Copied from java.sql.Types to add labels and extra functions',

  values: [
    {
      name: 'ARRAY',
      label: 'ARRAY',
      ordinal: 2003
    },
    {
      name: 'BIGINT',
      label: 'BIGINT',
      ordinal: -5
    },
    {
      name: 'BIT',
      label: 'BIT',
      ordinal: -7
    },
    {
      name: 'BOOLEAN',
      label: 'BOOLEAN',
      ordinal: 16
    },
    {
      name: 'DATE',
      label: 'DATE',
      ordinal: 91
    },
    {
      name: 'FLOAT',
      label: 'FLOAT',
      ordinal: 6
    },
    {
      name: 'INTEGER',
      label: 'INTEGER',
      ordinal: 4
    },
    {
      name: 'SMALLINT',
      label: 'SMALLINT',
      ordinal: 5
    },
    {
      name: 'TINYINT',
      label: 'TINYINT',
      ordinal: -6
    },
    {
      name: 'VARBINARY',
      label: 'VARBINARY',
      ordinal: -3
    },
    {
      name: 'VARCHAR',
      label: 'VARCHAR',
      ordinal: 12
    }
  ]
});