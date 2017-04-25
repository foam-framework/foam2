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
  package: 'foam.classloader',
  name: 'WebModelDisplayer',

  documentation: `
     Load and display a model using class-loader support.

     Sample Usage:
     http://localhost:8000/index.html?model=com.google.foam.demos.lifestar.Disk
  `,

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.classloader.OrDAO',
    'foam.classloader.WebModelFileDAO'
  ],

  imports: [
    'arequire',
    'window'
  ],

  exports: [
    'stack',
    foam.String.daoize(foam.core.Model.name)
  ],

  properties: [
    {
      name: 'model',
    },
    {
      name: 'view',
    },
    {
      name: 'stack',
      factory: function() { return this.Stack.create() },
    },
    {
      name: 'locale',
      postSet: function(_, n) { foam.locale = n; }
    },
    {
      class: 'String',
      name: 'classpath'
    },
    {
      name: foam.String.daoize(foam.core.Model.name),
      expression: function(classpath) {
        var prefix   = this.window.location.protocol + '//' + this.window.location.host;
        var paths    = classpath.split(',');
        var modelDao = this.WebModelFileDAO.create({
          url: prefix + paths[0],
        });

        for ( var i = 1, classpath ; classpath = paths[i] ; i++ ) {
          modelDao = this.OrDAO.create({
            delegate: modelDao,
            primary: this.WebModelFileDAO.create({
              url: prefix + classpath
            })
          });
        }
        return modelDao;
      }
    }
  ],

  methods: [
    function fromQuery(opt_query) {
      var search = /([^&=]+)=?([^&]*)/g;
      var query  = opt_query || window.location.search.substring(1);
      var decode = function(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
      };
      var params = {};
      var match;

      while ( match = search.exec(query) ) {
        // TODO: move this to Window
        params[decode(match[1])] = decode(match[2]);
      }

      if ( params.model ) {
        this.copyFrom({
          classpath: params.classpath || '/src/',
          model:     params.model,
          view:      params.view
        });
      } else {
        alert('Please specify model. Ex.: ?model=com.acme.MyModel');
      }

      return this;
    },

    function execute() {
      var self     = this;
      var X        = this.__subContext__;
      var promises = [X.arequire(this.model)];

      if (this.view) promises.push(X.arequire(this.view));

      Promise.all(promises).then(function() {
        var model = X.lookup(self.model).create(null, self);
        window.__foam_obj__ = model;

        var viewSpec = self.view ? { class: self.view, data: model } : model.toE.bind(model);

        self.stack.push(viewSpec);
        self.StackView.create({data: self.stack}).write();
      })
    }
  ]
});
