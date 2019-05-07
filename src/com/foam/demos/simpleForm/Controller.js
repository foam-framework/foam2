/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//https://docs.angularjs.org/guide/forms

foam.CLASS({
  package: 'com.foam.demos.simpleForm',
  name: 'Controller',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],

  requires: [
    'com.foam.demos.simpleForm.User',
  ],

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
      class: 'Int',
      name: 'count',
      value: 0,
    },
    {
      class: 'String',
      name: 'greeting',
      value: 'World'
    },
    {
      of: 'com.foam.demos.simpleForm.User',
      name: 'user',
      value: {
        name: 'toto'
      },
    },
  ],

  methods: [
    function initE() {

      /*
        <div ng-controller="ExampleController">
          <form novalidate class="simple-form">
              <label>Name: <input type="text" ng-model="user.name" /></label><br />
              <label>E-mail: <input type="email" ng-model="user.email" /></label><br />
              Best Editor: <label><input type="radio" ng-model="user.preference" value="vi" />vi</label>
              <label><input type="radio" ng-model="user.preference" value="emacs" />emacs</label><br />
              <input type="button" ng-click="reset()" value="Reset" />
              <input type="submit" ng-click="update(user)" value="Save" />
          </form>
          <pre>user = {{user | json}}</pre>
          <pre>master = {{master | json}}</pre>
        </div>
        
        <script>
          angular.module('formExample', [])
              .controller('ExampleController', ['$scope', function($scope) {
              $scope.master = {};
        
              $scope.update = function(user) {
                $scope.master = angular.copy(user);
              };
        
              $scope.reset = function() {
                $scope.user = angular.copy($scope.master);
              };
        
              $scope.reset();
              }]);
        </script>
      */
      console.log(this.user);
      console.log(this.data);

      this.start('div').
        //<form novalidate class="simple-form">
        start('form').addClass('simple-form').start('label').add('Name: ').add(this.user.NAME). //TODO <label>Name: <input type="text" ng-model="user.name" /></label><br />
        //add(this.data.name).          //TODO use data.
        end().tag('br').start('label').add('E-mail: ').add(this.user.EMAIL). //TODO <label>E-mail: <input type="email" ng-model="user.email" /></label><br />
        end().tag('br').add('Best Editor: ').start('label').
        //add(this.user.PREFERENCE).   //TODO render preference ????   

        start('input').attrs({
        type: 'radio',
        value: 'vi',
        name: 'ide'
      }).end().add('vi').start('label').start('input').attrs({
        type: 'radio',
        value: 'emacs',
        name: 'ide'
      }).end().add('emacs').tag('br').start('input').attrs({
        type: 'button',
        value: 'Reset'
      }).end(). //TODO 'ng-click':"reset()", 

        start('input').attrs({
        type: 'submit',
        value: 'Save'
      }).end(). //TODO 'ng-click':"update(user)", Add function

        end().start('pre').add('user = {{user | json}}').add(this.user.name$).add(this.user.email$).add(this.user.preference$).end(). //<pre>user = {{user | json}}</pre>
        start('pre').add('master = {{master | json}}').end(). //<pre>master = {{master | json}}</pre>
        end();
    }
  ],

  listeners: [
    function MyEvent() {
      console.log(this.count++);
    }
  ],
});

foam.CLASS({
  package: 'com.foam.demos.simpleForm',
  name: 'User',

  properties: [
    {
      class: 'Int',
      name: 'id',
      final: true // TODO: implement
    },
    {
      class: 'String',
      name: 'name',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'email',
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'preference',
      view: {
        // class: 'foam.u2.view.ChoiceView',
        class: 'foam.u2.view.RadioView',
        choices: [
          'vi',
          'viemacs',
        ]
      }
    },
  ]
});
