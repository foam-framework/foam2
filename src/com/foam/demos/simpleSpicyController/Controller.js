/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foam.demos.simpleSpicyController',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],

  css: `
    h2 { color: #aaa; }
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
  `,

  properties: [
    {
      class: 'String',
      name: 'spice',
      value: 'very',
    },
  ],

  methods: [
    function initE() {

      /*
        <div ng-controller="SpicyController">
         <button ng-click="chiliSpicy()">Chili</button>
         <button ng-click="jalapenoSpicy()">JalapeÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±o</button>
        
         onclick="alert('Hello world!')"
         
         <p>The food is {{spice}} spicy!</p>
        </div>>
        </div>
        
        var myApp = angular.module('spicyApp1', []);
        
        myApp.controller('SpicyController', ['$scope', function($scope) {
              $scope.spice = 'very';
        
              $scope.chiliSpicy = function() {
                $scope.spice = 'chili';
              };
        
              $scope.jalapenoSpicy = function() {
                $scope.spice = 'jalapeÃƒÂ±o';
              };
        }]);
      */

      this.start('div').add(this.SPICE).end().
        start('div').add(this.CHILI_SPICY).end().
        start('button').add('jalapeno').on('click', this.jalapenoSpicy).end().
        start('p').add('The food is ').add(this.spice$).add(' spicy!').end().
        start('button').add('Custom spice').on('click', this.spicyFunction).end()
      ;

    },
    function spicyFunction() { //TODO this function need to be triggered when we click on the button to realize the affectation.
      this.spice = this.spice$;
      console.log(this.spice);
    }
  ],

  actions: [
    {
      name: 'chiliSpicy',
      label: 'Chili',
      speechLabel: 'Chili',
      toolTip: 'Chili',
      code: function() {
        console.log('chiliSpicy');
        this.spice = 'Chili';
      }
    },
  ],
  listeners: [
    function jalapenoSpicy(evt) {
      console.log('jalapenoSpicy');
      this.spice = 'Jalapeno';
    }
  ],
});
