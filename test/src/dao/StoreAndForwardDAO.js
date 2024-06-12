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

describe('StoreAndForwardDAO', function() {
  var FlakyDAO;
  var StoreAndForwardDAO;
  var InternalException;

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.dao.test',
      name: 'StoreAndForwardDAO',
      extends: 'foam.dao.StoreAndForwardDAO',

      listeners: [
        {
          name: 'onQ',
          isMerged: 'true',
          // Don't wait too long before retrying.
          mergeDelay: 10,
          code: function() { this.forward_(); },
        },
      ],
    });

    foam.CLASS({
      package: 'foam.dao.test',
      name: 'FlakyDAO',
      extends: 'foam.dao.ProxyDAO',

      requires: [
        'foam.dao.ArrayDAO',
        'foam.dao.InternalException',
      ],

      properties: [
        {
          name: 'delegate',
          factory: function() {
            return this.ArrayDAO.create({of: this.of});
          },
        },
      ],

      methods: [
        function put() { return this.maybe_('put', arguments); },
        function remove() { return this.maybe_('remove', arguments); },
        function find() { return this.maybe_('find', arguments); },
        function select() { return this.maybe_('select', arguments); },
        function removeAll() { return this.maybe_('removeAll', arguments); },

        function maybe_(op, args) {
          return this.shouldSucceed_() ?
              this.delegate[op].apply(this.delegate, args) :
              Promise.reject(this.InternalException.create());
        },
        function shouldSucceed_() { return Math.random() > 0.5; },
      ],
    });

    FlakyDAO = foam.lookup('foam.dao.test.FlakyDAO');
    StoreAndForwardDAO = foam.lookup('foam.dao.test.StoreAndForwardDAO');
    InternalException = foam.lookup('foam.dao.InternalException');
  });

  // From node_modules/foam3/test/helpers/generic_dao.js.
  global.genericDAOTestBattery(function(of) {
    return Promise.resolve(StoreAndForwardDAO.create({
      of: of,
      delegate: FlakyDAO.create({
        of: of,
      }),
    }));
  });
});
