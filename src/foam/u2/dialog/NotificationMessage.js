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
  package: 'foam.u2.dialog',
  name: 'NotificationMessage',
  extends: 'foam.u2.View',

  documentation: 'error message handler for merchant app.',

  properties: [
    {
      class: 'String',
      name: 'type'
    },
    'message',
  ],

  css: `
    ^ {
      width: 250px;
      padding: 20px 60px;
      background: #cff0e1;
      position: fixed;
      top: 100px;
      right: 100px;
      border: 1px solid #2cab70;
      animation-name: fade;
      animation-duration: 4s;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: center;
      z-index: 15000;
    }
    @keyframes fade {
      0% { opacity: 0; }
      10% { opacity: 1; }
      80% { opacity: 1; }
      100% { opacity: 0; }
    }
    ^error-background{
      background: #f4cccc;
      border: 1px solid #f33d3d;
    }
    ^ .close-x{
      right: 5px;
      top: 10px;
    }
    ^ .foam-u2-ActionView-close{
      width: 30px;
      height: 30px;
      position: absolute;
      left: 0px;
      top: -5px;
      z-index: 101;
      opacity: 0.01;
    }
    ^ .close-x {
      position: absolute;
      width: 32px;
      height: 32px;
      opacity: 0.3;
    }
    ^ .close-x:hover {
      opacity: 1;
    }
    ^ .close-x:before, .close-x:after {
      position: absolute;
      content: ' ';
      height: 20px;
      width: 2px;
      background-color: #333;
    }
    ^ .close-x:before {
      transform: rotate(45deg);
    }
    ^ .close-x:after {
      transform: rotate(-45deg);
    }
  `,

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .enableClass(this.myClass('error-background'), this.type === 'error')
        .start()
          .callIfElse(foam.String.isInstance(this.message), function() {
            this.add(self.message);
          }, function() {
            this.tag(self.message);
          })
        .end()
        .startContext({ data: this })
          .start().addClass('close-x').add(this.CLOSE).end()
        .endContext();

        setTimeout(function() {
          self.remove();
        }, 3900);
    }
  ],

  actions: [
    {
      name: 'close',
      label: '',
      code: function(X) {
        X.data.remove();
      }
    }
  ]
});
