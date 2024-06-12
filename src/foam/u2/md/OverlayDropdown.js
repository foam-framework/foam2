/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'OverlayDropdown',
  extends: 'foam.u2.Element',

  exports: [
    'as dropdown'
  ],

  documentation: 'A popup overlay that grows from the top-right corner of ' +
      'its container. Useful for e.g. "..." overflow menus in action bars. ' +
      'Just $$DOC{ref:".add"} things to this container.',

  css: `
    ^overlay {
      position: absolute;
      z-index: 1009;
    }

    ^ {
      background-color: /*%WHITE%*/ #ffffff;
      border: 1px solid #DADDE2;
      box-sizing: border-box;
      box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      display: block;
      font-size: 14px;
      font-weight: 400;
      overflow-x: hidden;
      overflow-y: hidden;
      position: absolute;
      padding: 8px;
      z-index: 1010;
      transform: translate(-100%, 12px);
    }

    ^open {
      overflow-y: auto;
    }

    ^zeroOverlay {
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    ^initialOverlay {
      top: initial;
      bottom: initial;
      left: initial;
      right: initial;
    }

    ^parents {
      z-index: 1000 !important;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'opened',
      documentation: 'True when the overlay has been commanded to be open.'
    },
    {
      name: 'dropdownE_',
      factory: function() {
        return this.E('dropdown');
      }
    },
    {
      name: 'addToSelf_',
      value: false
    },
    {
      type: 'Int',
      name: 'x'
    },
    {
      type: 'Int',
      name: 'y'
    }
  ],

  methods: [
    function add() {
      // TODO: Replace with content @kgr
      if ( this.addToSelf_ ) {
        this.SUPER(...arguments);
      } else {
        this.dropdownE_.add(...arguments);
      }

      return this;
    },

    function open(x, y) {
      this.x = x;
      this.y = y;
      this.opened = true;
      window.addEventListener('resize', this.onResize);
    },

    function close() {
      this.opened = false;
    },

    function initE() {
      this.addToSelf_ = true;
      this.addClass(this.myClass('container'));
      var view = this;

      this.addClass(this.slot(function(opened) {
        this.shown = opened;
      }, this.opened$));

      this.start('dropdown-overlay')
        .addClass(this.myClass('overlay'))
        .show(this.opened$)
        .addClass(this.slot(function(opened) {
          return opened
            ? view.myClass('zeroOverlay')
            : view.myClass('initialOverlay');
        }, this.opened$))
        .on('click', this.onCancel)
      .end();

      this.dropdownE_.addClass(this.myClass())
        .show(this.opened$)
        .style({
          top: this.y$,
          left: this.x$
        })
        .on('mouseleave', this.onMouseLeave)
        .on('click', this.onClick);

      this.add(this.dropdownE_);

      this.addToSelf_ = false;
    }
  ],

  listeners: [
    function onCancel() {
      this.close();
    },

    function onMouseLeave(e) {
      console.assert(e.target === this.dropdownE_.el(),
          'mouseleave should only fire on this, not on children');
      this.close();
    },

    /**
     * Prevent clicks inside the dropdown from closing it.
     * Block them before they reach the overlay.
     */
    function onClick(e) {
      e.stopPropagation();
    },

    function onResize() {
      this.close();
      window.removeEventListener("resize", onResize);
    }
  ]
});
