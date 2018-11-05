/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//https://docs.angularjs.org/guide/scope#scope-as-data-model

foam.CLASS({
  package: 'com.foam.demos.scopeDataModel',
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
      class: 'Array',
      name: 'msgs',
    },
    {
      class: 'String',
      name: 'greeting',
      value: 'World'
    },
  ],

  methods: [
    function initE() {

      /*
        <div ng-controller="MyController">
          Your name:
              <input type="text" ng-model="username">
              <button ng-click='sayHello()'>greet</button>
          <hr>
          {{greeting}}
        </div>
      */

      this.start('div').add('Your name:').add(this.GREETING).
          start('button').add('sayHello').on('click', this.sayHello).end(). //TODO on-click the bottom.
        end().
        tag('hr').
        start().add('Hello ').add(this.greeting$).add('!').end();
    }
  ],

  listeners: [
    function callNotify() {
      console.log(this.msgs);
      this.msgs.push(this.message);
      if ( this.msgs.length === 3 ) {
        window.alert(this.msgs.join('\n'));
        console.log('callNotify ' + this.message);
        this.msgs = [];
      }
    }
  ],
});
