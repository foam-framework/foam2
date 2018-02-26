/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileProperty',
  extends: 'foam.core.FObjectProperty',

  properties: [
    [ 'of', 'foam.nanos.fs.File' ],
    [ 'javaType', 'foam.nanos.fs.File' ],
    [ 'javaInfoType', 'foam.nanos.fs.AbstractFilePropertyInfo' ],
    [ 'tableCellView', function () {} ],
    [ 'view', { class: 'foam.u2.view.FileView' } ]
  ]
});
