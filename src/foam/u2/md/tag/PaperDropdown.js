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
  package: 'foam.u2.md.tag',
  name: 'PaperDropdown',
  extends: 'foam.u2.tag.Select',

  css: `
    ^unrolled paper-item {
      font-size: 12px;
      min-height: 36px;
    }
    ^label {
      color: #737373;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,

  properties: [
    {
      name: 'nodeName',
      expression: function(unrolled) {
        return unrolled ? 'div' : 'paper-dropdown-menu';
      }
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'Boolean',
      name: 'unrolled',
      documentation: 'Set this to true to get an unrolled list. Defaults to ' +
          'size > 1.',
      expression: function(size) {
        return size > 1;
      }
    },
    {
      class: 'Int',
      name: 'size',
      value: 1
    },
    {
      class: 'Boolean',
      name: 'alwaysFloatLabel'
    }
  ],

  methods: [
    function initE() {
      this.attrs({
        label: this.label$,
        'always-float-label': this.alwaysFloatLabel,
        'no-label-float': this.slot(function(label) { return ! label; },
            this.label$)
      });

      if ( this.unrolled ) {
        this.addClass(this.myClass('unrolled'));
        this.start('div').addClass(this.myClass('label')).add(this.label$).end();
      }

      var listbox;
      this.add(this.slot(function(choices, unrolled) {
        listbox = this.E('paper-listbox').addClass('dropdown-content');
        for ( var i = 0; i < choices.length; i++ ) {
          listbox.start('paper-item')
              .attrs({ name: i })
              .add(choices[i][1])
          .end();
        }

        // If the size is given, we need to add empty rows until the size is
        // filled. That prevents janky jumping around in the UI.
        var extras = Math.max(0, this.size - choices.length);
        for ( var i = 0; i < extras; i++ ) {
          listbox.start('paper-item').end();
        }

        // Polymer doesn't notice when the selected entry's label has changed.
        // This forces it to update.
        listbox.attrs({ selected: this.data });
        return listbox;
      }.bind(this), this.choices$));

      // attrSlot doesn't work correctly here, so wire it up manually.
      this.data$.sub(function() {
        listbox.attrs({ selected: this.data });
      }.bind(this));

      this.on('iron-select', function(e) {
        this.data = e.target.selected;
      }.bind(this));
    }
  ]
});
