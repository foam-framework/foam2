/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  name: 'DAOControllerView',
  extends: 'foam.u2.Element',

  imports: [
    'stack'
  ],

  exports: [
    'editRecord'
  ],

  requires: [
    'foam.graphics.ScrollCView',
    'foam.mlang.sink.Count',
    'foam.comics.DAOController',
  ],

  properties: [
    'data',
    'of',
    {
      name: 'controller',
      factory: function() {
        return this.DAOController.create({
          of$: this.of$,
          data$: this.data$
        });
      }
    },
    {
      name: 'countSink',
      expression: function(data) {
        // TODO detach the previous sink.
        var c = this.Count.create();
        data.pipe(c);
        return c;
      }
    },
    {
      name: 'scroller',
      factory: function() {
        return this.ScrollCView.create({
          size$: this.countSink$.dot('value'),
          value$: this.controller$.dot('skip'),
          extent$: this.controller$.dot('limit'), // TODO find out how many fit.
          height: 600, // TODO use window height.
          width: 40,
          handleSize: 40,
          // TODO wire up mouse wheel
          // TODO clicking away from scroller should deselect it.
        });
      }
    }
  ],

  methods: [
    function editRecord(obj) {
      this.stack.push({
        class: 'foam.comics.DAOUpdateControllerView',
        of: this.of,
        data: obj.id
      });
    },
    function initE() {
      this.startContext({ data: this.controller }).
        start('table').
          start('tr').
            start('td').add(this.DAOController.PREDICATE).end().
            start('td').style({ 'vertical-align': 'top', 'width': '100%' }).add(this.DAOController.FILTERED_DAO).end().
            start('td').add(this.scroller).end().
          end().
          start('tr').
            start('td').end().
            start('td').add(this.DAOController.CREATE).end().
        end().
        endContext();
    }
  ]
});
