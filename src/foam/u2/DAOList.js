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
  extends: 'foam.u2.Element',

  topics: [ 'rowClick' ],

  exports: [
    'selection',
    'hoverSelection'
  ],

  imports: [
    'editRecord?',
    'selection? as importSelection'
  ],

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
    'selection',
    'hoverSelection'
  ],

  methods: [
    function initE() {
      var view = this;
      this.
        addClass(this.myClass()).
        select(this.data$proxy, function(obj) {
          return ( this.rowView ?
                       foam.u2.ViewSpec.createView(this.rowView, { data: obj }, this, this.__subSubContext__) :
                       this.rowFactory$f({ data: obj }) ).
              on('mouseover', function() { view.hoverSelection = obj; }).
              on('click', function() {
                view.selection = obj;
                if ( view.importSelection$ ) view.importSelection = obj;
                if ( view.editRecord$ ) view.editRecord(obj);
                view.rowClick.pub(obj)
              }).
              addClass(this.slot(function(selection) {
                if ( obj === selection ) return view.myClass('selected');
                  return '';
              }, view.selection$));
        });
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

});
