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
  name: 'SkipDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      class: 'Int',
      name: 'skip_',
    }
  ],

  methods: [
    {
      name: 'select_',
      code: function select_(x, sink, skip, limit, order, predicate) {
        return this.delegate.select_(x, sink, this.skip_, limit, order, predicate);
      },
      swiftCode: function() {/*
return try delegate.select_(x, sink, skip_, limit, order, predicate)
      */},
    },
    function removeAll_(x, skip, limit, order, predicate) {
      return this.delegate.removeAll_(x, this.skip_, limit, order, predicate);
    }
  ]
});
