/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foam.demos.toggleClassIf',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],

  css: `
    ^titleRed{/*.com-foam-demos-toggleClassIf-Controller-title*/
      color: yellow;
      background-color: red;
    }
    .com-foam-demos-toggleClassIf-Controller-titleGreen{
      color: white;
      background-color: green;
    }
    ^bgRed{/*.com-foam-demos-toggleClassIf-Controller-bgRed*/
      color: white;
      background-color: red;
    }
    .com-foam-demos-toggleClassIf-Controller-bgGreen{
      color: white;
      background-color: green;
    }
    h2 { color: #aaa; }
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
    .highlight {
    background: yellow;
  }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'color',
      view: {
        class: 'foam.u2.CheckBox',
        onKey: true
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.
        start('div').add(this.COLOR).addClass(this.color$.map(function(color) {
            return color ? self.myClass('titleRed') : self.myClass('titleGreen')
          })). // need to be evalueted foreach change, this mean that we need a slot.
        add('Visibility :').end().
        start('div').add(this.YOUR_NAME).add(this.slot(function(color) {
          //console.log(color);
          if ( color )
            return this.E('span').start().addClass(this.myClass('bgRed')).add('yes').end();
          else
            return this.E('span').start().addClass(this.myClass('bgGreen')).add('no').end(); //we can use .removeClass(this.myClass('bgcus')) but in this context, we recreate the dom 
          })).
        end();
    }
  ]
});
