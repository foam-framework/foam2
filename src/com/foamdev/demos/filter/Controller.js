/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// This example demonstrate the manner to filter an array of String.
// https://docs.angularjs.org/guide/filter

foam.CLASS({
  package: 'com.foamdev.demos.filter',
  name: 'Controller',
  extends: 'foam.u2.Controller',// it will automatically exports: ['this as data']

  css: `
    body, input[text] { color: #888; font-family: Cambria, Georgia; }
    div.spicy div {
      padding: 10px;
      border: solid 2px blue;
    }
  `,

  properties: [
    {
      name: 'entry',
      value: [
        {
          name: 'Tobias'
        },
        {
          name: 'Jeff'
        },
        {
          name: 'Brian'
        },
        {
          name: 'Igor'
        },
        {
          name: 'James'
        },
        {
          name: 'Brad'
        }
      ]
    }
  ],

  methods: [
    function initE() {

      /*
        <div ng-controller="EventController">
          Root scope <tt>MyEvent</tt> count: {{count}}
          <ul>
              <li ng-repeat="i in [1]" ng-controller="EventController">
              <button ng-click="$emit('MyEvent')">$emit('MyEvent')</button>
              <button ng-click="$broadcast('MyEvent')">$broadcast('MyEvent')</button>
              <br>
              Middle scope <tt>MyEvent</tt> count: {{count}}
              <ul>
                <li ng-repeat="item in [1, 2]" ng-controller="EventController">
                  Leaf scope <tt>MyEvent</tt> count: {{count}}
                </li>
              </ul>
              </li>
          </ul>
        </div>
      */

      this.start('div').start('div').add('All entries:').
        start('span').
          start().add(this.slot(function(entry) {
            return this.E('span').forEach(
              entry, function(e) {
                this.add(' ').add(e.name);
              })
            })).
          end().
        end().
        
        start('div').add('Entries that contain an "a":').add(this.slot(function(entry) {
          return this.E('span').forEach(
              entry.filter(function(p) {
                console.log(p.name.indexOf('a') > - 1);return p.name.indexOf('a') > - 1
              })
              , function(e) {
                this.add(' ').add(e.name);
              })})).
        end().
      end();
    }
  ],
});
