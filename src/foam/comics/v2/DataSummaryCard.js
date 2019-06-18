/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'DataSummaryCard',
  extends: 'foam.u2.View',

  documentation: `
    TODO: WORK IN PROGRESS:
    A configurable view to to render a card with 
    configurable contents and rich choice view dropdowns
  `,

  css:`
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.u2.borders.CardBorder'
  ],
  exports: [
    'controllerMode'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      name: 'data'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      class: 'FObjectArray',
      of: 'Reference',
      name: 'choices',
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'content',
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start(this.CardBorder)
          .start(this.Rows)
            .start(this.Cols).addClass(this.myClass('card-header'))
              .start().add().addClass().end()
              .forEach()
            .end()
          .end()
        .end();
    }
  ]
});
