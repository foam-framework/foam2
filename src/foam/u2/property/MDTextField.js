/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 

foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDTextField',
  extends: 'foam.u2.View',

  imports: [
    'setTimeout',
  ],

  properties: [
    {
      name: 'showLabel',
      attribute: true,
      factory: function() {
        return ! this.inline;
      }
    },
    {
      type: 'Boolean',
      name: 'inline',
      value: false
    },
    {
      name: 'label',
    },
    {
      name: 'placeholder',
      documentation: 'Ignored when $$DOC{ref:".showLabel"} is true, but used ' +
          'as an inline placeholder when it\'s false.',
    },
    {
      type: 'Boolean',
      name: 'onKey',
      value: true,
      documentation: 'Set true to update $$DOC{ref:".data"} on every ' +
          'keystroke, rather than on blur.',
    },
    {
      type: 'Boolean',
      name: 'focused_',
      value: false,
      postSet: function(old, nu) {
        if ( !old && nu && this.autocompleter ) {
          this.autocompleteView_ = this.autocompleteView({
            rowView: this.autocompleteRowView || undefined,
            dao: this.autocompleter.filteredDAO$Proxy
          }, this.Y);
          this.autocompleteView_.data$.addListener(function(_, __, old, nu) {
            if ( nu ) {
              var str = this.autocompleter.objToString(nu);
              this.data = str;
              this.autocompleter.partial = str;
            }
          }.bind(this));
          this.autocompletePopup_ = this.AutocompletePopup.create({
            inline: this.inline
          }, this.Y);
          this.autocompletePopup_.add(this.autocompleteView_);
          this.add(this.autocompletePopup_);
        } else if ( old && !nu && this.autocompleteView_ ) {
          // Unload the entire autocomplete structure.
          // Needs to be in the next frame so it can update the value properly,
          // if the autocomplete was clicked.
          this.setTimeout(function() {
            if (this.autocompleteView_) {
              this.autocompleteView_.dao = undefined;
              this.autocompleteView_ = null;
            }
            if (this.autocompletePopup_) {
              this.autocompletePopup_.remove();
              this.autocompletePopup_ = null;
            }
          }.bind(this), 200);
        }
      },
    },
    {
      name: 'autocompleter',
      documentation: 'Optional. If set, this is the Autocompleter that will ' +
          'handle autocomplete results.',
    },
    {
      type: 'ViewFactory',
      name: 'autocompleteView',
      documentation: 'Factory for the autocompletion view. Override to ' +
          'configure how autocomplete results are displayed.',
      defaultValue: 'foam.u2.search.AutocompleteView',
    },
    {
      type: 'ViewFactory',
      name: 'autocompleteRowView',
      documentation: 'View for each row in the autocomplete popup.',
    },
    {
      name: 'autocompleteView_',
      documentation: 'Internal cache of the autocompletion view.',
    },
    {
      name: 'autocompletePopup_',
      documentation: 'Internal cache of the popup containing the ' +
          'autocomplete view.',
    },
    'isInvalid'
  ],

  methods: [

    function initE() {
      var self = this;
      if ( ! this.prop ) return;

      this.addClass(this.myClass());
      if (this.label) {
        this.start('label')
            .addClass('label')
            .addClass(this.slot(function(data, focused) {
              return (typeof data != 'undefined' && data !== '') ||
                focused ? 'label-up' : '';
            }, this.data$, this.focused_$))
            .add(this.label$)
            .end();
      } else {
        this.addClass('no-label');
      }

      this.inputE();

      var errorSlot = this.prop.validateObj && this.prop.validationTextVisible ?
        this.__context__.data.slot(this.prop.validateObj) :
        foam.core.ConstantSlot.create({ value: null });

        this
          .start().addClass(this.myClass('invalid')).addClass(this.myClass('validation-error'))
            .addClass(this.slot(function(isInvalid) { return isInvalid ? 'error-msg' : ''; }))
            .add(errorSlot.map((s) => {
              self.isInvalid = s !== null;
              return self.E().add(s);
            }))
          .end();
    },

    function inputE() {
      var self = this;
      var input = this.start('input')
        .attrs({ type: 'text', onKey: this.onKey, value: this.data })
        .on('focus', function() { self.focused_ = true; })
        .on('blur',  function() { self.focused_ = false; }).on('change', function(e) {
        self.data = e.target.value; })

      this.link();
      input.end();
    },

    function fromProperty(prop) {
    this.SUPER(prop);
      this.label = this.label || prop.label;
      this.prop = prop;
    },

    function link() {
      // Template method, can be overriden by sub-classes
      this.attrSlot(null, this.onKey ? 'input' : 'change').linkFrom(this.data$);
    },
  ],

  classes: [
    {
      name: 'AutocompletePopup',
      extends: 'foam.u2.Element',
      documentation: 'Exactly what it says on the tin. This is an MD-spec ' +
          'popup for autocomplete that appears right below the text field.',
      properties: [
        'inline',
      ],
      methods: [
        function initE() {
           this.addClass(this.myClass()).enableClass(this.myClass('inline'), this.inline$);
        },
      ],
    },
  ],

  css: `
  ^ {
      display: flex;
      flex-direction: column;
      height: 10%;
      position: relative;
    }
    ^ .label {
      transition: font-size 0.5s, top 0.5s;
      top: 25%;
      position: relative;
      font-size: larger;
      font-weight: 500;
    }
    ^ .label-up {
      font-size: smaller;
      font-weight: unset;
      top: 0;
    }
    ^ input {
      background: transparent;
      border-bottom: none;
      border-left: none;
      border-top: none;
      border-right: none;
      color: #000;
      font-family: inherit;
      font-size: inherit;
      resize: none;
      width: 100%;
      bottom: 35%;
      position: absolute;
      z-index: 1;
    }
    ^ input:focus {
      border-bottom: 2px solid #4285f4;
    }
    ^validation-error {
      color: #db4437;
      opacity: 0;
      position: absolute;
      bottom: 0;
      transition: opacity 1s;
    }
    ^ .error-msg {
      opacity: 1;
      transition: opacity 1s;
    }
  `
});
