/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//https://docs.angularjs.org/guide/scope#scope-hierarchies

foam.CLASS({
  package: 'com.foam.demos.scopeHierarchies',
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
    .show-scope-demo  {
      border: 1px solid red;
      margin: 3px;
    }
  `, 

  properties: [
    {
      name: 'ListController',
      value: [ 'Igor', 'Misko', 'Vojta' ],
    },
    {
      class: 'String',
      name: 'name',
      value: 'World'
    },
    {
      class: 'String',
      name: 'department',
      value: 'AngularJS'
    },
  ],

  methods: [
    function initE() {

      /*
        <div class="show-scope-demo">
          <div ng-controller="GreetController">
              Hello {{name}}!
          </div>
          <div ng-controller="ListController">
              <ol>
              <li ng-repeat="name in names">{{name}} from {{department}}</li>
              </ol>
          </div>
        </div>
      */

      this.start('div').addClass('show-scope-demo').add('Hello ').add(this.name$).end('div').
          start('ol').addClass('show-scope-demo').add(this.slot(function(ListController, department) {
            return this.E('span').forEach(ListController, function(val) {
              this.start('li').addClass('show-scope-demo').add(val).add(' from ').add(department).end();
            })
          })).
        end();
    }
  ],
});
