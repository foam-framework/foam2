/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectArrayView',
  extends: 'foam.u2.view.ArrayView',
  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'valueView',
      expression: function(of) {
        return {
          class: 'foam.u2.view.CollapseableDetailView',
          view: {
            class: 'foam.u2.view.DraftDetailView',
            view: {
              class: 'foam.u2.view.FObjectView',
              of: of
            }
          }
        };
      }
    }
  ]
});