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
  package: 'foam.u2',
  name: 'TableCellRefinement',
  refines: 'foam.core.Property',
  properties: [
    {
      name: 'tableCellView',
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

  requires: [
    'foam.u2.TableCellRefinement'
  ],

  properties: [
    [ 'nodeName', 'tbody' ],
    [ 'properties_' ]
  ],

  methods: [
    function addObj(obj) {
      var e = this.start('tr')
      for ( var j = 0 ; j < this.properties_.length ; j++ ) {
        var prop = this.properties_[j];
        e = e.start('td').add(prop.tableCellView(obj, e)).end();
      }
      e.end();
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableBodySink',
  extends: 'foam.dao.AbstractSink',

  requires: [
    'foam.u2.TableBody'
  ],

  properties: [
    'properties_',
    {
      name: 'body',
      factory: function() { return this.TableBody.create({ properties_: this.properties_ }); }
    }
  ],
  methods: [
    function put(obj) {
      this.body.addObj(obj);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableHeader',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.order.Desc',
    'foam.u2.Entity'
  ],

  imports: [
    'tableView'
  ],

  properties: [
    {
      name: 'properties_',
      required: true
    },
    'sortOrder'
  ],

  methods: [
    function initE() {
      this.nodeName = 'thead';

      var e = this.start('tr');
      for ( var i = 0 ; i < this.properties_.length ; i++ ) {
        var sorting$ = this.sortOrder$.map(function(prop, order) {
          if ( ! order ) return '';
          var desc = this.Desc.isInstance(order);
          var baseOrder = desc ? order.arg1 : order;
          return prop.name === baseOrder.name ?
              this.Entity.create({ name: desc ? 'darr' : 'uarr' }) : '';
        }.bind(this, this.properties_[i]));

        e.start('td')
            .enableCls(this.myCls('sorting'), sorting$)
            .start('span')
                .cssClass(this.myCls('sort-direction'))
                .add(sorting$)
            .end()
            .add(this.properties_[i].label)
            .on('click', this.tableView.sortBy.bind(this.tableView,
                  this.properties_[i]))
            .end();
      }
      e.end();
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.order.Desc',
    'foam.u2.TableHeader'
  ],

  exports: [
    'as tableView'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^sorting {
          font-weight: bold;
        }

        ^sort-direction {
          display: none;
          margin-right: 8px;
        }
        ^sorting ^sort-direction {
          display: initial;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Class2',
      name: 'of',
      required: true
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
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'header',
      expression: function(properties_) {
        return this.TableHeader.create({
          properties_: properties_,
          sortOrder$: this.sortOrder$
        });
      }
    },
    {
      name: 'body',
      factory: function() { return this.E('tbody'); }
    },
    {
      name: 'sortOrder'
    }
  ],

  methods: [
    function initE() {
      this.data$proxy.sub('on', this.onDAOUpdate);
      this.onDAOUpdate();
      return this.add(this.header$, this.body$);
    },

    function sortBy(prop) {
      // Two cases: same as the current prop, or different.
      var sortName = this.sortOrder ?
          (this.Desc.isInstance(this.sortOrder) ? this.sortOrder.arg1.name :
              this.sortOrder.name) :
          '';
      if ( sortName === prop.name ) {
        // Invert the previous order.
        this.sortOrder = this.Desc.isInstance(this.sortOrder) ?
            prop : this.Desc.create({ arg1: prop });
      } else {
        // Set it to the new column.
        this.sortOrder = prop;
      }
      this.onDAOUpdate();
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var dao = this.data;
        if ( this.sortOrder ) {
          dao = dao.orderBy(this.sortOrder);
        }
        dao.select(foam.u2.TableBodySink.create({
          properties_: this.properties_
        }, this)).then(function(a) {
          this.body = a.body;
        }.bind(this));
      }
    }
  ]
});
