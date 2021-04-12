/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'CollapseBorder',
  extends: 'foam.u2.Element',

  css: `
    ^header {
      background-color: %GREY1%;
      color: %WHITE%;
      display: flex;
      align-content: space-between;
      line-height: 20pt;
      font-size: 14pt;
    }

    ^header > .foam-u2-ActionView {
      height: 20pt;
      margin-left: 0;
      border-color: %GREY1%;
      margin-left: 7pt;
    }

    ^header > ^title {
      margin-left: 8pt;
    }

    ^footer {
      background-color: %GREY1%;
      height: 4pt;
      border-bottom: 1pt solid %GREY2%;
    }

    ^ {
      margin-bottom: 4pt;
      border-left: 2px solid %GREY1%;
      border-right: 2px solid %GREY1%;
    }

    ^collapsed > *:not(^header) {
      display: none;
    }
  `,

  documentation: 'A stylized border. Intended for use when creating cards.',

  properties: [
    {
      name: 'title',
      class: 'String'
    },
    {
      class: 'Boolean',
      name: 'isCollapsed',
      value: true
    }
  ],

  // TODO: copied from CollapseableDetailView - maybe it should use this border
  actions: [
    {
      name: 'showAction',
      label: '',
      icon: 'images/expand-more.svg',
      isAvailable: function(isCollapsed) { return isCollapsed; },
      code: function() { this.isCollapsed = false; }
    },
    {
      name: 'hideAction',
      label: '',
      icon: 'images/expand-less.svg',
      isAvailable: function(isCollapsed) { return ! isCollapsed; },
      code: function() { this.isCollapsed = true; }
    }
  ],

  methods: [
    function init() {
      this
        .start()
          .addClass(this.myClass('header'))
          .startContext({ data: this })
            .tag(this.SHOW_ACTION, { buttonStyle: 'UNSTYLED' })
            .tag(this.HIDE_ACTION, { buttonStyle: 'UNSTYLED' })
          .endContext()
          .start()
            .addClass(this.myClass('title'))
            .add(this.title$)
          .end()
        .end()
    },
    function initE() {
      this
        .addClass(this.myClass())
        .enableClass(this.myClass('collapsed'), this.isCollapsed$)
        .start()
          .addClass(this.myClass('footer'))
        .end()
        ;
    },
  ]
});
