/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//https://docs.angularjs.org/guide/filter#using-filters-in-controllers-services-and-directives

foam.CLASS({
  package: 'com.foam.demos.scopeEventsPropagation',
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
      class: 'Int',
      name: 'count',
      value: 0,
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
        <div ng-controller="FilterController as ctrl">
          <div>
            All entries:
            <span ng-repeat="entry in ctrl.array">{{entry.name}} </span>
          </div>
          <div>
            Entries that contain an "a":
            <span ng-repeat="entry in ctrl.filteredArray">{{entry.name}} </span>
          </div>
        </div>
      */

      this.
        start('div').
          add('Root scope ').start('tt').add('MyEvent').end().add(' count: ').add(this.count$).end().

          start('ul').
            start('li').  //<li ng-repeat="i in [1]" ng-controller="EventController">      
              start('button').add('emit("MyEvent")').on('click', this.MyEvent).end().
              start('button').add('broadcast("MyEvent")').on('click', this.MyEvent).end().
              tag('br').
              start().add('Middle scope ').start('tt').add('MyEvent').end().add(' count: ').add(this.count$).end().
              start('ul').
                //<li ng-repeat="item in [1, 2]" ng-controller="EventController">//TODO create a n array add to the foreach 
                start('li').                                                     //TODO we need to have different scope.
                    start().add('Leaf scope ').start('tt').add('MyEvent').end().add(' count: ').add(this.count$).end().
                end().
              end().
            end().
          end().
        end();  
    }
  ],

  listeners: [
    function MyEvent() {
        console.log(this.count++);
    }
  ],
});
