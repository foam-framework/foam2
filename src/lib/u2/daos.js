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

  // documentation: 'Expects its data to be a DAO, and renders one viewFactory for each one.',

  topics: [ 'rowClick' ],

  properties: [
    {
      class: 'foam.u2.ViewFactory',
      name: 'rowFactory',
      required: true
    },
    {
      name: 'rows_',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function initE() {
      // Just starts out empty.
      this.cssClass(this.myCls());

      // Kick off the select(), that will populate the view.
      this.data.on.put.sub(this.onDAOPut);
      this.data.on.remove.sub(this.onDAORemove);
      this.data.on.reset.sub(this.onDAOReset);
      this.reloadData();
    },

    function reloadData() {
      this.data.select({
        put: this.daoPut,
        eof: function() { }
      });
    }
  ],

  listeners: [
    function daoPut(obj) {
      if ( this.rows_[obj.id] ) {
        this.rows_[obj.id].data = obj;
        return;
      }

      var ctx   = this.__subContext__.createSubContext();
      var child = this.rowFactory$f({ data: obj }, ctx);
      child.on('click', function() {
        this.rowClick.pub(child.data);
      }.bind(this));

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
