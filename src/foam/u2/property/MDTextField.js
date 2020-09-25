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
      name: 'showValidation',
      value: true
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
    {
      class: 'Int',
      name: 'displayWidth'
    }
  ],

  methods: [

    function initE() {
      var self = this;
      this.addClass(this.myClass());
      if (this.label) {
        this.start('label')
            .addClass('label')
            .addClass(this.slot(function(data, focused) {
              return (typeof data == 'undefined' || data == '') &&
                ! focused ? 'label-offset' : '';
            }, this.data$, this.focused_$))
            .add(this.label$)
            .end();
      } else {
        this.addClass('no-label');
      }

      this.inputE();

      if ( this.showValidation ) {
        this.enableClass(this.myClass('invalid'), this.validationError_$);
        this.start().addClass(this.myClass('validation-error')).add(this.validationError_$).end();
      }
    },

    function inputE() {
      var self = this;
      var input = this.start('input')
        .attrs({ type: 'text', onKey: this.onKey, value: this.data })
        .on('focus', function() { self.focused_ = true; })
        .on('blur',  function() { self.focused_ = false; }).on('change', function(e) {
        self.data = e.target.value; })

      if (!this.showLabel && this.placeholder$)
        input.attrs({ placeholder: this.placeholder$ });
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
      opacity: 1;
      overflow-x: hidden;
      overflow-y: auto;
      height: 10rem;
    }

    ^no-label {
      padding-top: 8px;
    }
    ^ input {
      background: transparent;
      border-bottom: none;
      border-left: none;
      border-top: none;
      border-right: none;
      color: #444;
      flex-grow: 1;
      font-family: inherit;
      font-size: inherit;
      padding-top: 1rem;
      padding-bottom: 1rem;
      resize: none;
      z-index: 1;
    }
    ^ input:focus {
      border-bottom: 2px solid #4285f4;
      padding: 0 0 6px 0;
      outline: none;
    }
    ^validation-error {
      color: #db4437;
    }
    ^invalid input {
      border-bottom: 2px solid #db4437;
      margin-bottom: 4px;
    }
    ^invalid input:focus {
      border-bottom: 2px solid #db4437;
    }
    ^inline {
      top: 32px;
    }
  `
});