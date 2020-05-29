foam.CLASS({
  package: 'foam.u2.wizard.util',
  name: 'CircleIndicator',
  extends: 'foam.u2.Element',

  requires: [
    'foam.core.ExpressionSlot'
  ],

  css: `
    ^ {
      position: relative;
      border-radius: 50%;
      text-align: center;
      display: inline-block;
    }
    ^ > img {
      position: absolute;
      top: 0;
      bottom: 0;
      pointer-events: none;
      z-index: -1;
    }
  `,

  properties: [
    // Configuration
    {
      name: 'label',
      class: 'String'
    },
    {
      name: 'borderColor',
      class: 'String'
    },
    {
      name: 'borderColorHover',
      class: 'String'
    },
    {
      name: 'textColor',
      class: 'String',
      expression: function (stateBorderColor_) { return stateBorderColor_; }
    },
    {
      name: 'backgroundColor',
      class: 'String'
    },
    {
      name: 'borderThickness',
      class: 'Int'
    },
    {
      name: 'icon',
      class: 'Image'
    },
    {
      name: 'size',
      class: 'Int',
      value: 30
    },

    // State
    {
      name: 'hasMouseOver',
      class: 'Boolean',
      value: false
    },
    {
      name: 'stateBorderColor_',
      expression: function ( borderColor, borderColorHover, hasMouseOver ) {
        return hasMouseOver ? borderColorHover : borderColor;
      }
    },
    {
      name: 'clickable',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .style({
          'background-color': this.backgroundColor,
          'border-color': this.stateBorderColor_$,
          'width': '' + this.size + 'px',
          'height': '' + this.size + 'px',
          'line-height': '' + this.size + 'px',
          'font-size': this.size * 0.65,
          'color': this.textColor$,
          'border': '' + this.borderThickness + 'px solid',
          'cursor': this.ExpressionSlot.create({
            obj: this,
            code: function (clickable) {
              return clickable ? 'pointer' : 'default';
            }
          }),
        })
        .on('mouseover', () => {
          this.hasMouseOver = true;
        })
        .on('mouseout', () => {
          this.hasMouseOver = false;
        })
        .attr('border')
        ;

      if ( this.icon ) {
        this.start('img')
          .attr('src', this.icon$)
          .style({
            'width': '' + this.size + 'px',
            'height': '' + this.size + 'px',
          })
        .end();
      }

      if ( this.label !== '' ) {
        this.add(this.label)
      }
    }
  ]
})
