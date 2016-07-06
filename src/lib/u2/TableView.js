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
  refines: 'foam.core.Property',
  properties: [
    {
      name: 'tableFormatter',
      value: function(obj) {
        return obj[this.name];
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'TableView',
  extends: 'foam.u2.Element',
  properties: [
    {
      class: 'Class2',
      name: 'of'
    },
    [ 'nodeName', 'table' ],
    {
      name: 'properties_',
      expression: function(properties, of) {
        var cls = this.of$cls;
        return properties.map(function(p) { return cls.getAxiomByName(p); });
      }
    },
    {
      name: 'properties',
      expression: function(of) {
        return this.of$cls && this.of$cls.getAxiomsByClass(foam.core.Property)
                              .filter(function(p) { return ! p.hidden; })
                              .map(foam.core.Property.NAME.f)
      }
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        old && old.on.unsub(this.onDAOUpdate);
        nu && nu.on.sub(this.onDAOUpdate);
        this.onDAOUpdate();
      }
    },
    {
      name: 'header',
      expression: function(properties_) {
        var E = this.E('thead');
        var e = E;

        if ( ! properties_ ) {
          return e.add("'of' or 'properties' is required for table view configuration.");
        }

        e = e.start('tr');
        for ( var i = 0 ; i < properties_.length ; i++ ) {
          e = e.start('td').add(properties_[i].label).end();
        }
        e = e.end();

        return E;
      }
    },
    {
      name: 'rows',
      factory: function() { return []; }
    },
    {
      name: 'body',
      expression: function(rows, properties_) {
        var E = this.E('tbody');
        var e = E;

        if ( ! rows || ! properties_ ) return E;

        for ( var i = 0 ; i < rows.length ; i++ ) {
          e = e.start('tr')
          var obj = rows[i];
          for ( var j = 0 ; j < properties_.length ; j++ ) {
            var prop = properties_[j];
            e = e.start('td').add(prop.tableFormatter(obj, e)).end();
          }
          e = e.end();
        }
        return E;
      }
    }
  ],
  methods: [
    function initE() {
      this.onDAOUpdate();
      return this.add(this.header$, this.body$);
    }
  ],
  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.data.select().then(function(a) { this.rows = a.a; }.bind(this));
      }
    }
  ]
});
