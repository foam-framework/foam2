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
    'document',
    'window'
  ],

  exports: [
    'as dropdown'
  ],

  documentation: 'A popup overlay that grows from the top-right corner of ' +
      'its container. Useful for e.g. "..." overflow menus in action bars. ' +
      'Just $$DOC{ref:".add"} things to this container.',

  properties: [
    {
      type: 'Float',
      name: 'height',
      defaultValue: 0
    },
    {
      type: 'Boolean',
      name: 'opened',
      documentation: 'True when the overlay has been commanded to be open. ' +
          'It might still be animating; see $$DOC{ref:".animationComplete"}.',
      defaultValue: false
    },
    {
      type: 'Boolean',
      name: 'animationComplete',
      documentation: 'True when an animation is running. The overlay hasn\'t ' +
          'really reached the state commanded by $$DOC{ref:".opened"} until ' +
          'this is true.',
      defaultValue: true
    },
    {
      name: 'dropdownE_',
      factory: function() {
        // This needs to be created early so it's safe to add() things to it.
        return this.E('dropdown');
      }
    },
    {
      name: 'addToSelf_',
      defaultValue: false
    },
  ],

  methods: [
    function add() {
      if (this.addToSelf_) this.SUPER.apply(this, arguments);
      else this.dropdownE_.add.apply(this.dropdownE_, arguments);
      return this;
    },

    function open() {
      if (this.opened) return;
      this.opened = true;
      this.height = -1;
      this.animationComplete = false;
    },

    function close() {
      if (!this.opened) return;
      this.height = 0;
      this.opened = false;
    },

    function getFullHeight() {
      if (this.state !== this.LOADED) return;

      var myStyle = this.window.getComputedStyle(this.dropdownE_.el());

      var border = 0;
      ['border-top', 'border-bottom'].forEach(function(name) {
        var match = myStyle[name].match(/^([0-9]+)px/);
        if (match) border += parseInt(match[1]);
      });

      var last = this.dropdownE_.children[this.dropdownE_.children.length - 1].el();
      var margin = parseInt(this.window.getComputedStyle(last)['margin-bottom']);
      if (Number.isNaN(margin)) margin = 0;

      return Math.min(border + last.offsetTop + last.offsetHeight + margin,
          this.window.innerHeight - this.dropdownE_.el().getBoundingClientRect().top);
    },

    function initE() {
      this.addToSelf_ = true;
      this.cls(this.myCls('container'));

      this.style({
        display: this.dynamic(function(open) {
          return open ? 'block' : 'none';
        }, this.opened$)
      });

      var overlayStyle = this.dynamic(function(open) {
        return open ? '0' : 'initial';
      }, this.opened$);

      this.start('dropdown-overlay')
          .cls(this.myCls('overlay'))
          .style({
            top: overlayStyle,
            bottom: overlayStyle,
            left: overlayStyle,
            right: overlayStyle
          })
          .on('click', this.onCancel)
          .end();

      this.dropdownE_.cls(this.myCls())
          .cls(this.dynamic(function(open, complete) {
            return open && complete ? this.myCls('open') : '';
          }.bind(this), this.opened$, this.animationComplete$))
          .on('transitionend', this.onTransitionEnd)
          .on('mouseleave', this.onMouseLeave)
          .on('click', this.onClick);

      this.dropdownE_.dynamic(this.onHeightChange, this.height$);

      this.add(this.dropdownE_);

      this.addToSelf_ = false;
    }
  ],

  templates: [
    function CSS() {/*
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
        right: 3px;
        top: 4px;
        transition: height 0.25s cubic-bezier(0, .3, .8, 1);
        z-index: 1010;
      }
      ^open {
        overflow-y: auto;
      }
    */},
  ],

  listeners: [
    function onCancel() {
      this.close();
    },

    function onTransitionEnd() {
      this.animationComplete = true;
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

    function onHeightChange() {
      var height = this.height < 0 ? this.getFullHeight() : this.height;
      this.dropdownE_.style({ height: height + 'px' });
    }
  ]
});
