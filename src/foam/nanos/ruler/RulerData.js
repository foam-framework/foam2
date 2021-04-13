/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RulerData',

  documentation: `A helper model to allow RulerEngine execute predicate on a single object
    that stores all needed information such as oldObj, newObj, user, realUser etc. Add more as needed`,

  properties: [
    {
      class: 'FObjectProperty',
      name: 'o',
      documentation: 'old object'
    },
    {
      class: 'FObjectProperty',
      name: 'n',
      documentation: 'new object'
    },
    {
      class: 'StringArray',
      name: 'diff',
      javaFactory: `
        if ( getO() == null ) {
          return new String[0];
        }
        return (String[]) getN().diff(getO()).keySet().toArray();
      `
    },
    {
      class: 'FObjectProperty',
      name: 'user',
      documentation: 'user in the current context'
    },
    {
      class: 'FObjectProperty',
      name: 'realUser',
      documentation: 'realUser in the current context'
    },
    {
      class: 'String',
      name: 'spid',
      documentation: 'spid in the current context'
    },
    {
      class: 'DateTime',
      name: 'dateTime'
    }
  ]
});
