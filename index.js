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
  name: 'WebModelExecutor',
  requires: [
    'foam.dao.WebModelFileDAO',
  ],
  imports: [
    'arequire',
    'window',
  ],
  exports: [
    foam.String.daoize(foam.core.Model.name),
  ],
  properties: [
    {
      name: 'model',
    },
    {
      name: 'view',
    },
    {
      name: 'locale',
      postSet: function(_, n) {
        foam.locale = n;
      },
    },

    {
      name: foam.String.daoize(foam.core.Model.name),
      factory: function() {
        var modelDao = this.WebModelFileDAO.create();
        return modelDao;
      },
    },
  ],
  methods: [
    function execute() {
      var self = this;
      var X = this.__subContext__;
      var modelId = this.model;
      var viewId = this.view;
      Promise.all([
        X.arequire(viewId),
        X.arequire(modelId),
      ]).then(function() {
        var model = X.lookup(modelId).create({}, self);
        var view = X.lookup(viewId).create({showActions: true}, self);
        view.data = model;
        view.write();
      })
    }
  ],
});

var search = /([^&=]+)=?([^&]*)/g;
var query = window.location.search.substring(1);
var decode = function(s) {
  return decodeURIComponent(s.replace(/\+/g, ' '));
};
var params = {};
var match;
while (match = search.exec(query)) {
  params[decode(match[1])] = decode(match[2]);
}

if (params.model) {
  var executor = foam.lookup('WebModelExecutor').create({
    model: params.model,
    view: params.view || 'foam.u2.DetailView',
  });
  executor.execute();
} else {
  alert('Please specify model');
}
