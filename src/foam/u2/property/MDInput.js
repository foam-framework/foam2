/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDInput',
  extends: 'foam.u2.View',

  imports: [
    'warn'
  ],

  properties: [
    {
      name: 'data',
      preSet: function(o, d) {
        var f = ! d || typeof d === 'string' || typeof d === 'number' || typeof d === 'boolean' || foam.Date.isInstance(d);
        if ( ! f ) {
          this.warn('Set Input data to non-primitive:' + d);
          return o;
        }
        return d;
      }
    },
    {
      class: 'Boolean',
      name: 'onKey',
      attribute: true,
      // documentation: 'When true, $$DOC{ref:".data"} is updated on every keystroke, rather than on blur.'
    },
    {
      class: 'Int',
      name: 'size'
    },
    {
      class: 'Int',
      name: 'maxLength',
      attribute: true,
      // documentation: 'When set, will limit the length of the input to a certain number'
    },
    'type',
    {
      name: 'placeholder',
      factory: function() { return this.placeholder || this.prop ? this.prop.placeholder : ''; }
//      expression: function() { this.placeholder = this.placeholder; }
    },
    {
          name: 'label',
        },
        {
              type: 'Boolean',
              name: 'focused_',
              value: false
            },
            'isInvalid',
            'prop',
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

        nu = foam.Array.clone(nu);

        // Upgrade single values to [value, value].
        for ( var i = 0; i < nu.length; i++ ) {
          if ( ! Array.isArray(nu[i]) ) {
            nu[i] = [ nu[i], nu[i] ];
          }
        }

        if ( this.dynamicSize ) this.size = Math.min(nu.length, this.maxSize);
        return nu;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
      var self = this;
      this
        .start('label')
          .addClass('label')
          .addClass(this.slot(function(data, focused) {
            return (typeof data != 'undefined' && data !== '') ||
              focused || this.placeholder !== '' ? 'label-up' : '';
          }, this.data$, this.focused_$))
          .add(this.label$)
        .end()
        .add(this.inputE())
      if ( this.prop ) {
        var errorSlot = this.prop.validateObj && this.prop.validationTextVisible ?
          this.__context__.data.slot(this.prop.validateObj) :
          foam.core.ConstantSlot.create({ value: null });

        this
          .start().addClass('validation-error')
            .addClass(this.slot(function(isInvalid) { return isInvalid ? 'error-msg' : ''; }, this.isInvalid$))
            .add(errorSlot.map((s) => {
              self.isInvalid = s !== null && s !== '';
              return self.E().add(s);
            }))
          .end();
      }
    },
    function inputE() {
      var self = this;
      var input = this.start('input')
        .attrs({
          type: this.type,
          onKey: this.onKey,
          value: this.data$,
          size: this.size,
          placeholder: this.placeholder,
        })
        .on('focus', function() { self.focused_ = true; })
        .on('blur',  function() { self.focused_ = false; }).on('change', function(e) {
        self.data = e.target.value; })
        if ( this.choices && this.choices.length ) {
          input
            .setAttribute('list', this.id + '-datalist')
            this.start('datalist').
              // TODO: I should be able to just set the 'id' in the start() above
              // but it doesn't work. Find out why.
              call(function() { this.id = self.id + '-datalist' }).
              forEach(this.choices, function(c) {
                var key   = c[0];
                var label = c[1];
                this.start('option').attrs({value: key}).add(label).end();
              }).
            end()
        }

      input.attrSlot(null, this.onKey ? 'input' : null).linkFrom(this.data$);
      input.end();
    },

    function initCls() {
      // Template method, can be overriden by sub-classes
      this.addClass(this.myClass());
    },

    function link() {
      // Template method, can be overriden by sub-classes
      this.attrSlot(null, this.onKey ? 'input' : null).linkFrom(this.data$);
    },

    function fromProperty(p) {
      this.SUPER(p);
      this.label = this.label || p.label;
      this.prop = p;

      if ( ! this.hasOwnProperty('onKey') && p.validateObj ) this.onKey = true;
    },

    function updateMode_(mode) {
      // TODO: make sure that DOM is updated if values don't change
      this.setAttribute('readonly', mode === foam.u2.DisplayMode.RO);
      this.setAttribute('disabled', mode === foam.u2.DisplayMode.DISABLED);
      this.show(mode !== foam.u2.DisplayMode.HIDDEN);
    }
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      height: 5rem;
      position: relative;
      background-color: #e7eaec;
      padding-left: 1rem;
      padding-top: 1rem;
      padding-right: 1rem;
      border-radius: 10px;
    }
    ^ .label {
      transition: font-size 0.5s, top 0.5s;
      top: 20%;
      position: relative;
      font-size: 2rem;
      font-weight: 500;
      color: #5a5a5a
    }
    ^ .label-up {
      font-size: 1.5rem;
      font-weight: unset;
      top: 0;
    }
    ^ .input-container {
      background-color: #e7eaec;
    }
    ^ input {
      width: 92%;
      height: 3rem;
      outline: none;
      background: transparent;
      border-bottom: 2px solid #888;
      border-left: none;
      border-top: none;
      border-right: none;
      font-size: 2rem;
      resize: none;
      bottom: 0;
      position: absolute;
    }
    ^ input:focus {
      border-bottom: 2px solid #4285f4;
    }
    ^ .validation-error {
      font-size: 0rem;
      position: absolute;
      top: 100%;
      color: #db4437;
      opacity: 0;
      position: absolute;
      bottom: 0;
      transition: opacity .5s;
    }
    ^ .error-msg {
      font-size: 1.5rem;
      opacity: 1;
//      transition: opacity 3s;
    }
  `
});
