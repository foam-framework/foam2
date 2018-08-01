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

describe('ArraySink', function() {
  describe('serialization', function() {
    var objectifier;
    var stringifier;
    var parser;
    beforeEach(function() {
      objectifier = foam.json.Outputter.create({
        outputDefaultValues: false
      });
      stringifier = foam.json.Strict;
      parser = foam.json.Parser.create({ strict: true });

      foam.CLASS({
        package: 'test',
        name: 'Item',

        properties: [ 'id' ]
      });
      foam.CLASS({
        package: 'test',
        name: 'Item2',
        extends: 'test.Item'
      });
    });

    it('should handle no "of"', function() {
      expect(objectifier.objectify(foam.dao.ArraySink.create({array: [
          test.Item.create({ id: 0 })
      ] }))).toEqual({ class: 'foam.dao.ArraySink', array: [
        { class: 'test.Item', id: 0 }
      ] });
      expect(stringifier.stringify(foam.dao.ArraySink.create({array: [
          test.Item.create({ id: 0 })
      ] }))).toBe('{"class":"foam.dao.ArraySink","array":[{"class":"test.Item","id":0}]}');
    });
    it('should handle "of"', function() {
      foam.assert(test.Item.create({ id: 1 }).instance_, '!!!');

      var sink = foam.dao.ArraySink.create({
        of: 'test.Item',
        array: [
          test.Item.create({ id: 0 }),
          test.Item2.create({ id: 1 })
        ]
      });
      var str = stringifier.stringify(sink);
      expect(str).toBe('{"class":"foam.dao.ArraySink","of":{"class":"__Class__","forClass_":"test.Item"},"array":[{"id":0},{"class":"test.Item2","id":1}]}');
      var sink2 = parser.parseString(str);
      expect(foam.util.equals(sink, sink2)).toBe(true);
    });
  });
});
