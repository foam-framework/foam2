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

  searchColumns: [
    'severity'
   ],

  properties: [
    {
      class: 'DateTime',
      name: 'created',
    },
    {
      name: 'severity',
      class: 'Enum',
      of: 'foam.nanos.logger.LogLevel',
    },
    {
      name: 'id',
      class: 'Long',
      storageTransient: 'true',
      hidden: 'true'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      value: '1',
      transient: true,
      hidden: true,
      documentation: 'Added to suppress journal comments regarding "modified by". Also, a non-null value is required.'
    },
    {
      name: 'message',
      class: 'String',
      label: 'Log Message',
      visibility: foam.u2.Visibility.RO      
    },
    // TODO: implement via an additional method on Logger logger.flag(x, y).log(message)
    // {
    //   name: 'flags',
    //   class: 'Map'
    // },
    {
      name: 'exception',
      class: 'Object'
    }
  ]
});
