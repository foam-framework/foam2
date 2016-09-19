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

  documentation: 'Wraps a tag that represents a singular choice. That is, ' +
      'this controller shows the user a fixed, probably small set of ' +
      'choices, and the user picks one. ' +
      'The choices are [value, label] pairs. this.choice is the current ' +
      'pair, this.data the current value. this.text is the current label, ' +
      'this.label is the label for the whole view (eg. "Medal Color", not ' +
      '"Gold"). ' +
      'The choices can be provided either as an array (this.choices) or as ' +
      'a DAO plus the function this.objToChoice which turns objects from the ' +
      'DAO into [value, label] pairs. ' +
      'this.selectSpec is a ViewSpec for the inner view. It defaults to ' +
      'foam.u2.tag.Select.',

  properties: [
    {
      class: 'String',
      name: 'label',
      documentation: 'User-visible label. Not to be confused with "text", ' +
          'which is the user-visible name of the currently selected choice.'
    },
    {
      name: 'choice',
      documentation: 'The current choice. (That is, a [value, text] pair.)',
      getter: function() {
        var value = this.data;
        for ( var i = 0 ; i < this.choices.length; i++ ) {
          var choice = this.choices[i];
          if ( value === choice[0] ) return choice;
        }
        return undefined;
      },
      setter: function(nu) {
        var oldValue = this.choice;
        this.data = nu[0];
        this.text = nu[1];
        this.pubPropertyChange_('choice', oldValue, this.choice);
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
      postSet: function(old, nu) {
        var value = this.data;

        // Update the current choice when choices update.
        if ( this.hasOwnProperty('index') && ! this.hasOwnProperty('data') &&
            this.index >= 0 && this.index < nu.length ) {
          this.choice = nu[this.index];
          return;
        }

        for ( var i = 0; i < nu.length; i++ ) {
          var choice = nu[i];
          if ( value === choice[0] ) {
            this.choice = choice;
            break;
          }
        }
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
        if ( nu < 0 || this.choices.length === 0 ) return 0;
        if ( nu >= this.choices.length ) return this.choices.length - 1;
        return nu;
      },
      postSet: function(old, nu) {
        if ( this.choices.length && this.data !== this.choices[nu][0] ) {
          this.data = this.choices[nu][0];
        }
      }
    },
    {
      class: 'String',
      name: 'placeholder',
      value: '',
      documentation: 'Default entry that is "selected" when data is empty.'
    },
    {
      class: 'Function',
      name: 'objToChoice',
      documentation: 'A function which adapts an object from the DAO to a ' +
          '[key, value] choice. Required when a DAO is provided.'
    },
    {
      name: 'dao',
      postSet: function(old, nu) {
        old && old.on.unsub(this.onDAOUpdate);
        nu && nu.on.sub(this.onDAOUpdate);
        this.onDAOUpdate();
      }
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        for ( var i = 0; i < this.choices.length; i++ ) {
          if ( this.choices[i][0] === nu ) {
            if ( this.index !== i ) {
              this.text = this.choices[i][1];
              this.index = i;
            }
            return;
          }
        }

        // If we're still here, we've been ordered to take on a value that isn't
        // listed. Emit a warning to the console.
        if ( nu && this.choices.length ) {
          this.warn('ChoiceView data set to invalid choice: ', nu);
        }
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
    }
  ],

  methods: [
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
        placeholder$: this.placeholder$
      }).end();
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.dao.select(foam.mlang.sink.Map.create({
          arg1: this.objToChoice,
          delegate: foam.dao.ArraySink.create()
        })).then(function(map) {
          this.choices = map.delegate.a;
        }.bind(this));
      }
    }
  ]
});
