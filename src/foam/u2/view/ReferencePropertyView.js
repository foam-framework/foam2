/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReferencePropertyView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'A view for foam.core.Reference properties.',

  requires: [
    'foam.u2.view.ReferenceView',
    'foam.u2.view.ReadReferenceView'
  ],

  properties: [
    [ 'readView', { class: 'foam.u2.view.ReadReferenceView' } ],
    [ 'writeView', { class: 'foam.u2.view.ReferenceView' } ]
  ],
});
