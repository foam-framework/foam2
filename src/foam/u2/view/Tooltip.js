foam.CLASS({
  package: 'foam.u2.view',
  name: 'Tooltip',
  extends: 'foam.u2.View',
  
  documentation: `
    A 20x20 px question mark icon that shows a tooltip on hover.
  `,

  imports: [
    'document',
    'setTimeout',
    'window'
  ],

  css: `
    ^tooltip {
      display: inline-flex;
      overflow:overlay;
      width: 20px;
      height: 20px;
    }

    ^tooltip img {
      position: absolute;
    }

    ^tooltip:hover {
      height: auto;
      z-index: 100;
    }

    ^tooltip:hover .foam-u2-view-Tooltip-tip {
      display: block;
    }

    ^tip {
      display: none;
      background: rgba(80, 80, 80, 0.9);
      border-radius: 4px;
      color: white;
      padding: 5px 8px;
      position: fixed;
      transform: translate3d(0, 0, 2px);
      z-index: 2000;
      width: auto;
      height: auto;
    }
  `,

  properties: [
    'domRect', 
    'screenWidth', 
    'screenHeight', 
    'scrollY'
  ],

  methods: [
    function initE() {
      // Output the icon and wire up the text which lives in the "data" property
      var self = this;
      this.SUPER();
      this.addClass(self.myClass('tooltip'))
        this.start({
          class: 'foam.u2.tag.Image',
          data: 'images/question-icon.svg'
        })
        .end();
        this.onload.sub(function() {
          self.loadTooltip();
          self.window.addEventListener('loadTooltip', self.loadTooltip());
        })
      
    }
  ], 

  listeners: [
    {
      name: 'loadTooltip',
      isFramed: true,
      code: function() {
        var self = this;
        setTimeout(function(){
          if ( ! self.el() ) return;
          self.domRect = self.el().getBoundingClientRect(); 
          self.screenWidth = self.window.innerWidth;
          self.screenHeight = self.window.innerHeight;
          self.scrollY = self.window.scrollY;
          var above = self.domRect.top - scrollY > self.screenHeight / 2;
          var left = self.domRect.left > self.screenWidth / 2;
          self.start()
            .addClass(self.myClass('tip'))
            .add(self.data)
            .callIf(above, function() {
              this.style({ 'bottom': (self.screenHeight - self.domRect.bottom + 22) + 'px'});
            })
            .callIf(!above, function() {
              this.style({ 'top': (self.domRect.top + 22) + 'px'});
            })
            .callIf(left, function() {
              this.style({ 'right': (self.screenWidth - self.domRect.right + 22) + 'px'});
            })
            .callIf(!left, function() {
              this.style({ 'left': (self.domRect.left + 22) + 'px'});
            })
          .end();
        }, 100);
      }
    }
  ]
});