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
      class: 'Function',
      name: 'rowFactory',
      required: true,
//    documentation: 'Three options: a class name (eg. "my.app.ui.Foo"), an ' +
//        'actual class object, or a function(args, context) returning an ' +
//        'Element.',
      adapt: function(old, nu) {
        if ( typeof nu === 'function' ) return nu;

        if ( typeof nu === 'string' ) {
          return function(args, ctx) {
            return ctx.lookup(nu).create(args, ctx);
          };
        }
        return function(args, ctx) {
          return nu.create(args, ctx);
        };
      }
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
        put: this.onDAOPut,
        eof: function() { }
      });
    }
  ],

  listeners: [
    function onDAOPut(obj) {
      if ( this.rows_[obj.id] ) {
        this.rows_[obj.id].data = obj;
        return;
      }

      var ctx   = this.__subContext__.createSubContext();
      var child = this.rowFactory({ data: obj }, ctx);
      child.on('click', this.rowClick.pub.bind(this.rowClick, obj));

      this.rows_[obj.id] = child;
      this.add(child);
    },

    function onDAORemove(obj) {
      if ( this.rows_[obj.id] ) {
        this.removeChild(this.rows_[obj.id]);
        delete this.rows_[obj.id];
      }
    },

    function onDAOReset() {
      this.removeAllChildren();
      this.rows_ = {};
      this.reloadData();
    }
  ]
});
