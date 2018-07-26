/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOCreateControllerView',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.DAOCreateController'
  ],

  imports: [
    'stack',
    'dao'
  ],

  exports: [
    'data'
  ],

  css: `
    ^ .net-nanopay-ui-ActionView {
      background: #59aadd;
      color: white;
      margin-right: 4px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOCreateController',
      name: 'data',
      factory: function() {
        return this.DAOCreateController.create({ dao: this.dao });
      }
    },
    {
      class: 'String',
      name: 'title',
      expression: function(data$dao$of) {
        return 'Create ' + data$dao$of.name;
      }
    }
  ],

  reactions: [
    [ 'data', 'finished', 'onFinished' ]
  ],

  methods: [
    function initE() {
      this.
      addClass(this.myClass()).
      start('table').
        start('tr').
          start('td').style({'vertical-align': 'top', 'width': '100%'}).
            start('span').
              style({background: 'rgba(0,0,0,0)'}).
              show(this.mode$.map(function(m) { return m == foam.u2.DisplayMode.RW; })).
              start().
                style({'padding-bottom': '4px'}).
                add(this.data.cls_.getAxiomsByClass(foam.core.Action)).
              end().
            end().
            add(this.DAOCreateController.DATA).
          end().
        end().
      end();
      /*
      this.
        add(this.DAOCreateController.DATA,
            this.data.cls_.getAxiomsByClass(foam.core.Action))
            */
    }
  ],

  listeners: [
    function onFinished() {
      this.stack.back();
    }
  ]
});
