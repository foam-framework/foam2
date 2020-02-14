/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: This should be generated automatically
foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReferenceSpecPropertyView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'A view for foam.core.ReferenceSpec properties.',

  properties: [
    [ 'readView', { class: 'foam.u2.view.ReadWeakReferenceView' } ],
    [ 'writeView', { class: 'foam.u2.view.WeakReferenceView' } ]
  ],
});
