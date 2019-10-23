/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessage',

  documentation: 'Modelled log output.',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  tableColumns: [
    'created',
    'severity',
    'message'
  ],

  searchColumns: [
    'created',
    'severity',
    'exception'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      tableWidth: 180
    },
    'createdBy',
    {
      name: 'severity',
      class: 'Enum',
      of: 'foam.log.LogLevel',
      toJSON: function(value) { return value && value.label; },
      updateMode: 'RO',
      tableCellFormatter: function(severity, obj, axiom) {
         this
          .start()
            .setAttribute('title', severity.label)
            .add(severity.label)
            .style({ color: severity.color })
          .end();
      },
      tableWidth: 90
    },
    {
      name: 'id',
      class: 'Long',
      storageTransient: 'true',
      hidden: 'true'
    },
    {
      name: 'message',
      class: 'String',
      label: 'Log Message',
      view: { class: 'foam.u2.view.PreView' },
      updateMode: 'RO'
    },
    // TODO: implement via an additional method on Logger logger.flag(x, y).log(message)
    // {
    //   name: 'flags',
    //   class: 'Map'
    // },
    {
      name: 'exception',
      class: 'Object',
      view: { class: 'foam.u2.view.PreView' },
      updateMode: 'RO'
    }
  ]
});
