/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foam.demos.addClass',
  name: 'Controller',
  extends: 'foam.u2.Element',

  css: `
    .com.foam.demos.addClass-bgRed {
      color: red;
    }
    .red {
      color: red;
    }
    .selected {
      color: white; 
      background-color:red; 
      padding: 10px; 
      margin: 10px 
    },
    .unselected {
      background-color: white; 
      padding: 10px; 
      margin: 10px
    },
    h2 { color: #aaa; }
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
  `,

  properties: [
    {
      class: 'String',
      name: 'animals',
      value: [ 'cat', 'dog', 'zebra', 'giraffe' ],
    },
    {
      class: 'String',
      name: 'selectedAnimal',
      value: 'cat'
    },
    'data',
    {
      //class: 'String',
      name: 'colorStyle',
      value: 'red',
      expression: function(colorStyle) {
        return this.myClass(true ? 'color' : 'red' ? 'color' : 'green');
      }
    },
  ],

  methods: [
    function initE() {
      let self = this;
      this.start('div').add('Name:').end().add(this.slot(function(animals) {
        return this.E('span').forEach(animals, function(d, index) {
          if ( self.selectedAnimal === d ) {
            var self2 = this;
            this.start('span'). //addClass(self.COLOR_STYLE.value).//attrs({color: self.COLOR_STYLE.value}).//.addClass(this.myClass('bgRed')).
              add(index).add(' ').add(d).on('click', function(e) {
              self.selectedAnimal = d;
              console.log('yes');
              self2.addClass(self.COLOR_STYLE.value);
            }).end();
            //TODO how to got the index.
          } else
            this.start('div'). //addClass(this.myClass('bgRed')).
              add(index).add(' ').add(d).on('click', //self.slt(d)
              function() {
                self.selectedAnimal = d;
                console.log('no');
                return self.start('div').add(d).addClass(self.myClass('bgRed')).end();
              }).end();
        })
      })).end();
    }
  ],
  listeners: [
    function slt(data) {
      console.log(data);
    }
  ],
});
