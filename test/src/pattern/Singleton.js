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

describe('Singleton axiom', function() {
  it('object sharing works', function() {
    foam.CLASS({
      name: 'Test',
      axioms: [
        foam.pattern.Singleton.create()
      ]
    });
    var a = Test.create();
    var b = Test.create();
    expect(a).toBe(b);
  });

  it('cloneing is disabled', function() {
    var a = Test.create();
    expect(a).toBe(a.clone());
  });

  it('equals works', function() {
    var a = Test.create();
    var b = Test.create();
    expect(a).toEqual(b);
    expect(b).toEqual(a);
  });

  it('Singleton to be a Singleton', function() {
    var a = foam.pattern.Singleton.create();
    var b = foam.pattern.Singleton.create();
    expect(a).toBe(b);
  });
});
