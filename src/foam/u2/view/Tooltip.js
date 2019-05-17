// TODO RUBY
foam.CLASS({
  package: 'foam.u2.view',
  name: 'Tooltip',
  extends: 'foam.u2.View',
  
  documentation: `
    A 20x20 px question mark icon that shows a tooltip on hover.
  `,

  css: `
    ^tooltip {
      display: inline-flex;
      overflow:overlay;
      width: 20px;
      height: 20px;
      // position: absolute;
    }

    ^tooltip img {
      position: absolute;
    }
    
    ^tooltip-container {
      z-index: -1;
      display: none;
      width: 80%;
      height: auto;
      line-height: 1.5;
    }

    ^helper-text {
      background-color: rgba(0, 0, 0, 0.8);
      color: #fff;
      border-radius: 5px;
      direction: ltr;
      padding: 2px;
      text-align: center;
    }

    ^arrow-right {
      width: 0; 
      height: 0; 
      top: 50%;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent; 
      border-left:10px solid rgba(0, 0, 0, 0.8); 
    }

    ^arrow-left {
      width: 0; 
      height: 0; 
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent; 
      border-right:10px solid rgba(0, 0, 0, 0.8); 
    }

    ^arrow-top {
      width: 0; 
      height: 0; 
      border-left: 10px solid transparent;
      border-right: 10px solid transparent; 
      border-bottom:10px solid rgba(0, 0, 0, 0.8); 
    }

    ^arrow-bottom {
      width: 0; 
      height: 0; 
      border-left: 10px solid transparent;
      border-right: 10px solid transparent; 
      border-top:10px solid rgba(0, 0, 0, 0.8); 
    }

    ^tooltip:hover {
      position: absolute;
      width: 100%;
      height: auto;
      z-index: 100;
    }

    ^tooltip:hover .foam-u2-view-Tooltip-tooltip-container{
      display: inline-flex;
      z-index: 100;
    }    
  `,

  properties: [
    'dir'
  ],

  methods: [
    function initE() {
      // Output the icon and wire up the text which lives in the "data" property
      var self = this;
      this.SUPER();
      this.addClass(self.myClass('tooltip'))
        .callIf(self.dir == 'l', function() {
          this.style({ 'direction': 'rtl', 'float': 'right' });
        })
        .callIf(self.dir == 'r', function() {
          this.style({ 'direction': 'ltr', 'float': 'left' });
        })
        .start({
          class: 'foam.u2.tag.Image',
          data: 'images/question-icon.svg'
        })
        .end()

        .start()
          .addClass(self.myClass('tooltip-container'))
          .callIf(self.dir == 'l', function() {
            this.style({ 'margin-right': '23px' });
          })
          .callIf(self.dir == 'r', function() {
            this.style({ 'margin-left': '23px' });
          })
          .start()
            .callIf(self.dir == 'l', function() {
              this.addClass(self.myClass('arrow-right'))
            })
            .callIf(self.dir == 'r', function() {
              this.addClass(self.myClass('arrow-left'))
            })
          .end()
          .start()
            .addClass(self.myClass('helper-text'))
            .callIf(self.dir == 'l', function() {
              this.style({ 'border-top-right-radius': '0px' })
            })
            .callIf(self.dir == 'r', function() {
              this.style({ 'border-top-left-radius': '0px' })
            })
            .start('p').style({ 'padding': '3px' })
              .add(self.data)
            .end()
          .end()  
      .end()
    }
  ]
});