/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'ExportConfig',
  properties: [
    {
      name: 'configValue',
      class: 'String'
    },
    {
      name: 'exportMetadata',
      class: 'Reference',
      of: 'foam.nanos.export.ExportDriverAddOn'
    }
  ]
});