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
  name: 'DAOList',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.ViewSpec'
  ],

  // documentation: 'Expects its data to be a DAO, and renders one viewFactory for each one.',

  topics: [ 'rowClick' ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView'
    },
    {
      // deprecated
      class: 'foam.u2.ViewFactory',
      name: 'rowFactory'
    },
    {
      name: 'rows_',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function initE() {
      // Just starts out empty.
      this.
        cssClass(this.myCls()).
        on('click', this.onClick);

      var dao = this.data$proxy;
      // Kick off the select(), that will populate the view.
      dao.on.put.sub(this.onDAOPut);
      dao.on.remove.sub(this.onDAORemove);
      dao.on.reset.sub(this.onDAOReset);
      this.reloadData();
    },

    function createRowView(obj, ctx) {
      // TODO: remove rowFactory support when all code ported
      return this.rowView ?
        this.ViewSpec.createView(this.rowView, {data: obj}, this, ctx) :
        this.rowFactory$f({data: obj}, ctx) ;
    },

    function reloadData() {
      this.data.select({
        put: this.daoPut,
        eof: function() { }
      });
    }
  ],

  listeners: [
    function onClick(e) {
      var c = this.findChildForEvent(e);
      if ( c ) this.rowClick.pub(c.data);
    },

    function daoPut(obj) {
      if ( this.rows_[obj.id] ) {
        this.rows_[obj.id].data = obj;
        return;
      }

      var child = this.createRowView(obj, this.__subContext__.createSubContext());
      this.rows_[obj.id] = child;
      this.add(child);
    },

    function onDAOPut(_, __, ___, obj) {
      this.daoPut(obj);
    },

    function daoRemove(obj) {
      if ( this.rows_[obj.id] ) {
        this.removeChild(this.rows_[obj.id]);
        delete this.rows_[obj.id];
      }
    },

    function onDAORemove(_, __, ___, obj) {
      this.daoRemove(obj);
    },

    function onDAOReset() {
      this.removeAllChildren();
      this.rows_ = {};
      this.reloadData();
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.RelationshipDAO',
  
  requires: [
    'foam.u2.CitationView',
    'foam.u2.DAOList'
  ],
  
  methods: [
    function toE(args, ctx) {
      args = args || {};
      args.data = this;
      args.rowView = this.CitationView;
      return this.DAOList.create(args, ctx);
    }    
  ]
  
})
