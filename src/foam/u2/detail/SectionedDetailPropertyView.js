/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'SectionedDetailPropertyView',
  extends: 'foam.u2.View',

  documentation: `
    View for one property of a SectionedDetailView.
  `,

  css: `
    .card-label {
      font-size: 16px;
      font-weight: bold;
    }
    .foam-u2-CheckBox-label {
      margin-left: 12px;
    }
    .foam-u2-view-RadioView label {
      margin-left: 12px;
    }
    .validation-container {
      margin-top: 4px;
      color: #d9170e;
    }
    .helper-icon {
      width: 20px;
      height: 20px;
    }
    .error-icon {
      width: 16px;
      height: 16px;
    }
    .error .foam-u2-TextField {
      background-color: #fbedec;
      border: solid 1px #d9170e;
      font-size: 12px;
    }
    .error .foam-u2-tag-TextArea {
      background-color: #fbedec;
      border: solid 1px #d9170e;
      font-size: 12px;
    }
    .error .foam-u2-tag-Select {
      background-color: #fbedec;
      border: solid 1px #d9170e;
      font-size: 12px;
    }
    .error .foam-u2-view-date-DateTimePicker .date-display-box {
      background-color: #fbedec;
      border: solid 1px #d9170e;
      font-size: 12px;
    }
  `,

  requires: [
    'foam.u2.layout.Rows',
    'foam.u2.layout.Row',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Col'
  ],

  properties: [
    'prop',
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      this
        .show(this.prop.createVisibilityFor(this.data$)
          .map(function(m) { 
            return m != foam.u2.Visibility.HIDDEN; 
          }
        ))
        .addClass(this.myClass())
        .start(self.Rows, { defaultChildConfig: { padding: '8px 0'} })
          .add(this.slot(function(prop) {
            
            var errorSlot = foam.core.SimpleSlot.create({value: null});
            var slotSub;
            self.slot(function(data, prop$validateObj) {
              if ( ! ( data && prop$validateObj ) ) return;
              slotSub && slotSub.detach();
              slotSub = errorSlot.follow(data.slot(prop$validateObj));
            }).get();

            return self.E()
              .start(self.Rows, { defaultChildConfig:  { lineHeight: '2' } })
                .start().add(prop.label$).addClass('card-label').end()
                .start(self.Cols, { contentJustification: foam.u2.layout.ContentJustification.START, defaultChildConfig: { margin: '0 16px 0 0' } })
                  .add(prop).enableClass('error', errorSlot)
                  .callIf(prop.help, function() { 
                    this.start({class: 'foam.u2.tag.Image', data: 'images/question-icon.svg'})
                      .addClass('helper-icon')
                      .attrs({ title: prop.help })
                    .end();
                  })
                .end()
                .start(self.Cols, { 
                  contentJustification: foam.u2.layout.ContentJustification.START, 
                  itemAlignment: foam.u2.layout.ItemAlignment.CENTER, defaultChildConfig: { margin: '0 8px 0 0' }
                }).addClass('validation-container').show(errorSlot)
                  .start({class: 'foam.u2.tag.Image', data: 'images/inline-error-icon.svg'})
                    .addClass('error-icon')
                  .end()
                  .add(errorSlot.map((s) => {
                    return self.E().add(s);
                  }))
                .end()
              .end()
          }));
    }
  ]
});
