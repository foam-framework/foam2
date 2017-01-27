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

describe('Method', function() {
  it('Cannot override non-method', function() {
    foam.CLASS({
      name: 'Parent',
      properties: ['foo']
    });

    expect(function() {
      foam.CLASS({
        name: 'Child',
        extends: 'Parent',
        methods: [
          function foo() { this.SUPER(); } // need SUPER to trigger override
        ]
      });
      Child.create(undefined, foam.__context__);
    }).toThrow();
  });
});
