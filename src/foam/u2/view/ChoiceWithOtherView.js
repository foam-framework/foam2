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
    }
  ],
  reactions: [
    ['', 'propertyChange.choiceData_', 'toData'],
    ['', 'propertyChange.otherData_', 'toData'],
    ['', 'propertyChange.data', 'fromData'],
    ['', 'propertyChange.choiceView_', 'fromData']
  ],
  listeners: [
    {
      name: 'toData',
      code: function() {
        this.data = this.showOther_ ? this.otherData_ : this.choiceData_;
      }
    },
    {
      name: 'fromData',
      code: function() {
        if ( ! this.choiceView_ ) return;
        this.choiceView_.data = this.data;
        if ( this.choiceView_.choice == null ) {
          this.choiceData_ = this.otherKey;
          this.otherData_ = this.data;
        } else {
          this.otherData_ = this.otherDefault;
        }
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
            .add(self.otherLabel$)
          .end()
          .start()
            .show(self.showOther_$)
            .tag(otherView, { data$: self.otherData_$ })
          .end();
      }));
    }
  ]
});