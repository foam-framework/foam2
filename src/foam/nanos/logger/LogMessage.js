/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogMessage',

  properties: [
    {
      name: 'date',
      class: 'String'
    },
    {
      name: 'severity',
      class: 'Enum',
      of: 'foam.nanos.logger.LogLevel',
    },
    {
      name: 'id',
      class: 'Long',
    },
    {
      name: 'user',
      class: 'String'
    },
    {
      name: 'message',
      class: 'String'
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
