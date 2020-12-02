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
  extends: 'foam.u2.property.AbstractCheckBox',

  documentation: 'Checkbox View.',

  css: `
    ^ {
      margin: 8px 0;
      padding: 8px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'checkbox');

      var self = this;

      if ( this.showLabel ) {
        this.start('label')
          .addClass(this.myClass('label'))
          .addClass(this.myClass('noselect'))
          .callIfElse(this.labelFormatter,
            this.labelFormatter,
            function() { this.add(self.label$); })
          .on('click', function() {
            if ( self.getAttribute('disabled') ) return;
            this.data = ! this.data;
          }.bind(this))
        .end();
      }
    }
  ]
});
