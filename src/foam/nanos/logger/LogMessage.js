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

  javaImports: [
    'foam.core.X',
    'foam.log.LogLevel'
  ],

  tableColumns: [
    'created',
    'severity',
    'message'
  ],

  searchColumns: [
    'hostname',
    'created',
    'severity',
    'exception'
  ],

  properties: [
    {
      name: 'hostname',
      class: 'String',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      tableWidth: 180
    },
    'createdBy',
    'createdByAgent',
    {
      name: 'threadName',
      class: 'String',
      label: 'Thread',
      visibility: 'RO',
      javaFactory: `return Thread.currentThread().getName();`,
    },
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
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:`
     // explicit constructors to avoid unneccessary object creation via Builders.
     public LogMessage(X x, LogLevel severity, String message) {
      setX(x);
      setSeverity(severity);
      setMessage(message);
    }

    public LogMessage(X x, String hostname, LogLevel severity, String message) {
      setX(x);
      setHostname(hostname);
      setSeverity(severity);
      setMessage(message);
    }
          `
        }));
      }
    }
  ]
});
