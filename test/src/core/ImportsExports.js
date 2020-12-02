/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
