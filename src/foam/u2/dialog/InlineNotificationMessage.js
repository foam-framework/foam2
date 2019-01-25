/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.u2.dialog',
  name: 'InlineNotificationMessage',
  extends: 'foam.u2.View',

  documentation: `
    Inline notification message container.
  `,

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    'message',
    'data'
  ],

  css: `
    ^ {
      display: flex;
      position: relative;
      justify-content: center;
      z-index: 15000;
    }
    ^inner {
      width: 90vw;
      max-width: 1024px;
      margin: auto;
      padding: 8px 24px;
      animation-name: fade;
      animation-duration: 10s;
      font-size: 14px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      background: #f6fff2;
      border: 1px solid #03cf1f;
      display: flex;
      justify-content: space-between;
    }
    ^status-icon {
      margin-right: 10px;
      vertical-align: middle;
    }
    ^message {
      display: inline-block;
      vertical-align: middle;
    }
    ^error-background {
      background: #fff6f6;
      border: 1px solid #f91c1c;
    }
    ^warning-background {
      background: #f5f4ff;
      border: 1px solid #604aff;
    }
  `,

  methods: [
    function initE() {
      var img;
      if ( this.type === 'error' ) {
        img = 'images/inline-error-icon.svg';
      } else if ( this.type === 'warning' ) {
        img = 'images/information-small-purple.svg';
      } else {
        img = 'images/checkmark-small-green.svg';
      }
      this
        .hide(this.message$.map(function(msg) {
          return msg == '' || msg == undefined;
        }))
        .addClass(this.myClass())
        .start().addClass(this.myClass('inner'))
          .enableClass(this.myClass('error-background'), this.type === 'error')
          .enableClass(this.myClass('warning-background'), this.type === 'warning')
          .start()
            .start('img')
              .addClass(this.myClass('status-icon'))
              .attrs({ src: img })
            .end()
            .start()
              .addClass(this.myClass('message'))
              .add(this.message)
            .end()
          .end()
        .end();
    }
  ]
});
