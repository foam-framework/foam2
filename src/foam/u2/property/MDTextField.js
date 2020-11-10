/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 

foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDTextField',
  extends: 'foam.u2.property.MDInput',

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
  ]
});
