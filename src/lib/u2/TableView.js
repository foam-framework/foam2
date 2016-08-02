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
  name: 'TableBody',
  extends: 'foam.u2.Element',

  properties: [
    [ 'nodeName', 'tbody' ],
    [ 'properties_' ]
  ],

  methods: [
    function put(obj) {
      var e = this.start('tr')
      for ( var j = 0 ; j < this.properties_.length ; j++ ) {
        var prop = this.properties_[j];
        e = e.start('td').add(prop.tableFormatter(obj, e)).end();
      }
      e.end();
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
        if ( ! this.of$cls ) return undefined;

        var tableProperties = this.of$cls.getAxiomByName('tableProperties');

        if ( tableProperties ) return tableProperties.properties;

        return this.of$cls.getAxiomsByClass(foam.core.Property)
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
      name: 'body',
      factory: function() { return this.E('tbody'); }
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
        this.data.select(foam.u2.TableBody.create({ properties_: this.properties_ })).then(
          function(a) { this.body = a; }.bind(this));
      }
    }
  ]
});
