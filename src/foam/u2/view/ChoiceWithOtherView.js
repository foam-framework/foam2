/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ChoiceWithOtherView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.layout.Rows'
  ],
  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'choiceView',
      required: true
    },
    {
      documentation: 'When this value is selected, the "Other" view will appear.',
      name: 'otherKey',
      required: true
    },
    // TODO(mcarcaso): HACK!  This isn't robust.  I think this would be simpler to just roll it into the ChoiceView
    // and have it render an "other" option if "otherAvialable" is true.
    {
      documentation: `
        When copying in the data, if it is this value, we deem it to be unselected.
        This is so we can differentiate the value not being selected and the value
        being "other".
      `,
      name: 'noSelectionValue',
      value: ''
    },
    {
      documentation: 'The label to display above the "Other" view.',
      name: 'otherLabel',
      value: 'Please specify'
    },
    {
      documentation: 'The default value to prefill the "Other" view with.',
      name: 'otherDefault',
      value: ''
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'otherView',
      value: { class: 'foam.u2.TextField', onKey: true }
    },

    'data',
    'choiceView_',
    'choiceData_',
    'otherData_',
    {
      class: 'Boolean',
      name: 'showOther_',
      expression: function(choiceData_, otherKey) {
        return foam.util.equals(choiceData_, otherKey);
      }
    },
    'preventFeedback_'
  ],
  css: `
    .other-choice-label {
      margin-top: 20px;
  }
  `,
  reactions: [
    ['', 'propertyChange.choiceData_', 'toData'],
    ['', 'propertyChange.otherData_', 'toData'],
    ['', 'propertyChange.data', 'fromData'],
    ['', 'propertyChange.choiceView_', 'fromData'],
    ['choiceView_', 'propertyChange.choices', 'fromData'],
  ],
  listeners: [
    {
      name: 'toData',
      code: function() {
        if ( this.preventFeedback_ ) return;
        this.preventFeedback_ = true;
        this.data = this.showOther_ ? this.otherData_ : this.choiceData_;
        this.preventFeedback_ = false;
      }
    },
    {
      name: 'fromData',
      code: function() {
        if ( ! this.choiceView_ || this.preventFeedback_ ) return;
        this.preventFeedback_ = true;
        this.choiceView_.data = this.data;
        if ( this.choiceView_.choice == null ) {
          if ( ! foam.util.equals(this.data, this.noSelectionValue) ) {
            this.choiceData_ = this.otherKey;
            this.otherData_ = this.data;
          }
        } else {
          this.otherData_ = this.otherDefault;
        }
        this.preventFeedback_ = false;
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      self.SUPER();
      self.add(self.slot(function(choiceView, otherView) {
        return self.Rows.create()
          .tag(choiceView, { data$: self.choiceData_$ }, self.choiceView_$)
          .start('m3')
            .show(self.showOther_$)
            .start()
              .addClass('other-choice-label')
              .add(self.otherLabel$)
            .end()
          .end()
          .start()
            .show(self.showOther_$)
            .tag(otherView, { data$: self.otherData_$ })
          .end();
      }));
    }
  ]
});
