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

describe('Listener', function() {
  it('Cannot override non-listener, even if its a method.', function() {
    foam.CLASS({
      name: 'Parent',
      methods: [
        function foo() { this.SUPER(); } // need SUPER to trigger override
      ]
    });

    expect(function() {
      foam.CLASS({
        name: 'Child',
        extends: 'Parent',
        listeners: [
          function foo() {}
        ]
      });
      Child.create();
    }).toThrow();
  });
});

describe('Listener', function() {
  it('Can use SUPER', function() {
    var parentCalled = false;

    foam.CLASS({
      name: 'Parent',
      listeners: [
        function foo() {
          parentCalled = true;
        }
      ]
    });

    var childCalled = false;

    foam.CLASS({
      name: 'Child',
      extends: 'Parent',
      listeners: [
        function foo() {
          this.SUPER();
          childCalled = true;
        }
      ]
    });

    Child.create().foo();

    expect(parentCalled).toBe(true);
    expect(childCalled).toBe(true);
  });
});
