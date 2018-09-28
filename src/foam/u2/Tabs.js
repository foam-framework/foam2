/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO: don't instantiate tabs until viewed

foam.CLASS({
  package: 'foam.u2',
  name: 'Tab',
  extends: 'foam.u2.Element',

  properties: [
    { class: 'String',  name: 'label' },
    { class: 'Boolean', name: 'selected' }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Tabs',
  extends: 'foam.u2.Element',

  requires: [ 'foam.u2.Tab' ],

  css: `
    ^ {
      background: gray;
      display: block;
      height: 200px;
      padding: 10px 4px;
      width: 600px;
      // width: 100%;
    }
    ^tabRow { height: 38px; }
    ^tab {
      background: lightgray;
      border: 1px solid black;
      border-radius: 3px 3px 0 0;
      display: inline-block;
      height: 12px;
      padding: 8px;
    }
    ^tab.selected {
      background: white;
      position: relative;
      z-index: 1;
    }
    ^bottomEdge {
      background: white;
      height: 2.5px;
      left: 0;
      position: absolute;
      top: 27px;
      width: 100%;
    }
    ^content {
      margin: 4px;
      padding: 6px;
      background: white;
      border: 1px solid black;
      position: relative;
      top: -13px;
      left: -4px;
    }
  `,

  properties: [
    /* not used
    {
      name: 'tabs',
      factory: function() { return []; }
    },
    */
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o ) o.selected = false;
        n.selected = true;
      }
    },
    'tabRow'
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        start('div', null, this.tabRow$).
          addClass(this.myClass('tabRow')).
        end().
        start('div', null, this.content$).
          addClass(this.myClass('content')).
        end();
    },

    function add(tab) {
      if ( this.Tab.isInstance(tab) ) {

        if ( ! this.selected ) this.selected = tab;

        this.tabRow.start('span').
          addClass(this.myClass('tab')).
          enableClass('selected', tab.selected$).
          on('click', function() { this.selected = tab; }.bind(this)).
          add(tab.label).
        end();

        tab.shown$ = tab.selected$;
      }

      this.SUPER(tab);
    }
  ]
});
