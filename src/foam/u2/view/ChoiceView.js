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

        if ( ! n && this.placeholder ) {
          this.data = undefined;
          this.text = this.placeholder;
          this.index = -1;
        } else {
          this.data  = n && n[0];
          this.text  = n && n[1];
          this.index = this.findIndexOfChoice(n);
        }
        this.feedback_ = false;
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
          return out;
        }

        nu = foam.Array.clone(nu);

        // Upgrade single values to [value, value].
        for ( var i = 0; i < nu.length; i++ ) {
          if ( ! Array.isArray(nu[i]) ) {
            nu[i] = [ nu[i], nu[i] ];
          }
        }

        return nu;
      },
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
        if ( o !== n ) this.choice = this.findChoiceByData(n) || [ n, n ];
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
    'size'
  ],

  methods: [
    function init() {
      this.onDetach(this.choices$.sub(this.onChoicesUpdate));
    },

    function initE() {
      // If no item is selected, and data has not been provided, select the 0th
      // entry.
      if ( ! this.data && ! this.index ) {
        this.index = 0;
      }

      if ( this.dao ) this.onDAOUpdate();

      this.start(this.selectSpec, {
        data$: this.index$,
        label$: this.label$,
        alwaysFloatLabel: this.alwaysFloatLabel,
        choices$: this.choices$,
        placeholder$: this.placeholder$,
        mode$: this.mode$,
        size: this.size
      }).end();

      this.dao$proxy.on.sub(this.onDAOUpdate);
    },

    function findIndexOfChoice(choice) {
      if ( ! choice ) return -1;
      var choices = this.choices;
      var data = choice[0];
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
          this.choice = ( d && this.findChoiceByData(d) ) || this.defaultValue;
        }
      }
    },
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.dao.select().then(function(s) {
          this.choices = s.array.map(this.objToChoice);
          if ( ! this.data && this.index === -1 ) this.index = this.placeholder ? -1 : 0;
        }.bind(this));
      }
    }
  ]
});
