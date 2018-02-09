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
  package: 'org.mozilla.mdn',
  name: 'ActionButton',
  extends: 'foam.u2.Element',

  axioms: [
    foam.u2.CSS.create({
      code: `
^ {
  position: relative;
}

^label {
  color: inherit;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  display: inline-block;
  padding: 1rem;
}

^label:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
`
    }),
  ],

  properties: [
    'data',
    'action',
    {
      name: 'icon',
      expression: function(action) { return action.icon; }
    }
  ],

  methods: [
    function initE() {
      this.nodeName = 'span';
      this.addClass(this.myClass())
          .start('i').addClass('material-icons').addClass(this.myClass('label'))
          .add(this.icon)
          .end()
          .on('click', this.onClick);

      if (this.action.isAvailable) {
        this.enableClass(this.myClass('unavailable'),
              this.action.createIsAvailable$(this.data$), true /* negate */);
      }

      if (this.action.isEnabled) {
        this.attrs({
          disabled: this.action.createIsEnabled$(this.data$).map(function(e) {
            return e ? false : 'disabled';
          })
        });
      }
    }
  ],

  listeners: [
    function onClick() {
      this.action.maybeCall(this.__subContext__, this.data);
    }
  ]
});
