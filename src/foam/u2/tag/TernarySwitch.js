/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

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
      min-width: 100pt;
      height: 20pt;
      border: 1px solid %GREY3%;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
    }
    ^ .segment {
      position: absolute;
      box-sizing: border-box;
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
    ^ .clickable {
      position: absolute;
      top: 0; height: 100%;
      transition: all 100ms ease-in-out;
      width: 50%;
      background-color: rgba(0,0,0,0);
    }
    ^ .clickable:hover {
      background-color: rgba(0,0,0,0.03);
    }
    ^ .clickleft {
      left: 0;
    }
    ^ .clickright {
      left: 50%;
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
    ^ .ghost {
      pointer-events: none;
      opacity: 0;
      position: absolute;
      box-sizing: border-box;
      border-radius: 50%;
      background-color: %PRIMARY2%;
      top: 3pt;
      transition: all 50ms ease-in-out;
    }
    ^ .clickable:hover .ghost {
      opacity: 0.3;
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
        .addClass(this.myClass())
        .start()
          .addClass('outer')
          .style({
            height: this.height$,
          })
          .start()
            .addClass('segment')
            .addClass('true')
            .style({ 'line-height': this.height$ })
            .add(this.slot(function (ternaryState) {
              return ( ternaryState === 2 ) ? this.labelFalse : this.labelTrue;
            }))
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
                state == 2 ? 'rgba(0,0,0,0.5)' : 'inherit'),
              'padding-right': this.ternaryState$.map(state =>
                state == 2 ? `calc( 0.5 * ${this.markerWidth} )` : '0'),
            })
          .end()
          .start()
            .addClass('segment')
            .addClass('false')
            .style({ 'line-height': this.height$ })
            .add(this.slot(function (ternaryState) {
              return ( ternaryState === 2 ) ? this.labelTrue : this.labelFalse;
            }))
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
                state == 2 ? 'rgba(0,0,0,0.5)' : 'inherit'),
              'padding-left': this.ternaryState$.map(state =>
                state == 2 ? `calc( 0.5 * ${this.markerWidth} )` : '0'),
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
          .start()
            .addClass('clickable')
            .addClass('clickleft')
            .start()
              .addClass('ghost')
              .style({
                width: this.markerWidth$.map(w => `calc(${w} - 6pt)`),
                height: this.markerWidth$.map(w => `calc(${w} - 6pt)`),
                'background-color': this.ternaryState$.map(s => s === 2 ?
                  this.theme.primary2 : this.theme.black),
                left: this.ternaryState$.map(state =>
                  ( state === 1 || state === 2 ) ? '3pt' :
                    `calc(100% - 0.5*${this.markerWidth})`)
              })
            .end()
            .on('click', () => {
              if ( this.ternaryState === 2 ) this.ternaryState = 0;
              else
              if ( this.ternaryState === 1 ) this.ternaryState = 0;
              else
              if ( this.ternaryState === 0 ) this.ternaryState = 2;
            })
          .end()
          .start()
            .addClass('clickable')
            .addClass('clickright')
            .start()
              .addClass('ghost')
              .style({
                width: this.markerWidth$.map(w => `calc(${w} - 6pt)`),
                height: this.markerWidth$.map(w => `calc(${w} - 6pt)`),
                'background-color': this.ternaryState$.map(s => s === 2 ?
                  this.theme.primary2 : this.theme.black),
                right: this.ternaryState$.map(state =>
                  ( state === 0 || state === 2 ) ? '3pt' :
                    `calc(100% - 0.5*${this.markerWidth})`)
              })
            .end()
            .on('click', () => {
              if ( this.ternaryState === 2 ) this.ternaryState = 1;
              else
              if ( this.ternaryState === 1 ) this.ternaryState = 2;
              else
              if ( this.ternaryState === 0 ) this.ternaryState = 1;
            })
          .end()
        .end()
    }
  ]
})