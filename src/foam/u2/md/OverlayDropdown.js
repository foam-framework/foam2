/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'OverlayDropdown',
  extends: 'foam.u2.Element',

  imports: [
    'window'
  ],

  exports: [
    'as dropdown'
  ],

  documentation: 'A popup overlay that grows from the top-right corner of ' +
      'its container. Useful for e.g. "..." overflow menus in action bars. ' +
      'Just $$DOC{ref:".add"} things to this container.',

  css: `
    ^overlay {
      position: fixed;
      z-index: 1009;
    }

    ^container {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 100;
    }

    ^ {
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      display: block;
      font-size: 13px;
      font-weight: 400;
      overflow-x: hidden;
      overflow-y: hidden;
      position: absolute;
      width: 125px;
      padding: 10px;
      padding-bottom: -20px;
      margin-bottom: -20px;
      right: 3px;
      top: 4px;
      transition: height 0.25s cubic-bezier(0, .3, .8, 1);
      z-index: 1010;
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

  constants: {
    BOTTOM_OFFSET: -25,
  },

  properties: [
    {
      class: 'Float',
      name: 'height',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'opened',
      documentation: 'True when the overlay has been commanded to be open. ' +
          'It might still be animating; see $$DOC{ref:".animationComplete"}.',
    },
    {
      class: 'Boolean',
      name: 'animationComplete',
      documentation: 'True when an animation is running. The overlay hasn\'t ' +
          'really reached the state commanded by $$DOC{ref:".opened"} until ' +
          'this is true.',
      value: true
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
    }
  ],

  methods: [
    function add() {
      // TODO: Replace with content @kgr
      if ( this.addToSelf_ ) {
        this.SUPER.apply(this, arguments);
      } else {
        this.dropdownE_.add.apply(this.dropdownE_, arguments);
      }

      return this;
    },

    function open() {
      if ( this.opened ) return;

      this.onOpenStart();

      this.animationComplete = false;
      this.opened = true;
      this.dropdownE_.style({ height: this.getFullHeight() + 'px' });
    },

    function close() {
      if ( ! this.opened ) return;
      this.height = 0;
      this.animationComplete = false;
      this.opened = false;
      this.dropdownE_.style({ height: 0 + 'px' });
    },

    function getFullHeight() {
      if ( this.state !== this.LOADED ) return 0;

      var myStyle = this.window.getComputedStyle(this.dropdownE_.el());

      var first = this.dropdownE_.children[0].el();
      var top = first.offsetTop;
      var last = this.dropdownE_.children[this.dropdownE_.children.length - 1]
          .el();
      var margin = parseInt(
          this.window.getComputedStyle(last)['margin-bottom']);
      if ( Number.isNaN(margin) ) margin = 0;
      var bottom = last.offsetTop + last.offsetHeight + margin;

      var childrenHeight = bottom - top;
      var maxHeight = this.window.innerHeight -
            this.dropdownE_.el().getBoundingClientRect().top +
            this.BOTTOM_OFFSET;

      return Math.min(childrenHeight, maxHeight);
    },

    function initE() {
      this.addToSelf_ = true;
      this.addClass(this.myClass('container'));
      var view = this;

      this.addClass(this.slot(function(open, animationComplete) {
        this.shown = open || ! animationComplete;
      }, this.opened$, this.animationComplete$));

      this.start('dropdown-overlay')
        .addClass(this.myClass('overlay'))
        .addClass(this.slot(function(open) {
          return open ? view.myClass('zeroOverlay') :
              view.myClass('initialOverlay');
        }, this.opened$))
        .on('click', this.onCancel)
      .end();

      this.dropdownE_.addClass(this.myClass()).style({height: '0px'})
        .addClass(this.slot(function(opened, animationComplete) {
          var openComplete = opened && animationComplete;
          return openComplete ? this.myClass('open') : '';
        }, this.opened$, this.animationComplete$))
        .on('transitionend', this.onTransitionEnd)
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

    function onTransitionEnd() {
      this.animationComplete = true;
      if (!this.opened) this.onCloseComplete();
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

    function onOpenStart() {
      var parent = this.el().parentElement;
      var parentClass = this.myClass('parents');
      while (parent) {
        parent.classList.add(parentClass);
        parent = parent.parentElement;
      }
    },

    function onCloseComplete() {
      var parent = this.el().parentElement;
      var parentClass = this.myClass('parents');
      while (parent) {
        parent.classList.remove(parentClass);
        parent = parent.parentElement;
      }
    }
  ]
});
