/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'LiteralValueView',
  extends: 'foam.u2.View',
  
  documentation: 'A ValueView that can display a value that is different than the value of the property.',
  
  properties: [
    {
      name: 'view',
      class: 'foam.u2.ViewSpec',
      value: { class: 'foam.u2.view.ValueView' }
    },
    {
      name: 'value',
      class: 'Object'
    }
  ],

  methods: [
    function initE() {
      this.tag(this.view, { data$: this.value$ })
    }
  ],
});
  