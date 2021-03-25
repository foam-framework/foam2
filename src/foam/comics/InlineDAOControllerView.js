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
  name: 'InlineDAOControllerView',
  extends: 'foam.comics.DAOControllerView',

  exports: [
    'click',
    'click as dblclick'
  ],

  imports: [
    'stack'
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'defaultSummaryView_',
      value: {
        class: 'foam.u2.view.ScrollTableView',
        enableDynamicTableHeight: false
      }
    }
  ],

  methods: [
    function initE() {
      var view = foam.u2.ViewSpec.createView(this.summaryView, {
        data$: this.data.filteredDAO$,
        multiSelectEnabled: !! this.data.relationship,
        selectedObjects$: this.data.selectedObjects$
      },
      this,
      this.__subContext__.createSubContext({ memento: null }));

      this.
        add(view).
        start('span').
          show(this.mode$.map(function(m) { return m == foam.u2.DisplayMode.RW; })).
          add(this.cls.getAxiomsByClass(foam.core.Action)).
        end();
    },
    function click(obj, id) {
      if ( ! this.stack ) return;

      this.stack.push({
        class: 'foam.comics.v2.DAOSummaryView',
        data: obj,
        config: foam.comics.v2.DAOControllerConfig.create({ dao: this.__subContext__[this.data.data.targetDAOKey] }),
        idOfRecord: id,
        backLabel: 'Back'
      }, this.__subContext__.createSubContext({ memento: null }));
    }
  ]
});
