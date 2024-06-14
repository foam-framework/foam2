/**
 * @license Copyright 2019 The FOAM Authors. All Rights Reserved.
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

//TODO apply the css style (color) just for the clicked element. 

foam.CLASS({
  package: 'com.foamdev.demos.addCssToClass',
  name: 'Controller',
  extends: 'foam.u2.Element',

  css: `
    .com.foam.demos.addCssToClass-bgRed {
      color: red;
    }
    .green {
      color: green;
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
      // class: 'String',
      name: 'colorStyle',
      value: 'red',
      expression: function(colorStyle) {
        return this.myClass(colorStyle);// === 'red' ? 'red' : 'green');
      }
    },
  ],

  methods: [
    function initE() {
      let self = this;
      this.start('div').add('Name:').end().add(this.slot(function(animals) {
        return this.E('span').forEach(animals, function(d, index) {
          var self2 = this;
          if ( self.selectedAnimal === d ) {
            this.start('span').                                
              add(index).add(' ').add(d).on('click', function(e) {
              self.selectedAnimal = d;
              self.colorStyle='red';
              console.log('yes');
              self2.addClass(self.COLOR_STYLE.value);
            }).end();
            // TODO how to got the index.
          } else
            this.start('div').
              add(index).add(' ').add(d).on('click',
              function() {
                self.selectedAnimal = d;
                self.colorStyle='green';
                console.log('no');
                return self.start('div').add(d).addClass(self.myClass('green')).end();
              }).end();
        })
      })).end();
    }
  ]
});
