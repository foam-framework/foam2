/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//https://docs.angularjs.org/guide/controller#scope-inheritance-example

foam.CLASS({
  package: 'com.foam.demos.scopeInheritance',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],

  css: `
    h2 { color: #aaa; }
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
    div.spicy div {
      padding: 10px;
      border: solid 2px blue;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'timeOfDay',
    },
    {
      class: 'String',
      name: 'name',
    },
  ],

  methods: [
    function initE() {
      
      /*
        <div class="spicy">
          <div ng-controller="MainController">     
            <p>Good {{timeOfDay}}, {{name}}!</p>
        
            <div ng-controller="ChildController">
              <p>Good {{timeOfDay}}, {{name}}!</p>
        
              <div ng-controller="GrandChildController">
                <p>Good {{timeOfDay}}, {{name}}!</p>
              </div>
            </div>
          </div>
        </div>
        
        var myApp = angular.module('scopeInheritance', []);
        myApp.controller('MainController', ['$scope', function($scope) {
          $scope.timeOfDay = 'morning';
          $scope.name = 'Nikki';
        }]);
        myApp.controller('ChildController', ['$scope', function($scope) {
          $scope.name = 'Mattie';
        }]);
        myApp.controller('GrandChildController', ['$scope', function($scope) {
          $scope.timeOfDay = 'evening';
          $scope.name = 'Gingerbread Baby';
        }]);
      */

      //TODO complete the example
      this.
        start('div').addClass('spicy').
          start('div').
            start('p').add('Good ').add(this.timeOfDay).add(', ').add(this.name).add('!').end().
              start('div').
                start('p').add('Good ').add(this.timeOfDay).add(', ').add(this.name).add('!').end().
                  start('div').
                    start('p').add('Good ').add(this.timeOfDay).add(', ').add(this.name).add('!').end().
                  end().
              end().
          end();    
    },
  ],

  actions: [
  ],
  listeners: [
  ],
});
