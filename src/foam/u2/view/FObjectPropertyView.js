/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectPropertyView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'A view for foam.core.FObjectProperty properties.',

  requires: [
    'foam.u2.CitationView',
    'foam.u2.detail.VerticalDetailView'
  ],

  properties: [
    {
      name: 'readView',
      value: { class: 'foam.u2.CitationView' }
    },
    {
      name: 'writeView',
      factory: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          of: this.prop.of
        }
      }
    }
  ],
});
