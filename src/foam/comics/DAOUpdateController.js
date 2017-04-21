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
  imports: [
    'stack'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      hidden: true
    },
    {
      name: 'obj',
      label: '',
      view: function(args, X) {
        var e = foam.u2.DetailView.create({ showActions: true, of: X.data.of }, X).copyFrom(args);
        e.data$ = X.data$.dot(this.name);
        return e;
      }
    },
    {
      name: 'dao',
      hidden: true,
      expression: function(of) {
        return of && this.__context__[foam.String.daoize(of.name)] || foam.dao.NullDAO.create();
      }
    },
    {
      class: 'String',
      name: 'status'
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(obj) { return obj != null; },
      code: function() {
        var self = this;
        this.status = 'Saving...';
        var self = this;
        this.dao.put(this.obj.clone()).then(function() {
          self.status = 'Saved';
          self.stack.back();
        }, function(e) {
          self.status = "Error saving record: " + e.toString();
        });
      }
    },
    {
      name: 'delete',
      isEnabled: function(obj) { return obj != null; },
      code: function() {
        var self = this;
        this.dao.remove(this.obj).then(function() {
          self.stack.back();
        });
      }
    }
  ]
});
