foam.CLASS({
    package: 'foam.u2',
    name: 'Tooltip',
    imports: [
        'document',
        'setTimeout',
        'window'
    ],
    css: `
        ^ tooltip {
            background: rgba(80, 80, 80, 0.9);
            border-radius: 4px;
            color: white;
            font-size: 10pt;
            left: 0;
            padding: 5px 8px;
            position: absolute;
            top: 0;
            transform: translate3d(0, 0, 2px);
            z-index: 2000;
        }
    `,
    properties: [
        {
            name: 'text',
            documentation: 'Help text to show in the tooltip.',
          },
          {
            name: 'target',
            documentation: 'The tooltip will be positioned relative to this element.',
            required: true,
          },
          {
            type: 'Boolean',
            name: 'opened',
            value: false
          },
          {
            type: 'Boolean',
            name: 'closed',
            value: false
          },
    ],
    methods: [
        function initE() {
          this.SUPER();
    
          this.document.previousTooltip_ = this;
          this.setTimeout(this.onTimeout, 400);
        },
      ],
      listeners: [
        function close() {
          this.closed = true;
          if ( this.opened ) {
            this.remove();
            this.opened = false;
          }
        },
        function onTimeout() {
          if ( this.document.previousTooltip_ !== this ) return;
          if ( this.closed ) return;
          if ( ! this.target || ! this.target.el() ) return;
    
          var oldTips = this.document.getElementsByClassName('tooltip');
          for (var i = 0; i < oldTips.length; i++) {
            oldTips[i].remove();
          }
    
          this.target.on('mousedown', this.close);
          this.target.on('touchstart', this.close);
          this.target.on('unload', this.close);
          this.on('unload', function() {
            this.opened = false;
            this.closed = true;
          });
    
          this.addClass('tooltip');
          this.add(this.text);
          this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
    
          var targetE = this.target.el();
          var s = this.window.getComputedStyle(this.el());
          var pos = findViewportXY(targetE);
          var screenHeight = this.window.innerHeight;
          var scrollY = this.window.scrollY;
          var above = pos[1] - scrollY > screenHeight / 2;
          var left = pos[0] + ( targetE.clientWidth - toNum(s.width) ) / 2;
          var maxLeft = this.window.innerWidth + this.window.scrollX - 15 - this.el().clientWidth;
          var targetHeight = targetE.clientHeight || targetE.offsetHeight;
    
          this.opened = true;
          this.load();
          this.style({
            visibility: 'visible',
            top: (above ?
                pos[1] - targetHeight - 8 :
                pos[1] + targetHeight + 8) + 'px',
            left: Math.max(this.window.scrollX + 15, Math.min(maxLeft, left)) + 'px'
          });
        },
      ],


    
});