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
  package: 'foam.core',
  name: 'ClassLoader',

  exports: [
    'arequire',
  ],

  methods: [
    {
      name: 'arequire',
      class: 'foam.core.ContextMethod',
      code: function(X, modelId) {
        var modelDao = X[foam.String.daoize(foam.core.Model.name)];
        return new Promise(function(resolve, reject) {
          var inited = {};
          var numLoaded = 0;
          var loadModelAndDeps = function(modelId) {
            inited[modelId] = true;
            modelDao.find(modelId).then(function(model) {
              numLoaded++;
              var requires = model.model_.requires || [];
              requires.map(function(require) {
                return require.path;
              }).filter(function(require) {
                return !inited[require];
              }).forEach(function(require) {
                loadModelAndDeps(require);
              });
              if (Object.keys(inited).length == numLoaded) {
                resolve();
              }
            });
          };
          loadModelAndDeps(modelId);
        }).then(function() {
          return foam.lookup(modelId);
        });
      },
    },
  ]
});

foam.__context__ = foam.core.ClassLoader.create(
  {},
  foam.__context__
).__subContext__;
