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

describe('imports/exports tests', function() {
  it('with inheritence', function() {
    foam.CLASS({
      name: 'Importer',
      imports: [
        'a',
        'b',
        'c?' // not required, so will not throw error when missing
      ]
    });

    foam.CLASS({
      name: 'Abc',
      exports: [
        'a'
      ],
      properties: [
        [ 'a', 1 ]
      ]
    });

    foam.CLASS({
      name: 'Def',
      extends: 'Abc',
      requires: [ 'Importer' ],
      exports: [
        'b'
      ],
      properties: [
        [ 'b', 2 ]
      ],
      methods: [
        function createImporter() { return this.Importer.create(); }
      ]
    });

    var def      = Def.create(undefined, foam.__context__);
    var importer = def.createImporter();


    expect(importer.a).toBe(1);
    expect(importer.b).toBe(2);
    expect(importer.c).toBe(undefined);
  });
});
