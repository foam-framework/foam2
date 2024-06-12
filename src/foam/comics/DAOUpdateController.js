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

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOUpdateController',

  topics: [
    'finished',
    'throwError'
  ],

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'data'
    },
    {
      name: 'exception'
    },
    {
      name: 'obj',
      factory: function() {
        var self = this;
        this.dao.find(this.data).then(function(obj) {
          self.obj = obj.clone();
        });
        return null;
      }
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(obj) { return !! obj; },
      code: function() {
        var self = this;
        this.dao.put(this.obj.clone()).then(function() {
          self.finished.pub();
        }, function(e) {
          self.exception = e;
          self.throwError.pub();
        });
      }
    },
    {
      name: 'delete',
      isEnabled: function(obj) { return !! obj; },
      confirmationRequired: function() {
        return true;
      },
      code: function() {
        var self = this;
        this.dao.remove(this.obj).then(function() {
          self.finished.pub();
        }, function(e) {
          self.exception = e;
          self.throwError.pub();
        });
      }
    }
  ]
});
