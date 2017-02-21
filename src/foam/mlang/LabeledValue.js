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
  package: 'foam.mlang',
  name: 'LabeledValue',

  documentation: 'A basic model for any id-label-value triple. This is ' +
      'useful when you need essentially a DAO of strings, and need to wrap ' +
      'those strings into a modeled object.',

  properties: [
    {
      name: 'id',
      expression: function(label) { return label; }
    },
    {
      class: 'String',
      name: 'label',
      required: true
    },
    {
      name: 'value'
    }
  ]
});
