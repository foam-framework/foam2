/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

describe('class whitelist context', function() {
  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'Thing',

      properties: ['id', 'stuff'],
    });
  });

  it('should lookup() whitelisted class', function() {
    var testThing = foam.box.ClassWhitelistContext.create({
      whitelist: ['__Property__', 'test.Thing']
    }).__subContext__.lookup('test.Thing');
    expect(testThing).toBe(test.Thing);
  });

  it('should throw in lookup() of non-whitelisted class', function() {
    expect(function() {
      foam.box.ClassWhitelistContext.create({
        whitelist: ['__Property__']
      }).__subContext__.lookup('test.Thing');
    }).toThrow();
  });
});
