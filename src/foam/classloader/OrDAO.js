/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.classloader',
  name: 'OrDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.DedupSink',
  ],

  documentation: 'DAO composite which performs find() in second delegate if not found in first.',

  properties: [
    {
      name: 'primary',
      help: 'This is the DAO to look things up in first.'
    }
  ],

  methods: [
    function find_(x, id) {
      var self = this;
      return this.primary.find_(x, id).then(function(o) {
        return o || self.delegate.find_(x, id);
      });
    },
    function select_(x, sink, skip, limit, order, predicate) {
      var self = this;
      sink = sink || self.ArraySink.create();
      var ddSink = self.DedupSink.create({delegate: sink})
      return self.primary.select_(x, ddSink, skip, limit, order, predicate).then(function() {
        return self.delegate.select_(x, ddSink, skip, limit, order, predicate)
      }).then(function() {
        return sink;
      });
    },
  ]
});
