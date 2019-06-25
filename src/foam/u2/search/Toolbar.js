/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'Toolbar',
  extends: 'foam.u2.View',

  css: `
    ^ {
      display: none;
    }
  `,

  documentation: `
    TODO:
    A toolbar which features filtering, searching and exporting
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'data',
      factory: function() {
        return foam.mlang.predicate.True.create();
      }
    },
    {
      class: 'String', // TODO: remove.
      name: 'search',
      label: 'Search',
      view: { class: 'foam.u2.TextField' },
      maxLength: 0
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .startContext({ controllerMode: foam.u2.ControllerMode.EDIT })
          .tag({
            class: 'foam.u2.detail.SectionedDetailPropertyView',
            data: this,
            prop: this.SEARCH
          })
        .endContext()
    }
  ]
});
