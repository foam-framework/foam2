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
  package: 'foam.u2.view',
  name: 'TextField',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.tag.Input'
  ],

  properties: [
    'data',
    {
      class: 'Boolean',
      name: 'onKey',
      attribute: true
      // documentation: 'When true, $$DOC{ref:".data"} is updated on every keystroke, rather than on blur.'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.tag.Input' }
    },
    'label',
    'alwaysFloatLabel',
    'type',
    'autocompleter',
    'autocompleteList_'
  ],

  methods: [
    function initE() {
      var e = this.start(this.view, {
        data$:            this.data$,
        label$:           this.label$,
        alwaysFloatLabel: this.alwaysFloatLabel,
        type:             this.type,
        onKey:            this.onKey
      });
      e.end();

      if ( this.autocompleter ) {
        this.onload.sub(function() {
          var list = foam.u2.Element.create({ nodeName: 'datalist' });
          this.autocompleteList_ = list;
          this.autocompleter.dao.on.sub(this.updateAutocompleteList);
          this.updateAutocompleteList();
          this.document.body.insertAdjacentHTML('beforeend', list.outerHTML);
          list.load();

          // Actually set the list attribute on our input field.
          e.attrs({ list: list.id });
        }.bind(this));

        this.onunload.sub(function() {
          this.autocompleteList_.remove();
        }.bind(this));
      }
    }
  ],

  listeners: [
    {
      name: 'updateAutocompleteList',
      isFramed: true,
      code: function() {
        var list = this.autocompleteList_;
        this.autocompleteList_.removeAllChildren();
        this.autocompleter.dao.select(foam.dao.ArraySink.create())
            .then(function(sink) {
              sink.array.forEach(function(x) {
                list.start('option').attrs({ value: x.label }).end();
              });
            });
      }
    }
  ]
});
