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
  package: 'foam.u2.md',
  name: 'DAOController',
  extends: 'foam.u2.DAOController',


  methods: [
    function initE() {
      // TODO(braden): Once toPropertyE is generalized to actions etc., use that
      // here if practical.
      var list = this.listFactory$f({
        rowFactory: this.rowFactory,
        data: this.data
      });
    },
  ]
});

foam.CLASS({
  package: 'com.chrome.apis',
  name: 'Controller',
  extends: 'foam.u2.Element',
  requires: [
    //'com.chrome.apis.Experiment',
    'com.chrome.apis.Origin',
    //'com.chrome.apis.User',
    'foam.dao.CachingDAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    'foam.dao.MDAO',
    'foam.u2.Stack',
    'foam.u2.md.DAOController',
    'foam.u2.md.StackView',
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarContainer'
  ],

  exports: [
    'originDAO',
    'stack'
  ],

  properties: [
    {
      name: 'originDAO',
      factory: function() {
        return this.GUIDDAO.create({
          of: this.Origin,
          delegate: this.CachingDAO.create({
            of: this.Origin,
            src: this.IDBDAO.create({ of: this.Origin }),
            cache: this.MDAO.create({ of: this.Origin })
          })
        });
      }
    },
    {
      name: 'stack',
      factory: function() {
        return this.Stack.create();
      }
    }
  ],

  methods: [
    function initE() {
      this.cssClass('flex').cssClass('layout').cssClass('vertical');
      var sv = this.StackView.create();
      this.add(sv);
      var inner = this.ToolbarContainer.create({
        toolbar: this.Toolbar.create({
          title: 'Chrome Experiments'
        }),
        body: this.DAOController.create({ data: this.originDAO })
      });

      //inner.cssClass('layout').cssClass('vertical');

      this.stack.pushOnly(inner);
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        body {
          height: 100vh;
          margin: 0;
          padding: 0;
        }
      */}
    })
  ]
});
