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

describe('Multiton axiom', function() {
  it('object sharing works', function() {
    foam.CLASS({
      name: 'Test',
      axioms: [
        foam.pattern.Multiton.create({property: 'id'})
      ],
      properties: [ 'id' ]
    });
    var a1 = Test.create({id: 'a'});
    var a2 = Test.create({id: 'a'});
    var b  = Test.create({id: 'b'});
    expect(a1.id === 'a');
    expect(a2.id === 'a');
    expect(b.id === 'a');
    expect(a1 === a2);
    expect(a1 !== b);
  });

  it('cloneing is disabled', function() {
    var a1 = Test.create({id: 'a'});
    expect(a1 === a1.clone());
  });

  it('equals works', function() {
    var a1 = Test.create({id: 'a'});
    var a2 = Test.create({id: 'a'});
    var b  = Test.create({id: 'b'});
    expect(a1.equals(a2));
    expect(a2.equals(a1));
    expect(! a1.equals(b));
    expect(! b.equals(a1));
  });
});
