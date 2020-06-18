foam.CLASS({
  package: 'foam.u2.tag',
  name: 'TernarySwitch',
  extends: 'foam.u2.Element',

  document: `
    An element that looks like a three-position switch and updates its data
    slot corresponding to its state as one of these values:
      0 ("No"), 1 ("Yes"), 2 (default).
  `,

  imports: [
    'theme'
  ],

  css: `
    ^ .outer {
      position: relative;
      display: inline-block;
      width: 60pt;
      height: 20pt;
      border: 1px solid %GREY3%;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
    }
    ^ .segment {
      position: absolute;
      overflow: hidden;
      text-align: center;
      top: 0; height: 100%;
      text-align: center;
      line-height: 20pt;
      font-family: Helvetica, sans-serif;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: -moz-none;
      -o-user-select: none;
      user-select: none;
      transition: all 100ms ease-in-out;
    }
    ^ .true {
      left: 0;
      width: 50%;
      background-color: %APPROVAL4%;
    }
    ^ .false {
      right: 0;
      width: 50%;
      background-color: %DESTRUCTIVE4%;
    }
    ^ .marker {
      position: absolute;
      box-sizing: border-box;
      border-radius: 5px;
      top: 0; height: 100%; width: 10pt;
      left: calc(50% - 5pt);
      border: 1px solid black;
      transition: all 100ms ease-in-out;
      background-image: linear-gradient(to bottom, #ffffff, #e7eaec);
      border: 1px solid %GREY4%;
    }
  `,

  properties: [
    {
      // Note: 'state' is already a property of Elemenet
      name: 'ternaryState',
      class: 'Int'
    },
    {
      name: 'labelTrue',
      value: 'True'
    },
    {
      name: 'labelFalse',
      value: 'False'
    },
    {
      name: 'width',
      class: 'String',
      value: '60pt'
    },
    {
      name: 'height',
      class: 'String',
      value: '20pt'
    },
    {
      name: 'markerWidth',
      class: 'String',
      value: '10pt'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .on('click', () => {
          if ( this.ternaryState === 2 ) this.ternaryState = 1;
          else
          if ( this.ternaryState === 1 ) this.ternaryState = 0;
          else
          if ( this.ternaryState === 0 ) this.ternaryState = 2;
        })
        .addClass(this.myClass())
        .start()
          .addClass('outer')
          .style({
            width: this.width$,
            height: this.height$,
          })
          .start()
            .addClass('segment')
            .addClass('true')
            .style({ 'line-height': this.height$ })
            .add(this.labelTrue)
            .style({
              width: this.ternaryState$.map(state =>
                state === 2 ? '50%' :
                state === 1 ? '100%' :
                '0%'
                ),
              'background-color': this.ternaryState$.map(state =>
                state == 2 ? 'rgba(0,0,0,0)' :
                  this.theme.approval4),
              'color': this.ternaryState$.map(state =>
                state == 2 ? 'rgba(0,0,0,0)' : 'inherit')
            })
          .end()
          .start()
            .addClass('segment')
            .addClass('false')
            .style({ 'line-height': this.height$ })
            .add(this.labelFalse)
            .style({
              width: this.ternaryState$.map(state =>
                state === 2 ? '50%' :
                state === 0 ? '100%' :
                '0%'
                ),
              'background-color': this.ternaryState$.map(state =>
                state == 2 ? 'rgba(0,0,0,0)' :
                  this.theme.destructive4),
              'color': this.ternaryState$.map(state =>
                state == 2 ? 'rgba(0,0,0,0)' : 'inherit')
            })
          .end()
          .start()
            .addClass('marker')
            .style({
              width: this.markerWidth$,
              left: this.ternaryState$.map(state =>
                state === 2 ? `calc(50% - 0.5*${this.markerWidth})` :
                state === 0 ? '0%' :
                `calc(100% - ${this.markerWidth})`),
              'border-color': this.ternaryState$.map(state =>
                state === 2 ? this.theme.grey4 : this.theme.white)
            })
          .end()
        .end()
    }
  ]
})