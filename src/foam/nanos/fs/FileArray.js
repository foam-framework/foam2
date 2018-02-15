/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileArray',
  extends: 'foam.core.FObjectArray',

  properties: [
    [ 'of', 'foam.nanos.fs.File' ],
    [ 'tableCellView', function () {} ]
  ]
});
