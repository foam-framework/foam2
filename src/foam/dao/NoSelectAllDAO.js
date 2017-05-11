/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'NoSelectAllDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.False'
  ],

  documentation: 'DAO Decorator which prevents \'select all\', ie. a select() with no query, limit, or skip.',

  methods: [
    function select(sink, skip, limit, order, predicate) {
        if ( predicate &&
             ( ( this.True && ( ! this.True.isInstance(predicate) ) ) &&
               ( this.False && ( ! this.False.isInstance(predicate) ) ) ) ||
          ( foam.Number.isInstance(limit) && Number.isFinite(limit) && limit != 0 ) ||
          ( foam.Number.isInstance(skip) && Number.isFinite(skip) && skip != 0 ) ) {
        return this.delegate.select(sink, skip, limit, order, predicate);
      } else {
        sink && sink.eof();
        return Promise.resolve(sink || this.ArraySink.create());
      }
    }
    // TODO: removeAll?
  ]
});
