/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'DocumentMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  documentation: 'A menu item which contains an online document.',


  properties: [
    {
      class: 'String',
      name: 'text',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 120 }
    }
  ],

  methods: [
    function createView(X) { return this.Document.create({data: this.text}, X); }
  ],

  classes: [
    {
      name: 'Document',
      extends: 'foam.u2.View',

      requires: [
        'foam.u2.HTMLElement'
      ],

      css: `
        ^ {
          padding: 8px;
        }
      `,

      methods: [
        function initE() {
          this.SUPER();

          this.
            start(this.HTMLElement).
              addClass(this.myClass()).
              add(this.data).
            end();
        }
      ]
    }
  ]
});
