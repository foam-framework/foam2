/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessage',

  documentation: `Modelled log output.
Implement LastModifiedByAware to suppress 'modified by' comment in journal output.`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  tableColumns: [
    'created',
    'severity',
    'createdBy',
    'lastModifiedBy',
    'message'
  ],

  searchColumns: [
    'severity',
    'exception'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      name: 'severity',
      class: 'Enum',
      of: 'foam.log.LogLevel',
      toJSON: function(value) { return value && value.label; },
      visibility: 'RO',
      tableCellFormatter: function(severity, obj, axiom) {
         this
          .start()
            .setAttribute('title', severity.label)
            .add(severity.label)
            .style({ color: severity.color })
          .end();
      },
    },
    {
      name: 'id',
      class: 'Long',
      storageTransient: 'true',
      hidden: 'true',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      value: '1',
      transient: true,
      hidden: true,
      documentation: 'Added to suppress journal comments regarding "modified by". Also, a non-null value is required.',
      javaFactory: 'return 1L;',
      visibility: 'RO'
    },
    {
      name: 'message',
      class: 'String',
      label: 'Log Message',
      visibility: foam.u2.Visibility.RO,
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 },
      visibility: 'RO'
    },
    // TODO: implement via an additional method on Logger logger.flag(x, y).log(message)
    // {
    //   name: 'flags',
    //   class: 'Map'
    // },
    {
      name: 'exception',
      class: 'Object',
      visibility: 'RO',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, col: 80 }
    }
  ]
});
