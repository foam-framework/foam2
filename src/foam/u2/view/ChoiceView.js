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
  name: 'ChoiceView',
  extends: 'foam.u2.View',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [ 'warn' ],

  documentation: `
    Wraps a tag that represents a singular choice. That is,
    this controller shows the user a fixed, probably small set of
    choices, and the user picks one.
    The choices are [value, label] pairs. this.choice is the current
    pair, this.data the current value. this.text is the current label,
    this.label is the label for the whole view (eg. "Medal Color", not
    "Gold").
    The choices can be provided either as an array (this.choices) or as
    a DAO plus the function this.objToChoice which turns objects from the
    DAO into [value, label] pairs.
    this.selectSpec is a ViewSpec for the inner view. It defaults to
    foam.u2.tag.Select.
  `,

  properties: [
    {
      class: 'String',
      name: 'name',
      factory: function() { return "select"; }
    },
    {
      class: 'String',
      name: 'label',
      documentation: 'User-visible label. Not to be confused with "text", ' +
          'which is the user-visible name of the currently selected choice.'
    },
    {
      name: 'choice',
      // 'choice' is the canonical source of truth. Updating 'choice' is
      // responsible for updating 'index', 'data', and 'text'. Updating any
      // of those properties calls back to updating 'choice'.
      documentation: 'The current choice. (That is, a [value, text] pair.)',
      postSet: function(o, n) {
        if ( o === n || this.feedback_ ) return;

        this.feedback_ = true;

        try {
          if ( ! n && this.placeholder ) {
            this.data  = this.defaultValue;
            this.text  = this.placeholder;
            this.index = -1;
          } else {
            this.data  = n && n[0];
            this.text  = n && n[1];
            this.index = this.findIndexOfChoice(n);
          }
        } finally {
          this.feedback_ = false;
        }
      }
    },
    {
      name: 'choices',
      documentation: 'Array of [value, text] choices. You can pass in just ' +
          'an array of strings, which are expanded to [str, str]. Can also ' +
          'be a map, which results in [key, value] pairs listed in ' +
          'enumeration order.',
      factory: function() { return []; },
      adapt: function(old, nu) {
        if ( typeof nu === 'object' && ! Array.isArray(nu) ) {
          var out = [];
          for ( var key in nu ) {
            if ( nu.hasOwnProperty(key) ) out.push([ key, nu[key] ]);
          }
          if ( this.dynamicSize ) {
            this.size = Math.min(out.length, this.maxSize);
          }
          return out;
        }

        nu = foam.Array.shallowClone(nu);

        // Upgrade single values to [value, value].
        for ( var i = 0; i < nu.length; i++ ) {
          if ( ! Array.isArray(nu[i]) ) {
            nu[i] = [ nu[i], nu[i] ];
          }
        }

        if ( this.dynamicSize ) this.size = Math.min(nu.length, this.maxSize);
        return nu;
      }
    },
    {
      class: 'Int',
      name: 'index',
      documentation: 'The index of the current choice in the choices array.',
      transient: true,
      value: -1,
      preSet: function(old, nu) {
        if ( this.choices.length === 0 && this.dao ) return nu;
        if ( nu < 0 && this.placeholder ) return nu;
        if ( nu < 0 || this.choices.length === 0 ) return 0;
        if ( nu >= this.choices.length ) return this.choices.length - 1;
        return nu;
      },
      postSet: function(o, n) {
        if ( o !== n ) this.choice = n === -1 ? null : this.choices[n];
      }
    },
    {
      class: 'String',
      name: 'placeholder',
      factory: function() { return undefined; },
      documentation: 'When provided the placeholder will be prepended to the selection list, and selected if the choices array is empty or no choice in the choices array is selected.'
    },
    {
      class: 'Function',
      name: 'objToChoice',
      documentation: 'A function which adapts an object from the DAO to a ' +
          '[key, value] choice. Required when a DAO is provided.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      name: 'text',
      postSet: function(o, n) {
        if ( o !== n ) this.choice = this.findChoiceByText(n);
      }
    },
    {
      name: 'data',
      postSet: function(o, n) {
        if ( o !== n ) this.choice = this.findChoiceByData(n) || [n, n];
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'selectSpec',
      value: { class: 'foam.u2.tag.Select' }
    },
    {
      class: 'Boolean',
      name: 'alwaysFloatLabel'
    },
    {
      name: 'view_'
    },
    'feedback_',
    'defaultValue',
    {
      class: 'Int',
      name: 'size',
      documentation: `The number of entries in the HTML 'select' element that
        should be visible.`
    },
    {
      class: 'Boolean',
      name: 'dynamicSize',
      documentation: `The size of the select element (ie: the number of entries
        shown at one time) should match the number of entries in the list. If
        set to true, the 'size' property will be ignored. However, the 'maxSize'
        property will still be respected.`
    },
    {
      class: 'Int',
      name: 'maxSize',
      documentation: `The size of the select element should never be greater
        than this number.`,
      value: Number.MAX_SAFE_INTEGER
    },
    'prop_'
  ],

  methods: [
    function init() {
      this.onDetach(this.choices$.sub(this.onChoicesUpdate));
    },

    function initE() {
      var self = this;

      // If no item is selected, and data has not been provided, select the 0th
      // entry.
      if ( this.data == null && ! this.index ) {
        this.index = 0;
      }

      this.onDAOUpdate();

      this.add(this.slot(function(mode) {
        if ( mode !== foam.u2.DisplayMode.RO ) {
          return self.E()
            .start(self.selectSpec, {
              data$:            self.index$,
              label$:           self.label$,
              alwaysFloatLabel: self.alwaysFloatLabel,
              choices$:         self.choices$,
              placeholder$:     self.placeholder$,
              mode$:            self.mode$,
              size$:            self.size$
            })
              .attrs({ name: self.name })
              .enableClass('selection-made', self.index$.map((index) => index !== -1))
            .end();
        } else {
          return self.E().add(self.text$);
        }
      }));

      this.dao$proxy.on.sub(this.onDAOUpdate);
    },

    function findIndexOfChoice(choice) {
      if ( ! choice ) return -1;
      var choices = this.choices;
      var data    = choice[0];
      for ( var i = 0 ; i < choices.length ; i++ ) {
        if ( foam.util.equals(choices[i][0], data) ) return i;
      }
      var text = choice[1];
      for ( var i = 0 ; i < choices.length ; i++ ) {
        if ( choices[i][1] === text ) return i;
      }
      return -1;
    },

    function findChoiceByData(data) {
      var choices = this.choices;
      for ( var i = 0 ; i < choices.length ; i++ ) {
        if ( foam.util.equals(choices[i][0], data) ) return choices[i];
      }
      return null;
    },

    function findChoiceByText(text) {
      var choices = this.choices;
      for ( var i = 0 ; i < choices.length ; i++ ) {
        if ( choices[i][1] === text ) return choices[i];
      }
      return null;
    },

    function fromProperty(p) {
      this.SUPER(p);
      this.prop_ = p;
      this.defaultValue = p.value;
    }
  ],

  listeners: [
    {
      name: 'onChoicesUpdate',
      isFramed: true,
      code: function() {
        var d = this.data;
        if ( this.choices.length ) {
          var choice = this.findChoiceByData(d);
          this.choice = choice === null ? this.findChoiceByData(this.defaultValue) : choice;
        }
      }
    },
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        if ( ! foam.dao.DAO.isInstance(this.dao) ) return;

        var of = this.dao.of
        if ( of._CHOICE_TEXT_ ) {
          this.dao.select(this.PROJECTION(of.ID, of._CHOICE_TEXT_)).then((s) => {
            this.choices = s.projection;
          });
          return;
        } else {
          this.warn('Inefficient ChoiceView. Consider creating transient _choiceText_ property on ' + of.id + ' DAO, prop: ' + this.prop_);
          /* Ex.:
          {
            class: 'String',
            name: '_choiceText_',
            transient: true,
            javaGetter: 'return getName();',
            getter: function() { return this.name; }
          }
          */
        }
        var p = this.mode === foam.u2.DisplayMode.RW ?
          this.dao.select().then(s => s.array) :
          this.dao.find(this.data).then(o => o ? [o] : []);

        p.then(a => {
          var choices = a.map(this.objToChoice);
          var choiceLabels = a.map(o => { return this.objToChoice(o)[1]});
          Promise.all(choiceLabels).then(resolvedChoiceLabels => {
            for ( let i = 0; i < choices.length; i++ ) {
              choices[i][1] = resolvedChoiceLabels[i];
            }
            this.choices = choices;
          });
          if ( this.data == null && this.index === -1 ) this.index = this.placeholder ? -1 : 0;
        });
      }
    }
  ],

  reactions: [
    ['', 'propertyChange.mode', 'onDAOUpdate']
  ]
});
