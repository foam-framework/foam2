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

/**
  A DAO which does nothing on 'select all' but otherwise acts as a ProxyDAO.
  A 'select all' contains no query, limit, or skip.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'NoSelectAllDAO',
  extends: 'foam.dao.ProxyDAO',


  methods: [
    function select(sink, skip, limit, order, predicate) {
      if (predicate ||
          ( foam.Number.isInstance(limit) && Number.isFinite(limit) ) ||
          ( foam.Number.isInstance(skip) && Number.isFinite(skip) ) ) {
        return this.delegate.select(sink, skip, limit, order, predicate);
      } else {
        sink.eof();
        return Promise.resolve(sink);
      }
    }
    // TODO: removeAll?
  ]
});
