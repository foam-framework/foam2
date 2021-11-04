/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'FormattedTextField',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
  ],

  css: `
    ^ {
      display: flex;
    }

    ^container-selection {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      box-sizing: border-box;
      width: 64px;
      height: 30px;

      border: 1px solid /*%GREY3%*/ #cbcfd4;
      border-right: none;
      border-radius: 3px 0 0 3px;
    }

    ^container-selection p {
      margin: 0;
    }

    ^container-input {
      box-sizing: border-box;
      flex: 1;
      height: 30px;

      font-size: 14px;

      border: 1px solid /*%GREY3%*/ #cbcfd4;
      border-left: none;
      border-radius: 0 3px 3px 0;
    }
  `,

  properties: [
    'prop',
    'inputElem',
    {
      class: 'String',
      name: 'valueString',
      documentation: 'This is the front facing formatted value',
      factory: function() {
        return this.data || '';
      },
      preSet: function(old, v) {
        // Determine if this is a deletion, and remove meaningful
        //   input characters rather than format characters
        var deletion = this.checkDeletion(old, v);

        if (
          deletion !== null
          // only act on one-character deletions; multiple
          // characters is likely a selection delete
          && deletion[1] == 1
        ) {
          v = this.smartDelete(old, deletion);
        }

        var sanitized = this.sanitizeString(v);
        this.data = sanitized;
        var formatted = this.prop.tableCellFormatter.f(
          sanitized, this.prop);

        return formatted;
      },
      postSet: function (old, v) {
        if ( ! old || ! v ) return;

        var deletion = this.checkDeletion(
          this.sanitizeString(old), this.sanitizeString(v));
        console.log(old, v, deletion);

        var firstInequal = 0;

        while (
          firstInequal < v.length &&
          v[firstInequal] == old[firstInequal]
        ) firstInequal++;

        if ( deletion == null ) firstInequal++;

        if ( this.inputElem && this.inputElem.el() ) {
          console.log('el', this.inputElem.el(), firstInequal);
          this.inputElem.el().setSelectionRange(
            firstInequal, firstInequal);
        }
      },
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass())
        .add(this.slot(function(mode) {
          if ( mode === foam.u2.DisplayMode.RW ) {
            var e = this.E().style({ 'display': 'flex' })
            .startContext({ data: self })
              .start(self.VALUE_STRING).addClass(self.myClass('container-input'))
              ;
            // Needed for caret repositioning
            self.inputElem = e;
            e = e
              .end()
            .endContext();
          }
          return e;
        }));
    },
    function fromProperty(prop) {
      this.SUPER(prop);

      this.prop = prop;
    },
    // TODO: move this to property of foam.core.String
    function sanitizeString(s) {
      return s.replace(/[\s\._\-\/]+/g, "");
    },
    // Check if a change represents a contiguous deletion,
    // returning an array of [ start, amount ] going backward,
    // or null if the change is not recognized as a deletion.
    function checkDeletion(old, v) {
      if ( ! old ) return null;
      if ( v.length > old.length ) return null;
      var formattedDeletionIndex = -1;
      var formattedDeletionAmount = 0;

      var firstInequal = 0;
      while (
        firstInequal < v.length &&
        v[firstInequal] == old[firstInequal]
      ) firstInequal++;

      // If the remaining chars in 'v' match the end of 'old'
      // then this is a contiguous deletion
      var ending = v.substr(firstInequal, v.length);
      if ( ending == old.substr(old.length - ending.length ) ) {
        formattedDeletionAmount =
          old.length - ending.length - firstInequal;
        formattedDeletionIndex =
          firstInequal + formattedDeletionAmount;
      }

      if ( formattedDeletionIndex !== -1 ) {
        return [formattedDeletionIndex, formattedDeletionAmount];
      }
      return null;
    },
    // Delete a number of meaningful characters
    function smartDelete(str, deletion) {
      var from = deletion[0];
      var amount = deletion[1];
      var keep = str.slice(from);
      var modify = str.slice(0, from);

      // Delete #amount characters
      for ( let i = 0 ; i < amount ; i++ ) {
        // Delete a single meaningful character
        let somethingDeleted = false;
        while ( modify.length > 0 && ! somethingDeleted ) {
          deletionModify = modify.slice(0, modify.length - 1);
          if ( ! this.formattedEqual(deletionModify, modify) ) {
            somethingDeleted = true;
          }
          modify = deletionModify;
        }
      }

      return modify + keep;
    },
    // Check if two inputs are the same when re-sanitized and
    // re-formatted. Answers the question "was there a meaninful
    // change to the string?"
    function formattedEqual(deletion, subject) {
      var formattedDeletion = this.prop.tableCellFormatter.f(
        this.sanitizeString(deletion), this.prop)
      var formattedSubject = this.prop.tableCellFormatter.f(
        this.sanitizeString(subject), this.prop)
      return formattedDeletion == formattedSubject;
    }
  ],
})

