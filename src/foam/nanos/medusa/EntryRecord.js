/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'EntryRecord',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'fileName'
    },
    {
      class: 'Long',
      name: 'offset'
    },
    {
      class: 'Int',
      name: 'length'
    },
    {
      class: 'Int',
      name: 'totalEntry'
    },
    {
      class: 'Long',
      name: 'maxIndex'
    },
    {
      class: 'Long',
      name: 'minIndex'
    }
  ]
})
