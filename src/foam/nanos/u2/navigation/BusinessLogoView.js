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
  name: 'BusinessLogoView',
  extends: 'foam.u2.View',

  imports: [
    'theme'
  ],

  documentation: 'View to display business logo and name.',

  css: `
    ^{
      width: 175px;
      display: inline-block;
      text-align: center;
      padding-top: 3px;
      padding-left: 25px;
    }
    ^ img {
      height: 30px;
      padding-top: 10px;
      cursor: pointer;
    }
    ^ span{
      position: relative;
      font-weight: 300;
      font-size: 16px;
      margin-left: 10px;
    }
    ^business-name{
      width: 70%;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
      white-space: nowrap;
      top: -35;
      height: 20px;
      display: inline-block;
      vertical-align: middle;
      margin-top: 32px;
      margin-left: 5px;
    }
    ^placeholder-business{
      width: 40px;
      height: 40px;
      margin: 5px;
      border-radius: 50%;
      background: white;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .tag({
            class: 'foam.u2.tag.Image',
            data$: this.theme$.dot('logo')
          })
          .on('click', this.goToDefault)
        .end();
    }
  ],

  listeners: [
    function goToDefault() {
      if ( this.group ) {
        window.location.hash = this.group.defaultMenu;
      }
    },
  ]
});
