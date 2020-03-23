/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'ExportDriverDataTypeViewConfig',
  properties: [
    {
      name: 'id',//typeOfConfig: String, Boolean, DAO / StringArray, Number
      class: 'String'
    },
    {
      name: 'viewClass',
      class: 'String'
    }
  ]
});