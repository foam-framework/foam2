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


/** An Index which loads large amounts of data in batches, to avoid janking
  when creating new indexes from large data sets.
  FUTURE: option to use the promise in execute, so sorting operations can
  wait on this index completing load.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'PoliteIndex',
  extends: 'foam.dao.index.ProxyIndex',

  constants: {
    BATCH_SIZE: Number.MAX_VALUE,
    SMALL_ENOUGH_SIZE: Number.MAX_VALUE,
    BATCH_TIME: 0,
  },

  properties: [
    {
      name: 'delegateFactory',
      required: true
    },
  ],

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      return this.delegateFactory.estimate(size, sink, skip, limit, order, predicate);
    },
    function initInstance() {
      this.delegate = this.delegateFactory.spawn();
    }
  ]
});
