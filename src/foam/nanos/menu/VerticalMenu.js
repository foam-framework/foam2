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
  package: 'foam.nanos.menu',
  name: 'VerticalMenu',
  extends: 'foam.u2.View',
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'currentMenu',
    'menuListener',
    'loginSuccess',
    'menuDAO',
    'pushMenu',
  ],
  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.VerticalMenu',
    'foam.dao.ArraySink'
  ],
  css: `
  input {
    width: 220px;
  }

  ^ .side-nav-view {
    font-size: medium!important;
    font-weight: normal;
    display: inline-block;
    position: absolute;
    height: calc(100vh - 80px);
    width: 240px;
    overflow-y: scroll;
    overflow-x: hidden;
    z-index: 100;
    font-size: 26px;
    color: /*%GREY2%*/ #9ba1a6;
    border-right: 1px solid /*%GREY4%*/ #e7eaec;
    background: /*%GREY5%*/ #f5f7fas;
  }

  .foam-u2-search-TextSearchView {
    text-align: center;
    margin: 4px 0;
  }

  ^ .foam-u2-view-TreeViewRow-label {
    font-weight: 300;
  }

  ^ .foam-u2-view-TreeViewRow {
    width: 100%;
    mergin: 0;
  }
  `,
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'subMenu',
      documentation: 'Used to store selected submenu element after window reload and scroll into parent view'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao_',
      factory: function() {
        return this.menuDAO.orderBy(this.Menu.ORDER);
      }
    },
    {
      name: 'menuSearch',
      class: 'String',
      value: ''
    }
  ],
  methods: [
    function initE() {
      var self = this;

      this
      .addClass(this.myClass())
      .start()
      .addClass('side-nav-view')
      .start()
      .startContext({ data: this })
      .start()
        .add(self.MENU_SEARCH.clone().copyFrom({ view: {
          class: 'foam.u2.view.TextField',
          type: 'search',
          onKey: true
        } }))
        .addClass('foam-u2-search-TextSearchView')
      .end()
      .endContext()
      .start()
        .tag({ 
          class: 'foam.u2.view.TreeView',
          data: self.dao_,
          relationship: foam.nanos.menu.MenuMenuChildrenRelationship,
          startExpanded: true,
          query: self.menuSearch$,
          onClickAddOn: function(data) { self.openMenu(data); },
          formatter: function(data) { this.add(data.label); }
        })
      .end()
    .end();

   // this.subMenu$.dot('state').sub(this.scrollToCurrentSub);
    },

    function openMenu(menu) {
      if ( Object.keys(menu.handler.instance_).length > 0 ) {
        this.pushMenu(menu.id);
        this.menuListener(menu);
      }
    }
  ]
});