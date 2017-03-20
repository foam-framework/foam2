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

describe('JSONFileDAO', function() {
  var path = require('path');
  var fs = require('fs');
  var tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'foam2_tests', ''));
  var tmpFile = path.join(tmpDir, 'test.json');
  genericDAOTestBattery(function(model) {
    try { fs.unlinkSync(tmpFile); } catch(e) {}
    return Promise.resolve(foam.dao.node.JSONFileDAO.create({ path: tmpFile, of: model }));
  });

  afterAll(function() {
    try { fs.unlinkSync(tmpFile); fs.rmdirSync(tmpDir); } catch(e) {}
  });

  it('should actually persist to a JSON file', function(done) {
    // Make sure the file is empty before we start.
    try { fs.unlinkSync(tmpFile); } catch(e) { }

    foam.CLASS({
      package: 'test.dao.node.json_file',
      name: 'TestModel',
      properties: ['id', 'name'],
    });

    var dao = foam.dao.node.JSONFileDAO.create({
      path: tmpFile,
      of: 'test.dao.node.json_file.TestModel',
    });

    Promise.all([
      dao.put(test.dao.node.json_file.TestModel.create({ id: 1, name: 'foo' }, foam.__context__)),
      dao.put(test.dao.node.json_file.TestModel.create({ id: 2, name: 'bar' }, foam.__context__)),
      dao.put(test.dao.node.json_file.TestModel.create({ id: 3, name: 'baz' }, foam.__context__))
    ]).then(function() {
      // Wait 150ms to ensure the file has really been written.
      return new Promise(function(res) { setTimeout(res, 150); });
    }).then(function() {
      dao = null;
      expect(fs.statSync(tmpFile).isFile()).toBe(true);

      var dao2 = foam.dao.node.JSONFileDAO.create({
        path: tmpFile,
        of: 'test.dao.node.json_file.TestModel',
      });

      return dao2.select();
    }).then(function(a) {
      expect(a).toBeDefined();
      expect(a.a).toBeDefined();
      expect(a.a.length).toBe(3);
      expect(a.a[1].name).toBe('bar');
    }).then(done);
  });
});
