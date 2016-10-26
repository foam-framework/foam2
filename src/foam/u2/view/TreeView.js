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
  package: 'foam.u2.view',
  name: 'TreeViewRow',
  extends: 'foam.u2.Element',
  requires: [
    'foam.mlang.ExpressionsSingleton'
  ],
  exports: [
    'data'
  ],
  imports: [
    'selection'
  ],
  properties: [
    {
      name: 'data'
    },
    {
      name: 'relationship'
    },
    {
      class: 'Boolean',
      name: 'expanded',
      value: false
    },
    {
      class: 'Function',
      name: 'formatter'
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.
        cssClass(this.myCls()).
        start('span').
          add(this.expanded$.map(function(v) { return v ? '-' : '+'; })).
          on('click', this.toggleExpanded).
        end().
        on('click', this.selected).
        call(this.formatter).
        end().
        add(this.slot(function(e) {
          if ( ! e ) return this.E('div');

          var e = this.E('div');
          e.select(this.data[self.relationship.name], function(obj) {
            return self.cls_.create({
              data: obj,
              formatter: self.formatter,
              relationship: self.relationship
            }, this);
          });
          return e;
        }, this.expanded$));
    }
  ],
  listeners: [
    function selected() {
      this.selection = this.data;
    },
    function toggleExpanded(e) {
      this.expanded = ! this.expanded;
      e.preventDefault();
      e.stopPropagation();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TreeView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.mlang.ExpressionsSingleton',
    'foam.u2.view.TreeViewRow'
  ],
  exports: [
    'selection'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'relationship'
    },
    {
      name: 'selection'
    },
    {
      class: 'Function',
      name: 'formatter'
    }
  ],
  methods: [
    function initE() {
      var M = this.ExpressionsSingleton.create();
      var of = foam.lookup(this.relationship.sourceModel);

      var dao = this.data$proxy.where(
        M.NOT(M.HAS(of.getAxiomByName(this.relationship.inverseName))));

      var self = this;
      this.cssClass(this.myCls()).
        select(dao, function(obj) {
          return self.TreeViewRow.create({
            data: obj,
            relationship: self.relationship,
            formatter: self.formatter
          }, this);
        });
    }
  ]
});
