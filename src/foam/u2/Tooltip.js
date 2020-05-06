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
      name: 'opened',
      value: false
    },
    'timer'
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
    function onMouseOver() {
      var self = this;
      this.target.on('mousemove', function(evt) {
        if ( self.timer !== undefined ) {
          clearTimeout(self.timer);
        }
        self.timer = setTimeout(function() {
          if ( ! self.opened ) {
            self.document.body.insertAdjacentHTML('beforeend', self.outerHTML);

            var domRect      = self.target.el().getBoundingClientRect();
            var screenWidth  = self.window.innerWidth;
            var screenHeight = self.window.innerHeight;
            var scrollY      = self.window.scrollY;
            var selfRect     = self.el().getBoundingClientRect();
            var height       = self.el().getBoundingClientRect().height;
            var top          = (domRect.top - scrollY > screenHeight / 2) ? evt.pageY - 30 - height : evt.pageY + 30;
            var left         = (domRect.left > screenWidth / 2) ? evt.pageX - 20 - selfRect.width  :  evt.pageX + 20;

            self.opened = true;
            self.load();
            self.style({
              'background': 'rgba(80, 80, 80, 0.9)',
              'border-radius': '5px',
              'color': 'white',
              'padding': '5px 8px',
              'position': 'absolute',
              'z-index': '2000',
              'max-width': (screenWidth / 4)+'px',
              'top': top,
              'left': left
            });
          }
        }, 500);
      });

      self.target.on('mousedown',  self.close);
      self.target.on('mouseleave', self.close);
      self.target.on('touchstart', self.close);
      self.target.on('unload',     self.close);
    },

    function close() {
      if ( this.opened ) {
        this.remove();
        this.opened = false;
      }
      clearTimeout(this.timer);
    },

    function loadTooltip() {
      if ( ! this.target || ! this.target.el() ) return;

      var oldTips = this.document.getElementsByClassName(this.myClass());
      for ( var i = 0 ; i < oldTips.length ; i++ ) {
        oldTips[i].remove();
      }

      this.target.on('mouseover', this.onMouseOver);
    },
  ],
});
