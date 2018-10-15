/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//https://docs.angularjs.org/guide/services

foam.CLASS({
  package: 'com.foam.demos.usingService',
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
      name: 'message',
      value: 'test'
    },
  ],

  methods: [
    function initE() {

      /*
        <div id="simple" ng-controller="MyController">
          <p>Let's try this simple notify service, injected into the controller...</p>
          <input ng-init="message='test'" ng-model="message" > //With the ng-model directive you can bind the value of an input field to a variable created in AngularJS.
          <button ng-click="callNotify(message);">NOTIFY</button>
          <p>(you have to click 3 times to see an alert)</p>
        </div>

        factory('notify', ['$window', function(win) {
           var msgs = [];
           return function(msg) {
               msgs.push(msg);
               if (msgs.length === 3) {
               win.alert(msgs.join('\n'));
               msgs = [];
               }
           };
         }]);

      */

      this.start('div').attrs({id: 'simple'}).
        start('p').add("Let's try this simple notify service, injected into the controller... ").end().
        start().add(this.MESSAGE).
          start('button').add('callNotify').on('click', this.callNotify).end().
        end().
        start('p').add('(you have to click 3 times to see an alert)').end().
      end();
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
