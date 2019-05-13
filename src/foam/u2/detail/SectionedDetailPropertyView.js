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

    /*
      For the following inputs below, we are planning 
      encode these changes in the actual foam files
    */
    ^ .foam-u2-TextField {
      
      width: 100%;
      padding: 10px 8px;
      font-size: 14px;
    }

    ^ .foam-u2-CheckBox {
    }

    ^ .foam-u2-view-date-DateTimePicker {
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select {
      width: 100%;
      font-size: 14px;
      border: solid 1px #8e9090;
      border-radius: 3px;
      font-weight: 400;
      padding: 10px 8px;
      box-shadow: none;
      background: #ffffff url('images/dropdown-icon.svg') no-repeat 99% 50%;
      -webkit-appearance: none;
      cursor: pointer;
    }

    ^ .foam-u2-view-RichChoiceView {
      display: flex;
    }

    ^ .foam-u2-view-RichChoiceView-selection-view {
      padding: 10px 8px;
      width: 100%;
      border-radius: 3px;
      border: solid 1px #8e9090;
      background-color: #ffffff;
      font-size: 14px;
      box-sizing: border-box;
      -webkit-appearance: none;
      cursor: pointer;
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
          .add(this.slot(function(data, prop) {

            var errorSlot = prop.validateObj ?
              data.slot(prop.validateObj) :
              foam.core.ConstantSlot.create({ value: null });

            return self.E()
              .start(self.Rows, { defaultChildConfig:  { lineHeight: '2' } })
                .start().add(prop.label$).addClass('card-label').end()
                .start(self.Cols, { contentJustification: foam.u2.layout.ContentJustification.START, defaultChildConfig: { margin: '0 16px 0 0' } })
                  .start(self.Col, { flex: 1 }).add(prop).enableClass('error', errorSlot).end()
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
              .end();
          }));
    }
  ]
});
