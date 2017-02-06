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
    'foam.dao.OrDAO',
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
      name: 'classpath',
    },

    {
      name: foam.String.daoize(foam.core.Model.name),
      expression: function(classpath) {
        var prefix = this.window.location.protocol + '//' + this.window.location.host;
        var paths = classpath.split(',');
        var modelDao = this.WebModelFileDAO.create({
          url: prefix + paths[0],
        });
        for (var i = 1, classpath; classpath = paths[i]; i++) {
          modelDao = this.OrDAO.create({
            delegate: modelDao,
            primary: this.WebModelFileDAO.create({
              url: prefix + classpath,
            }),
          });
        }
        return modelDao;
      },
    },
  ],
  methods: [
    function fromQuery(query) {
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
        this.copyFrom({
          classpath: params.classpath || '/src/',
          model: params.model,
          view: params.view
        });
      } else {
        alert('Please specify model');
      }
    },
    function execute() {
      var self = this;
      var X = this.__subContext__;
      var promises = [X.arequire(this.model)];
      if (this.view) promises.push(X.arequire(this.view));
      Promise.all(promises).then(function() {
        var model = X.lookup(self.model).create(null, self);
        var view = self.view ?
            X.lookup(self.view).create({data: model}, self) :
            model.toE(null, self);
        view.write();
      })
    }
  ],
});

var executor = foam.lookup('WebModelExecutor').create()
executor.fromQuery(this.window.location.search.substring(1));
executor.execute();
