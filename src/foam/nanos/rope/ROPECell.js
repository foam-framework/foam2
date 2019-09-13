/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'ROPECell',
  documentation: 'model represents a single cell in a rope matrix',

  ids: [
    'sourceModel',
    'targetModel',
    'column',
    'row'
  ],

  columns: [
    'sourceModel',
    'targetModel',
    'column',
    'row',
    'checked'
  ],

  properties: [
    {
      name: 'sourceModel',
      class: 'String'
    }, 
    {
      name: 'targetModel',
      class: 'String'
    },
    {
      name: 'junctionDAOKey',
      class: 'String'
    },
    {
      name: 'sourceDAOKey',
      class: 'String'
    },
    {
      name: 'checked',
      class: 'Boolean'
    },
    {
      name: 'column',
      class: 'String'
    },
    {
      name: 'row',
      class: 'String'
    }
  ]
  })