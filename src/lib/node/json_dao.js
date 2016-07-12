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
  package: 'foam.dao.node',
  name: 'JSONFileDAO',
  extends: 'foam.dao.ArrayDAO',

  properties: [
    {
      class: 'String',
      name: 'path',
      factory: function() {
        return this.of.name + '.json';
      }
    },
    {
      name: 'fs_',
      factory: function() {
        return require('fs');
      }
    }
  ],

  methods: [
    function init() {
      var data;
      try {
        data = this.fs_.readFileSync(this.path).toString();
      } catch(e) { }

      if (data && data.length) {
        this.array = foam.json.parse(foam.json.parseString(data));
      }

      this.on.put.sub(this.updated);
      this.on.remove.sub(this.updated);

      // TODO: base on an indexed DAO
    }
  ],

  listeners: [
    {
      name: 'updated',
      isMerged: 100,
      code: function() {
        this.fs_.writeFileSync(this.path, foam.json.stringify(this.array));
      }
    }
  ]
});
