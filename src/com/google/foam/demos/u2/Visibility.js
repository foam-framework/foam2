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
  package: 'com.google.foam.demos.u2',
  name: 'VisibilityTest',

  properties: [
    {
      class: 'String',
      name: 'readWrite',
      value: 'testing...',
      visibility: 'RW'
    },
    {
      class: 'String',
      name: 'final',
      value: 'testing...',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'disabled',
      value: 'testing...',
      visibility: 'DISABLED'
    },
    {
      class: 'String',
      name: 'readOnly',
      value: 'testing...',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'hidden',
      value: 'testing...',
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'flag',
      value: true
    },
    {
      class: 'String',
      name: 'disabledExpression',
      visibility: function(flag) {
        return foam.u2.DisplayMode[flag ? 'RW' : 'DISABLED'];
      }
    },
    {
      class: 'Boolean',
      name: 'disabledBooleanExpression',
      visibility: function(flag) {
        return foam.u2.DisplayMode[flag ? 'RW' : 'DISABLED'];
      }
    },
    {
      class: 'Date',
      name: 'disabledDateExpression',
      visibility: function(flag) {
        return foam.u2.DisplayMode[flag ? 'RW' : 'DISABLED'];
      }
    },
    {
      class: 'String',
      name: 'readOnlyExpression',
      visibility: function(flag) {
        return foam.u2.DisplayMode[flag ? 'RW' : 'RO'];
      }
    },
    {
      class: 'Boolean',
      name: 'readOnlyBooleanExpression',
      visibility: function(flag) {
        return foam.u2.DisplayMode[flag ? 'RW' : 'RO'];
      }
    },
    {
      class: 'Date',
      name: 'readOnlyDateExpression',
      visibility: function(flag) {
        return foam.u2.DisplayMode[flag ? 'RW' : 'RO'];
      }
    },
    {
      class: 'String',
      name: 'hiddenExpression',
      visibility: function(flag) {
        return foam.u2.DisplayMode[flag ? 'RW' : 'HIDDEN'];
      }
    }
  ]
});

foam.CLASS({
  package: 'com.google.foam.demos.u2',
  name: 'VisibilityDemo',
  extends: 'foam.u2.Element',

  requires: [
    'com.google.foam.demos.u2.VisibilityTest',
    'foam.u2.ControllerMode',
    'foam.u2.detail.SectionedDetailView',
    'foam.u2.layout.DisplayWidth',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit'
  ],

  exports: ['displayWidth'],

  css: `
    body {
      font-family: 'IBM Plex Sans', Helvetica, sans-serif;
      line-height: 1.5;
    }

    kbd {
      font-family: 'IBM Plex Mono', monospace;
      background: #eee;
      border-radius: 3px;
      padding: 0 4px;
    }
  `,

  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.layout.DisplayWidth',
      name: 'displayWidth',
      factory: function() {
        return this.DisplayWidth.VALUES
          .sort((a, b) => b.minWidth - a.minWidth)
          .find(o => o.minWidth <= window.innerWidth);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .start('h1').add('Visibility Demo').end()
        .start('p')
          .add('Every property has a view, which can be specified by setting the ')
          .start('kbd').add('view').end()
          .add(' property property. If not set explicitly, a suitable default view will be used based on the type of the property.')
        .end()
        .start('p')
          .add('There are several property properties that can be used to control the visibility of the view of a property:')
        .end()
        .start('ul')
          .start('li')
            .start('kbd').add('createVisibility').end()
            .add(': Controls the visibility of the view when ')
            .start('kbd').add('controllerMode').end()
            .add(' is ')
            .start('kbd').add('CREATE').end()
            .add('.')
          .end()
          .start('li')
            .start('kbd').add('readVisibility').end()
            .add(': Controls the visibility of the view when ')
            .start('kbd').add('controllerMode').end()
            .add(' is ')
            .start('kbd').add('VIEW').end()
            .add('.')
          .end()
          .start('li')
            .start('kbd').add('updateVisibility').end()
            .add(': Controls the visibility of the view when ')
            .start('kbd').add('controllerMode').end()
            .add(' is ')
            .start('kbd').add('EDIT').end()
            .add('.')
          .end()
          .start('li')
            .start('kbd').add('visibility').end()
            .add(': Overrides all three of the properties listed above.')
          .end()
        .end()
        .start('p')
          .add('Each of the properties above can be set to any of the following values:')
          .start('ol')
            .start('li')
              .add('A ')
              .start('kbd').add('foam.u2.DisplayMode').end()
            .end()
            .start('li')
              .add('A slot of ')
              .start('kbd').add('foam.u2.DisplayMode').end()
            .end()
            .start('li')
              .add('An expression function that returns a ')
              .start('kbd').add('foam.u2.DisplayMode').end()
            .end()
          .end()
        .end()
        .start('p')
          .add('Below we show three detail views, one for each of the possible values of ')
          .start('kbd').add('controllerMode').end()
          .add('.')
        .end()

        .start(this.Grid)
          .start(this.GUnit, { columns: 4 })
            .startContext({ controllerMode: this.ControllerMode.CREATE })
              .start('h2').add('Create').end()
              .tag(this.SectionedDetailView, { data: this.VisibilityTest.create() })
            .endContext()
          .end()
          .start(this.GUnit, { columns: 4 })
            .startContext({ controllerMode: this.ControllerMode.VIEW })
              .start('h2').add('View').end()
              .tag(this.SectionedDetailView, { data: this.VisibilityTest.create() })
            .endContext()
          .end()
          .start(this.GUnit, { columns: 4 })
            .startContext({ controllerMode: this.ControllerMode.EDIT })
              .start('h2').add('Edit').end()
              .tag(this.SectionedDetailView, { data: this.VisibilityTest.create() })
            .endContext()
          .end()
        .end();
    }
  ],
});
