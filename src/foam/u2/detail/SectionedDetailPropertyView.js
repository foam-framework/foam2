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
    ^card-label {
      font-size: 16px;
      font-weight: bold;
    }
    ^validation-container {
      margin-top: 4px;
      color: #d9170e;
    }
    ^helper-icon {
      width: 20px;
      height: 20px;
    }

    ^prop-slot {
      flex-grow: 1
    }

    ^error-icon {
      width: 16px;
      height: 16px;
    }
    ^error .foam-u2-TextField {
      background-color: #fbedec;
      border: solid 1px #d9170e;
      font-size: 12px;
    }
    ^error .foam-u2-tag-TextArea {
      background-color: #fbedec;
      border: solid 1px #d9170e;
      font-size: 12px;
    }
    ^error .foam-u2-tag-Select {
      background-color: #fbedec;
      border: solid 1px #d9170e;
      font-size: 12px;
    }
    ^error .foam-u2-view-date-DateTimePicker .date-display-box {
      background-color: #fbedec;
      border: solid 1px #d9170e;
      font-size: 12px;
    }

    /*
      !IMPORTANT!
      For the following inputs below, we are planning 
      encode these changes in the actual foam files
    */

    ^ .foam-u2-view-RadioView label {
      margin-left: 12px;
    }

    ^ .foam-u2-TextField {
      width: 100%;
      padding: 10px 8px;
      font-size: 14px;
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

    ^ .foam-u2-view-RichChoiceView-chevron {
      content: '▾';
      padding-left: 0px;
      font-size: 16px;
      color: #8D9090;
    }

    ^ .foam-u2-view-RichChoiceView-selection-view {
      padding: 2px 12px 0px 8px;
      width: 100%;
      border-radius: 3px;
      border: solid 1px #8e9090;
      background-color: #ffffff;
      box-sizing: border-box;
      -webkit-appearance: none;
      cursor: pointer;
      font-size: 14px;
    }

    ^ .foam-u2-view-RichChoiceView .search {
      padding: 8px 16px;
      font-size: 14px;
      border-bottom: 1px solid #f4f4f9;
    }

    ^ .foam-u2-detail-SectionedDetailPropertyView .property-filter {
      font-size: 14px;
      padding-left: 16px;
    }

    ^ .foam-u2-view-RichChoiceView .search input {
      border-bottom: none;
    }

    ^ .foam-u2-view-RichChoiceView .search img {
      top: 8px;
    }

    ^ .foam-u2-view-RichChoiceView-heading {
      border-bottom: 1px solid #f4f4f9;
      line-height: 24px;
      font-size: 14px;
      color: #333;
      font-weight: 900;
      padding: 6px 16px;
    }

    ^ .foam-u2-IntView {
      width: 100%;
      padding: 10px 8px;
      font-size: 14px;
    }

    ^ .DefaultRowView-row {
      background: white;
      padding: 8px 16px;
      font-size: 12px;
      color: #424242;
    }

    ^ .DefaultRowView-row:hover {
      background: #f4f4f9;
      cursor: pointer;
    }

    ^ .foam-u2-CheckBox {
      -webkit-appearance: none;
      border-radius: 2px;
      border: solid 1px #8e9090;
      box-sizing: border-box;
      display: inline-block;
      fill: rgba(0, 0, 0, 0);

      vertical-align: middle;

      height: 16px;
      width: 16px;

      opacity: 1;

      transition: background-color 140ms, border-color 140ms;
    }


    ^ .foam-u2-CheckBox-label {
      margin-left: 12px;
      vertical-align: middle;
    }

    ^ .foam-u2-CheckBox:checked {
      background-color: #604aff;
      fill: white;
      border: solid 1px #604aff;
    }

    ^ .foam-u2-CheckBox:checked:after {
      content: url(data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2048%2048%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%20version%3D%221.1%22%3E%0A%20%20%20%3Cpath%20fill%3D%22white%22%20stroke-width%3D%223%22%20d%3D%22M18%2032.34L9.66%2024l-2.83%202.83L18%2038l24-24-2.83-2.83z%22/%3E%0A%3C/svg%3E);
    }
  `,

  requires: [
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Item',
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

            // TODO: Conditionally render if the input is a checkbox or a radio

            return self.E()
              .start(self.Rows, { defaultChildStyle:  { 'line-height': '2' } })
                .start().add(prop.label$).addClass(this.myClass('card-label')).end()
                .start(self.Cols, { defaultChildStyle: { margin: '0 16px 0 0', 'justify-content': 'flex-start' }})
                  .start(self.Item).addClass(this.myClass('prop-slot')).add(prop).enableClass(this.myClass('error'), errorSlot).end()
                  .callIf(prop.help, function() { 
                    this.start({class: 'foam.u2.tag.Image', data: 'images/question-icon.svg'})
                      .addClass(this.myClass('helper-icon'))
                      .attrs({ title: prop.help })
                    .end();
                  })
                .end()
                .start(self.Cols, { defaultChildStyle: { 'justify-content': 'flex-start', 'align-items': 'center', margin: '0 8px 0 0' } }
                ).addClass(this.myClass('validation-container')).show(errorSlot)
                  .start({class: 'foam.u2.tag.Image', data: 'images/inline-error-icon.svg'})
                    .addClass(this.myClass('error-icon'))
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
