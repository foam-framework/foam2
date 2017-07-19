/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'CheckBox',
  extends: 'foam.u2.tag.Input',

  documentation: 'Checkbox View.',

  properties: [
    { 
      class: 'Boolean', 
      name: 'data' 
    },
    {
      class: 'Boolean',
      name: 'showLabel',
      value: true
    },
    { 
      class: 'String', 
      name: 'label' 
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'checkbox');

      if ( this.showLabel ) { 
        this.start('label')
          .addClass(this.myClass('label'))
          .addClass(this.myClass('noselect'))
          .add(this.label$)
          .on('click', function() { 
            this.data = !this.data; 
          }.bind(this))
        .end();
      }
    },
    function link() {
      this.data$.linkTo(this.attrSlot('checked'));
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ {
        -webkit-appearance: none;
        border-radius: 2px;
        border: solid 2px #5a5a5a;
        box-sizing: border-box;
        display: inline-block;
        fill: rgba(0, 0, 0, 0);

        height: 18px;
        width: 18px;

        opacity: 1;

        transition: background-color 140ms, border-color 140ms;

        margin-bottom: 7px;
      }

      ^:checked {
        background-color: #04a9f4;
        border-color: #04a9f4;
        fill: white;
      }

      ^:focus{
        outline:0;
      }

      ^:checked:after {
        content: url(data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2048%2048%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%20version%3D%221.1%22%3E%0A%20%20%20%3Cpath%20fill%3D%22white%22%20stroke-width%3D%223%22%20d%3D%22M18%2032.34L9.66%2024l-2.83%202.83L18%2038l24-24-2.83-2.83z%22/%3E%0A%3C/svg%3E);
      }

      ^label {
        color: #444;
        flex-grow: 1;
        margin-left: 12px;
        overflow: hidden;
        white-space: nowrap;
        display: inline;
        margin-top: 5px;
        position: absolute;
      }

      ^noselect {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    */}
    })
  ]
});
