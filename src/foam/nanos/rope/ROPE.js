/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.rope',
    name: 'ROPE',
    documentation: 'model represents a single cell in a rope matrix',

    ids: [ 'targetDAOKey', 'sourceDAOKey', 'relationshipKey' ],

    properties: [
      {
        name: 'sourceModel',
        class: 'Class',
        javaType: 'foam.core.ClassInfo',
        required: true
      }, 
      {
        name: 'targetModel',
        class: 'Class',
        javaType: 'foam.core.ClassInfo',
        required: true
      },
      {
        name: 'sourceDAOKey',
        class: 'String',
        required: true
      },
      {
        name: 'targetDAOKey',
        class: 'String',
        required: true
      },
      {
        name: 'cardinality',
        class: 'String',
        required: true
      },
      {
        name: 'relationshipKey',
        class: 'String'
      },
      {
        name: 'crudMap',
        class: 'Map',
        javaType: 'java.util.Map<String, java.util.Map<String, java.util.List<String>>>'
      },
      {
        name: 'relationshipMap',
        class: 'Map',
        javaType: 'java.util.Map<String, java.util.List<String>>'
      },
      {
        name: 'isInverse',
        class: 'Boolean',
        value: false
      }
    ]
});