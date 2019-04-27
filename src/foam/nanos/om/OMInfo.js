/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OMInfo',

  documentation: 'Operation Measurement database entry.',

  ids: [ 'clsName', 'name' ],

  searchColumns: [ 'clsName', 'name' ],

  properties: [
    {
      class: 'String',
      name: 'clsName',
      label: 'Class'
    },
    {
      class: 'String',
      name: 'name',
    },
    {
      class: 'Long',
      name: 'count',
    },
    {
      class: 'DateTime',
      name: 'lastModified',
    }
  ]
});
