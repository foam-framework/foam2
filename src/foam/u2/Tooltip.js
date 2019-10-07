/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2',
  name: 'Tooltip',
  extends: 'foam.u2.View',

  documentation: 'Tooltip handler for any class extending Element',

  imports: [
    'window'
  ],

  properties: [
    {
      name: 'text',
      documentation: 'Help text to show in the tooltip.',
      required: true
    },
    {
      name: 'target',
      documentation: 'The tooltip will be positioned relative to this element.',
      required: true
    },
    {
      type: 'Boolean',
      name: 'opened'
    },
    {
      type: 'Boolean',
      name: 'closed'
    },
  ],

  methods: [
    function init() {
      this.target.removeAttribute('title');
      this.target.on('mouseover', this.loadTooltip);
      this.SUPER();
      this.add(this.text);
      this.addClass(this.myClass());
    }
  ],

  listeners: [
    function close() {
      this.closed = true;
      if ( this.opened ) {
        this.remove();
        this.opened = false;
      }
    },
    
    function loadTooltip() {

      if ( ! this.target || ! this.target.el() ) return;

      var oldTips = this.document.getElementsByClassName(this.myClass());
      for ( var i = 0 ; i < oldTips.length ; i++ ) {
        oldTips[i].remove();
      }

      this.target.on('mousedown', this.close);
      this.target.on('mouseleave', this.close);
      this.target.on('touchstart', this.close);
      this.target.on('unload', this.close);
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);

      var domRect = this.target.el().getBoundingClientRect();
      var screenWidth = this.window.innerWidth;
      var screenHeight = this.window.innerHeight;
      var scrollY = this.window.scrollY;
      var above = domRect.top - scrollY > screenHeight / 2;
      var left = domRect.left > screenWidth / 2;
      
      this.opened = true;

      this.load();
      this.style({
        'background': 'rgba(80, 80, 80, 0.9)',
        'border-radius': '5px',
        'color': 'white',
        'padding': '5px 8px',
        'position': 'absolute',
        'z-index': '2000',
        'max-width': (screenWidth / 4)+'px'
      })
        .callIf(above, function () {
          this.style({ 'bottom': (screenHeight - domRect.bottom + domRect.height + 2) + 'px' });
        })
        .callIf(!above, function () {
          this.style({ 'top': (domRect.top + domRect.height + 2) + 'px' });
        })
        .callIf(left, function () {
          this.style({ 'right': (screenWidth - domRect.right + domRect.width + 2) + 'px' });
        })
        .callIf(!left, function () {
          this.style({ 'left': (domRect.left + domRect.width + 2) + 'px' });
        });
    },
  ],
});
