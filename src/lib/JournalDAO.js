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
  package: 'foam.dao',
  name: 'JournalEntry',
  properties: [
    {
      name: 'id',
    },
    {
      class: 'FObjectProperty',
      name: 'record'
    },
    {
      class: 'Boolean',
      name: 'isRemove',
      value: false
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'JournalDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.JournalEntry'
  ],
  properties: [
    {
      name: 'journal'
    }
  ],
  methods: [
    function put(obj) {
      return this.delegate.put(obj).then(function(obj) {
        this.journal.put(this.JournalEntry.create({
          record: obj
        }));
        return obj;
      }.bind(this));
    },
    function remove(obj) {
      return this.delegate.remove(obj).then(function(r) {
        this.journal.put(this.JournalEntry.create({
          record: obj,
          isRemove: true
        }));
        return r;
      }.bind(this));
    }
  ]
});
