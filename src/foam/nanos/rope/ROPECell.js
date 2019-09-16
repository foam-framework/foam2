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
    'row', 
  ],

  columns: [
    'sourceModel',
    'targetModel',
    'column',
    'row',
    'checked'
  ],
  // sourceModel and targetModel here should be the same as in the relationship
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
    },
    {
      name: 'inverse',
      class: 'Boolean',
      description: `
        if imverse is set to true, the targetModel in this model is the sourceModel of the relationship
      `
    },
    {
      name: 'inverseName',
      class: 'String' // stores the name where name of the sourceModel in pov of targetModel, i.e., can be used as targetObj.getInverseName() to get sourceObjs
    },
    {
      name: 'junctionModel',
      class: 'String'
    }
  ]
  })