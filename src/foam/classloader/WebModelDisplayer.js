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
    'foam.apploader.WebModelFileDAO',
    'foam.apploader.ClassLoader'
  ],

  imports: [
    'classloader',
    'window',
  ],

  exports: [
    'stack',
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
      name: 'showStackViewActions',
      value: true,
    },
    {
      name: 'locale',
      postSet: function(_, n) { foam.locale = n; }
    },
    {
      class: 'String',
      name: 'classpath',
      postSet: function(_, n) {
        if ( ! n ) return;
        var self = this;
        n.split(',').forEach(function(p) {
          self.classloader.addClassPath(p)
        });
      },
    },
  ],

  methods: [
    function fromQuery(opt_query) {
      var search = /([^&=]+)=?([^&]*)/g;
      var query  = opt_query || this.window.location.search.substring(1);
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
          classpath: params.classpath,
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

      Promise.all([
        this.classloader.load(this.model),
        this.view ? this.classloader.load(this.view) : Promise.resolve()
      ]).then(function(args) {
        var cls = args[0];
        var m = cls.create(null, self);
        window.__foam_obj__ = m;

        var viewSpec = self.view ? { class: self.view, data: m } : m.toE.bind(m);

        self.stack.push(viewSpec);
        self.StackView.create({
          showActions: self.showStackViewActions,
          data: self.stack,
        }).write();
      })
    }
  ]
});
