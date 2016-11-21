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

foam.CLASS({
  package: 'foam.u2',
  name: 'DetailView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.core.Property',
    'foam.u2.DetailPropertyView'
  ],

  exports: [
    'currentData as data',
    'controllerMode'
  ],

  properties: [
    {
      name: 'data',
      attribute: true,
      preSet: function(_, data) {
        var of = data && data.cls_;
        if ( of !== this.of ) {
          this.of = of;
        } else {
          this.currentData = data;
        }
        return data;
      }
    },
    'currentData',
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'showActions'
    },
    {
      name: 'properties',
      // TODO: Make an FObjectArray when it validates properly
      preSet: function(_, ps) {
        this.assert(ps, 'Properties required.');
        for ( var i = 0 ; i < ps.length ; i++ ) {
          this.assert(
              foam.core.Property.isInstance(ps[i]),
              "Non-Property in 'properties' list:",
              ps);
        }
        return ps;
      },
      expression: function(of) {
        if ( ! of ) return [];
        return this.of.getAxiomsByClass(foam.core.Property).
            filter(function(p) { return ! p.hidden; });
      }
    },
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      name: 'actions',
      expression: function(of) {
        return this.of.getAxiomsByClass(foam.core.Action);
      }
    },
    {
      name: 'controllerMode',
      attribute: true
    },
    {
      name: 'title',
      attribute: true,
      expression: function(of) { return this.of.model_.label; },
      // documentation: function() {/*
      //  <p>The display title for the $$DOC{ref:'foam.ui.View'}.
      //  </p>
      //*/}
    },
    [ 'nodeName', 'div' ]
  ],

  templates: [
    function CSS() {/*
      ^ {
        background: #fdfdfd;
        border: solid 1px #dddddd;
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        display: inline-block;
        margin: 5px;
        padding: 3px;
      }
      ^ table {
        padding-bottom: 2px;
      }
      ^title {
        color: #333;
        float: left;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        padding: 2px;
      }
      ^toolbar {
        margin-left: 5px;
      }
      ^ input {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
      ^ textarea {
        border: solid 1px #aacfe4;
        float: left;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        overflow: auto;
        padding: 4px 2px;
        width: 98%;
      }
      ^ select {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
    */}
  ],

  methods: [
    function initE() {
      var self = this;
      this.add(this.slot(function(of, properties) {
        if ( ! of ) return '';

        // Binds view to currentData instead of data because there
        // is a delay from when data is updated until when the UI
        // is rebuilt if the data's class changes. Binding directly
        // to data causes views and actions from the old class to get
        // bound to data of a new class, which causes problems.
        self.currentData = self.data;

        var title = self.title && self.E('tr').
          start('td').cssClass(self.myCls('title')).attrs({colspan: 2}).
            add(this.title$).
          end();

        return self.actionBorder(
          self.
            E('table').
            cssClass(self.myCls()).
            add(title).
            add(properties.map(function(p) {
              var config = self.config && self.config[p.name];

              if ( config ) {
                p = p.clone();
                for ( var key in config ) {
                  p[key] = config[key];
                }
              }

              return self.DetailPropertyView.create({prop: p});
            })));
      }));
    },

    function actionBorder(e) {
      if ( ! this.showActions || ! this.actions.length ) return e;

      return this.E().add(e).
        start('div').cssClass(this.myCls('toolbar')).add(this.actions).end();
    }
  ]
});
