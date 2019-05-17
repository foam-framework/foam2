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
    'placeholder',
    'autocompleter',
    'autocompleteList_',
    'elm_'
  ],

  methods: [
    function initE() {
      this.start(this.view, {
        data$:            this.data$,
        label$:           this.label$,
        alwaysFloatLabel: this.alwaysFloatLabel,
        type:             this.type,
        onKey:            this.onKey
      }, this.elm_$)
        .attrs({
          placeholder: this.placeholder$,
        })
      .end();

      if ( this.autocompleter ) {
        this.onDetach(this.onload.sub(this.loaded));
        this.onDetach(this.onunload.sub(this.removeList));
      }
    },

    function createList(objects) {
      this.autocompleteList_ = foam.u2.Element.create({ nodeName: 'datalist' });
      this.document.body.insertAdjacentHTML('beforeend', this.autocompleteList_.outerHTML);
      this.autocompleteList_.load();
      objects.forEach((obj) => {
        this.autocompleteList_.start('option').attrs({ value: obj.label }).end();
      });

      // Actually set the list attribute on our input field.
      this.elm_ && this.elm_.attrs({ list: this.autocompleteList_.id });
    }
  ],

  listeners: [
    function loaded() {
      this.autocompleter.dao.on.sub(this.updateAutocompleteList);
      this.updateAutocompleteList();
    },

    function removeList() {
      if ( this.autocompleteList_ ) this.autocompleteList_.remove();
    },

    {
      name: 'updateAutocompleteList',
      isFramed: true,
      code: function() {
        this.autocompleter.dao.select()
          .then((sink) => {
            this.removeList();
            this.createList(sink.array);
          });
      }
    }
  ]
});
