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
  name: 'StackView',
  extends: 'foam.u2.BasicStackView',
  methods: [
    function initE() {
      this.cssClass('flex').cssClass('layout').cssClass('vertical');
      this.SUPER();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.md',
  name: 'Toolbar',
  extends: 'foam.u2.Element',
  properties: [
    {
      name: 'title'
    },
    {
      name: 'leftActions_',
      factory: function() {
        return [];
      }
    },
    {
      name: 'rightActions_',
      factory: function() {
        return [];
      }
    },
    [ 'nodeName', 'paper-toolbar' ]
  ],

  methods: [
    function initE() {
      this.add(this.leftActions_$);
      this.start('span').cssClass('title').add(this.title$).end();
      this.add(this.rightActions_$);
    },

    function addLeftAction(button) {
      this.leftActions_ = this.leftActions_.concat([ button ]);
    },
    function addRightAction(button) {
      this.rightActions_ = this.rightActions_.concat([ button ]);
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.md',
  name: 'ToolbarContainer',
  extends: 'foam.u2.Element',

  properties: [
    {
      name: 'toolbar',
      required: true
    },
    {
      name: 'body',
      factory: function() {
        return this.E('div');
      }
    },
    [ 'nodeName', 'paper-header-panel' ]
  ],

  methods: [
    function initE() {
      this.attrs({ fullbleed: true });
      this.add(this.toolbar.cssClass('paper-header'));
      this.add(this.body.cssClass('content'));
    }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'PolymerWrapper',
  extends: 'foam.u2.View'
});

foam.CLASS({
  package: 'foam.u2.md',
  name: 'StringRefinement',
  refines: 'foam.core.String',
  imports: [
    'setTimeout'
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'onKey',
      value: 'false'
    },
    {
      name: 'toPropertyE',
      value: function(X) {
        return X.lookup('foam.u2.md.tag.PaperInput').create({
          onKey: this.onKey,
          label$: this.label$
        }, X);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.md',
  name: 'Button',
  extends: 'foam.u2.View',

  properties: [
    'action',
    {
      name: 'nodeName',
      expression: function(type) {
        return type === 'fab' ? 'paper-fab' :
            type === 'icon' ? 'paper-icon-button' : 'paper-button';
      }
    },
    {
      name: 'type',
      documentation: 'The flavour of button: either label, icon, label-icon, ' +
          'or fab.',
      value: 'label'
    },
    {
      class: 'String',
      name: 'icon',
      documentation: 'The string name of the icon to use.',
      expression: function(action) {
        console.log('action ' + action.name + ' with icon ' + action.icon);
        return action.icon;
      }
    }
  ],

  methods: [
    function initE() {
      // We need to configure the button differently depending on its type.
      if ( this.type === 'fab' || this.type === 'icon' ) {
        this.attrs({ icon: this.icon$ });
      } else {
        if ( this.type === 'label-icon' ) {
          this.start('iron-icon').attrs({ icon: this.icon$ }).end();
          this.add(this.action$.dot('label'));
        }
      }

      this.attrs({
        disabled: this.action.createIsEnabled$(this.data$)
            .map(function(e) { return ! e ; })
      });
      this.enableCls('foam-u2-Element-hidden',
          this.action.createIsAvailable$(this.data$), true);

      var self = this;
      this.on('click', function() {
        self.action.maybeCall(self.__context__, self.data);
      });
    }
  ]
});
