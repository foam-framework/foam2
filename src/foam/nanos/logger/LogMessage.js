/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessage',

  documentation: 'Modelled log output.',

  javaImports: [
    'foam.core.X',
    'foam.log.LogLevel',
    'foam.nanos.auth.User'
  ],

  tableColumns: [
    'timestamp',
    'severity',
    'message'
  ],

  searchColumns: [
    'hostname',
    'created',
    'severity',
    'message'
  ],

  properties: [
    {
      name: 'hostname',
      class: 'String',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'timestamp',
      visibility: 'RO',
      tableWidth: 180
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The unique identifier of the user.`,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then((user) => {
            if ( user ) {
              this.add(user.legalName);
            }
          })
          .catch((error) => {
            this.add(value);
          });
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: `The unique identifier of the agent`,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then((user) => {
            if ( user ) {
              this.add(user.legalName);
            }
          })
          .catch((error) => {
            this.add(value);
          });
      }
    },
    {
      name: 'thread',
      class: 'String',
      visibility: 'RO',
      javaFactory: `return Thread.currentThread().getName();`,
    },
    {
      name: 'severity',
      class: 'Enum',
      of: 'foam.log.LogLevel',
      toJSON: function(value) { return value && value.label; },
      updateVisibility: 'RO',
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
      visibility: 'HIDDEN'
    },
    {
      name: 'message',
      class: 'String',
      label: 'Log Message',
      view: { class: 'foam.u2.tag.TextArea', rows: 10, cols: 100 },
      updateVisibility: 'RO'
    },
    // TODO: implement via an additional method on Logger logger.flag(x, y).log(message)
    // {
    //   name: 'flags',
    //   class: 'Map'
    // },
    // {
    //   name: 'exception',
    //   class: 'Object',
    //   view: { class: 'foam.u2.view.PreView' },
    //   updateVisibility: 'RO'
    // }
    {
      documentation: `Support searching by date range.  'timestamp' is a human readable date string, not a 'DateTime' type that can be used for range searching in table view filters.  'timestamp' is optimized to avoid use of java.util.Date and this property is only calculated for table views.`,
      name: 'created',
      class: 'DateTime',
      storageTransient: 'true',
//      visibility: 'HIDDEN'
    }
  ]
});
