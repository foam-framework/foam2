/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.u2.view',
    name: 'LiteralValueView',
    extends: 'foam.u2.View',
  
    documentation: 'Just shows the value of data as a string.',
  
    properties: [
        {
            name: 'view',
            value: { class: 'foam.u2.view.ValueView' }
        },
        {
            class: 'Object',
            name: 'value'
        }
    ],

    methods: [
        function initE() {
            this.tag(this.view, { data$: this.value$ })
        }
    ],
  });
  