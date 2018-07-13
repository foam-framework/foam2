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

  imports: [ 'menuDAO', 'user', 'loginSuccess' ],

  css: `
    ^ {
      background: %PRIMARYCOLOR%;
      width: 100%;
      min-width: 992px;
      height: 60px;
      color: white;
      padding-top: 5px;
    }
    ^ .logged-in-container {
      display: flex;
    }
    ^ .menuBar {
      flex-grow: 2;
      overflow: auto;
      white-space: nowrap;
      margin-left: 60px;
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
    ^ .menuItem {
      display: inline-block;
      padding: 20px 0 5px 0px;
      cursor: pointer;
      border-bottom: 1px solid transparent;
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .menuItem:hover, ^ .menuItem.hovered {
      cursor: pointer;
      padding-bottom: 5px;
      border-bottom: 1px solid white;
    }
    ^ .selected {
      border-bottom: 4px solid %ACCENTCOLOR% !important;
      padding-bottom: 5px;
      text-shadow: 0 0 0px white, 0 0 0px white;
    }
    ^ .welcome-label {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1.25;
      letter-spacing: 0.3px;
      width: 100%;
      height: calc(100% - 5px); /* Compensate for 5px padding-top of topnav */
    }
    ^ .menuBar{
      width: auto;
      overflow: auto;
      white-space: nowrap;
      margin-left: 60px;
    }
  `,

  properties: [
    {
      name: 'dao',
      factory: () => this.menuDAO
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass('logged-in-container')
          .show(this.loginSuccess$)
          .tag({ class: 'foam.nanos.u2.navigation.BusinessLogoView' })
          .start({ class: 'foam.nanos.menu.MenuBar' })
            .addClass('menuBar')
          .end()
          .tag({ class: 'foam.nanos.u2.navigation.UserView' })
        .end()
        .start()
          .add('Welcome').addClass('welcome-label').hide(this.loginSuccess$)
        .end();
    }
  ]
});
