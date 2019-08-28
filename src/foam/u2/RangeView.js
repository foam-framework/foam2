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
  name: 'RangeView',
  extends: 'foam.u2.tag.Input',

  properties: [
    [ 'type', 'range' ],
    [ 'step', 0 ],
    [ 'minValue', 0 ],
    [ 'maxValue', 100 ],
    [ 'onKey', true ]
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.step ) this.attrs({step: this.step});
      this.attrs({min: this.minValue, max: this.maxValue$});
    }
  ]
});
