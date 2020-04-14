/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsPropertyMetadata',
  properties: [
    {
      name: 'columnName',
      class: 'String'
    },
    {
      name: 'columnLabel',
      class: 'String'
    },
    {
      name: 'columnWidth',
      class: 'Int'//0 if no width found
    },
    {
      name: 'cellType',
      class: 'String'
    },
    {
      name: 'pattern',
      class: 'String'
    },
    {
      name: 'perValuePatternSpecificValues',
      class: 'StringArray',
    }
  ]
});