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
  package: 'foam.u2.view',
  name: 'ScrollTableView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.dao.FnSink',
    'foam.graphics.ScrollCView',
    'foam.mlang.sink.Count',
    'foam.u2.view.TableView'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'Int',
      name: 'limit',
      value: 18,
      // TODO make this a funciton of the height.
    },
    {
      class: 'Int',
      name: 'skip',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'scrolledDao',
      expression: function(data, limit, skip) {
        return data.limit(limit).skip(skip);
      },
    },
    {
      name: 'scrollView',
      factory: function() {
        var self = this;
        return this.ScrollCView.create({
          value$: this.skip$,
          extent$: this.limit$,
          height: 40*18+48, // TODO use window height.
          width: 22,
          handleSize: 40,
          // TODO wire up mouse wheel
          // TODO clicking away from scroller should deselect it.
        });
      },
    },
    {
      name: 'tableView',
      factory: function() {
        return this.TableView.create({data$: this.scrolledDao$});
      },
    },
  ],

  listeners: [
    {
      // TODO Avoid onDaoUpdate approaches.
      name: 'onDaoUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data$proxy.select(this.Count.create()).then(function(s) {
          self.scrollView.size = s.value;
        })
      },
    },
  ],

  methods: [
    function init() {
      this.onDetach(this.data$proxy.pipe(this.FnSink.create({fn:this.onDaoUpdate})));
    },

    function initE() {
      // TODO probably shouldn't be using a table.
      this.start('table').
        start('tr').
          start('td').style({ 'vertical-align': 'top' }).add(this.tableView).end().
          start('td').style({ 'vertical-align': 'top' }).add(this.scrollView).end().
        end().
      end();
    }
  ]
});
