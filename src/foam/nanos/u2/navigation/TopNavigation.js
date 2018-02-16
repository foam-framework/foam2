/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.u2.navigation',
  name: 'TopNavigation',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar',

  requires: [
    'foam.nanos.menu.MenuBar',
    'foam.nanos.u2.navigation.BusinessLogoView',
    'foam.nanos.u2.navigation.UserView'
  ],

  imports: [
    'menuDAO',
    'user',
    'logo'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: #093649;
          width: 100%;
          min-width: 992px;
          height: 60px;
          color: white;
          padding-top: 5px;
        }
        ^ .topNavContainer {
          width: 100%;
          margin: auto;
        }
        ^ .menuBar > div > ul {
          margin-top: 0;
          padding-left: 0;
          font-weight: 100;
          color: #ffffff;
        }
        ^ .foam-nanos-menu-MenuBar li {
          display: inline-block;
          cursor: pointer;
        }
        ^ .menuItem{
          display: inline-block;
          padding: 20px 0 10px 0px;
          cursor: pointer;
          border-bottom: 4px solid transparent;
          transition: text-shadow;
        }
        ^ .menuItem:hover {
          border-bottom: 4px solid #1cc2b7;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }
        ^ .selected {
          border-bottom: 4px solid #1cc2b7;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }
        ^ .menuBar{
          width: 50%;
          overflow: auto;
          white-space: nowrap;
          margin-left: 60px;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.menuDAO; }
    }
  ],

  methods: [
    function initE(){
      var self = this;
      this
        .addClass(this.myClass())
        .start().addClass('topNavContainer')
          .callIf( this.logo, function(){
            this.start({class: 'foam.nanos.u2.navigation.BusinessLogoView'})
            .end()
          })
          .start({class: 'foam.nanos.menu.MenuBar'}).addClass('menuBar')
          .end()
          .callIf( this.user.firstName, function(){
            this.start({class: 'foam.nanos.u2.navigation.UserView'})
            .end()
          })
        .end()
    }
  ]
});
