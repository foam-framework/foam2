/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  name: 'DAOCreateController',

  topics: [
    'finished',
    'throwError'
  ],

  properties: [
    {
      name: 'dao'
    },
    {
      class: 'Boolean',
      name: 'inProgress'
    },
    {
      name: 'exception'
    },
    {
      name: 'view',
      value: 'foam.u2.DetailView'
    },
    {
      name: 'factory',
      factory: function() { return this.dao ? this.dao.of : () => null; }
    },
    {
      name: 'data',
      factory: function() { return this.factory.create({}, this); }
    }
  ],

  actions: [
    {
      name: 'save',
      buttonStyle: 'PRIMARY',
      isEnabled: function(dao, data$errors_, inProgress) { return !! dao && ! inProgress && ! data$errors_; },
      code: function() {
        this.inProgress = true;
        this.clearProperty('exception');
        var self = this;
        this.dao.put(this.data.clone()).then(function() {
          self.inProgress = false;
          self.finished.pub();
        }, function(e) {
          self.inProgress = false;
          self.exception = e;
          self.throwError.pub();
        });
      }
    }
  ]
});
