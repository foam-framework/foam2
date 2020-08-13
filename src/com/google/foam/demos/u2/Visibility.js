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
    },
    {
      class: 'String',
      name: 'gridColumnsDemoOne',
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'gridColumnsDemoTwo',
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'readPermissionRequiredDemoProperty',
      readPermissionRequired: true,
      value: 'testing...'
    },
    {
      class: 'String',
      name: 'writePermissionRequiredDemoProperty',
      writePermissionRequired: true,
      value: 'testing...',
      createVisibility: function(flag) {
        return foam.u2.DisplayMode[flag ? 'RW' : 'HIDDEN'];
      }
    },
    {
      class: 'String',
      name: 'readAndWritePermissionRequiredDemoProperty',
      readPermissionRequired: true,
      writePermissionRequired: true,
      value: 'testing...'
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

  exports: [
    'displayWidth',
    'mockAuthService as auth'
  ],

  css: `
    body {
      font-family: /*%FONT1%*/, Helvetica, sans-serif;
      line-height: 1.5;
    }

    kbd {
      background: #eee;
      border-radius: 3px;
      padding: 0 4px;
    }
  `,

  messages: [
    {
      name: 'CODE_EXAMPLE_1',
      message: `
        {
          class: 'String',
          name: 'foo',
          visibility: 'RW'
        },
        {
          class: 'String',
          name: 'bar',
          visibility: foam.u2.DisplayMode.RW
        }
      `,
    },
    {
      name: 'CODE_EXAMPLE_2',
      message: `
        {
          class: 'Boolean',
          name: 'bar'
        },
        {
          class: 'String',
          name: 'foo',
          visibility: function(bar) {
            const DisplayMode = foam.u2.DisplayMode;
            return bar ? DisplayMode.RW : DisplayMode.HIDDEN;
          }
        }
      `,
    },
    {
      name: 'CODE_EXAMPLE_3',
      message: `
        {
          class: 'String',
          name: 'foo',
          visibility: foam.core.ConstantSlot.create({ value: foam.u2.DisplayMode.RW })
        }
      `,
    }
  ],

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
    },
    {
      class: 'Boolean',
      name: 'userHasReadPermission',
      label: 'User Has Read Permission?',
      value: true
    },
    {
      class: 'Boolean',
      name: 'userHasReadWritePermission',
      label: 'User Has Read/Write Permission?',
      value: true
    },
    {
      name: 'mockAuthService',
      factory: function() {
        return {
          check: async (_, permission) => {
            if ( permission.includes('.ro.') ) {
              return this.userHasReadPermission;
            }
            return this.userHasReadWritePermission;
          }
        }
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .start('h1').add('Property Visibility Demo').end()
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
            .start('kbd').add('readPermissionRequired').end()
            .add(': True if a permission is required to read this property.')
            .add(' Defaults to ')
            .start('kbd').add('false').end()
            .add('.')
          .end()
          .start('li')
            .start('kbd').add('writePermissionRequired').end()
            .add(': True if a permission is required to write this property.')
            .add(' Defaults to ')
            .start('kbd').add('false').end()
            .add('.')
          .end()
          .start('li')
            .start('kbd').add('gridColumns').end()
            .add(`: Set to a number from 1 to 12, inclusive. Determines the width of the property's view based on a grid system. Properties take up the full width of the grid by default.`)
          .end()
          .start('li')
            .start('kbd').add('createVisibility').end()
            .add(': Controls the visibility of the view when ')
            .start('kbd').add('controllerMode').end()
            .add(' is ')
            .start('kbd').add('CREATE').end()
            .add('. Defaults to ')
            .start('kbd').add('RW').end()
            .add('.')
          .end()
          .start('li')
            .start('kbd').add('readVisibility').end()
            .add(': Controls the visibility of the view when ')
            .start('kbd').add('controllerMode').end()
            .add(' is ')
            .start('kbd').add('VIEW').end()
            .add('. Defaults to ')
            .start('kbd').add('RO').end()
            .add('.')
          .end()
          .start('li')
            .start('kbd').add('updateVisibility').end()
            .add(': Controls the visibility of the view when ')
            .start('kbd').add('controllerMode').end()
            .add(' is ')
            .start('kbd').add('EDIT').end()
            .add('. Defaults to ')
            .start('kbd').add('RW').end()
            .add('.')
          .end()
          .start('li')
            .start('kbd').add('visibility').end()
            .add(': Overrides all three of the properties listed above. Defaults to ')
            .start('kbd').add('null').end()
            .add('.')
          .end()
        .end()
        .start('p')
          .add(`If either of the permission-related properties are set to true, the set of allowed visibilities is constrained if the user doesn't have the corresponding permission. For example, if the property has `)
          .start('kbd').add('writePermissionRequired: true').end()
          .add(', then the visibility is never allowed to be ')
          .start('kbd').add('RW').end()
          .add(` since the user shouldn't be allowed to think they can edit the property.`)
        .end()
        .start('p')
          .add('The last four properties in the list above can be set to any of the following values:')
          .start('ol')
            .start('li')
              .add('A ')
              .start('kbd').add('foam.u2.DisplayMode').end()
              .add('. Examples:')
              .start('pre').add(this.CODE_EXAMPLE_1).end()
            .end()
            .start('li')
              .add('An expression function that returns a ')
              .start('kbd').add('foam.u2.DisplayMode').end()
              .add('. Example:')
              .start('pre').add(this.CODE_EXAMPLE_2).end()
            .end()
            .start('li')
              .add('A slot of ')
              .start('kbd').add('foam.u2.DisplayMode').end()
              .add('. Example:')
              .start('pre').add(this.CODE_EXAMPLE_3).end()
              .add(`It's not likely that you'll need to use this option under normal conditions. It might be useful if you're modifying the `)
              .start('kbd').add('visibility').end()
              .add(' of properties programmatically, such as in some lower-level framework code though, for example.')
            .end()
          .end()
        .end()
        .start('p')
          .add('Below we show three detail views, one for each of the possible values of ')
          .start('kbd').add('controllerMode').end()
          .add('.')
        .end()

        .add(this.slot(function(userHasReadPermission, userHasReadWritePermission) {
          return this.E()
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
            .end()
        }))

        .start('h2')
          .add('Control Permissions')
        .end()
        .startContext({ data: this })
          .start().add(this.USER_HAS_READ_PERMISSION).end()
          .start().add(this.USER_HAS_READ_WRITE_PERMISSION).end()
        .end();
    }
  ]
});
