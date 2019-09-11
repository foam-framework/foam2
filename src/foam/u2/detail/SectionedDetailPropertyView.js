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
    ^ m3 {
      font-size: 16px;
      font-weight: bold;
    }

    ^validation-container {
      margin-top: 6px;
    }

    ^helper-icon {
      width: 20px;
      height: 20px;
    }

    ^tooltip {
      align-self: center;
      position: relative;
    }

    ^tooltip-container {
      z-index: -1;
      display: none;
      width: 80%;
      height: auto;
      line-height: 1.5;
      margin-right: 3px;
    }

    ^helper-text {
      background-color: rgba(0, 0, 0, 0.8);
      color: #fff;
      border-radius: 5px;
      border-top-right-radius: 0px;
      direction: ltr;
      padding: 2px;
      text-align: center;
    }

    ^arrow-right {
      width: 0;
      height: 0;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left:10px solid rgba(0, 0, 0, 0.8);
    }

    ^tooltip:hover .foam-u2-detail-SectionedDetailPropertyView-tooltip-container{
      position: absolute;
      display: flex;
      justify-content: flex-end;

      top: 0;
      right: 25px;
      width: 380px;
      z-index: 10;
    }

    /* Necessary to style the border radius. This should probably be in Select itself. */
    ^ .foam-u2-tag-Select {
      width: 100%;
      box-shadow: none;
      background: #ffffff url('images/dropdown-icon.svg') no-repeat 99% 50%;
      -webkit-appearance: none;
      cursor: pointer;
    }

    ^error .foam-u2-tag-TextArea,
    ^error .foam-u2-tag-Select,
    ^error .foam-u2-TextField,
    ^error .foam-u2-IntView,
    ^error .foam-u2-FloatView,
    ^error .foam-u2-DateView,
    ^error .foam-u2-view-date-DateTimePicker .date-display-box
    {
      border-color: /*%DESTRUCTIVE3%*/ #d9170e !important;
    }

    /*
      !IMPORTANT!
      For the following inputs below, we are planning
      encode these changes in the actual foam files
    */

    ^ .foam-u2-TextField,
    ^ .foam-u2-tag-Select,
    ^ .foam-u2-tag-TextArea,
    ^ .foam-u2-IntView {
      width: 100%;
    }

    ^ .foam-u2-view-date-DateTimePicker {
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

    ^ .foam-u2-view-RichChoiceView-container {
      z-index: 1000;
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

    ^ .foam-u2-CheckBox-label {
      margin-left: 12px;
      vertical-align: middle;
      white-space: pre-wrap;
    }

    ^ .foam-u2-view-RadioView .foam-u2-view-RadioView {
      margin-bottom:16px;
      display: flex;
      align-items: center;
      font-size: 16px;
      margin-right: auto;
    }


    ^ .foam-u2-view-RadioView label {
      margin-left: 12px;
    }

    /*
      !IMPORTANT!
      For the following inputs below, we are planning
      encode these changes in the actual foam files
    */

    /*
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

    ^ .foam-u2-CheckBox:checked {
      background-color: #604aff;
      fill: white;
      border: solid 1px #604aff;
    }

    ^ .foam-u2-CheckBox:checked:after {
      content: url(data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2048%2048%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%20version%3D%221.1%22%3E%0A%20%20%20%3Cpath%20fill%3D%22white%22%20stroke-width%3D%223%22%20d%3D%22M18%2032.34L9.66%2024l-2.83%202.83L18%2038l24-24-2.83-2.83z%22/%3E%0A%3C/svg%3E);
    }

    ^ input[type="radio" i] {
      -webkit-appearance: none;
      border-radius: 8px;
      background-color: #ffffff;
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

    ^ input[type="radio" i]:checked {
      background-color: #604aff;
    }

    ^ input[type="radio" i]:checked:after {
      content: url('images/active-radio.svg');
    }
    */
  `,

  requires: [
    'foam.core.ProxySlot',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.Visibility'
  ],

  properties: [
    'prop',
    {
      class: 'FObjectProperty',
      of: 'foam.core.Slot',
      name: 'visibilitySlot',
      expression: function(prop) {
        return prop.createVisibilityFor(this.data$).map((m) => m !== this.Visibility.HIDDEN);
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();

      this
        .show(this.ProxySlot.create({ delegate$: this.visibilitySlot$ }))
        .addClass(this.myClass())
        .add(this.slot(function(data, prop, prop$label) {
          var errorSlot = prop.validateObj && prop.validationTextVisible ?
            data.slot(prop.validateObj) :
            foam.core.ConstantSlot.create({ value: null });

          return self.E()
            .start(self.Rows)
              .callIf(prop$label, function() {
                this.start('m3')
                  .add(prop$label)
                  .style({ 'line-height': '2' })
                .end();
              })
              .start()
                .style({ 'position': 'relative', 'display': 'inline-flex', 'width': '100%' })
                .start()
                  .style({ 'flex-grow': 1 })
                  .add(prop)
                  .callIf(prop.validationStyleEnabled, function() {
                    this.enableClass(self.myClass('error'), errorSlot);
                  })
                .end()
                .callIf(prop.help, function() {
                  this.start()
                    .addClass(self.myClass('tooltip'))
                    .start({
                      class: 'foam.u2.tag.Image',
                      data: 'images/question-icon.svg'
                    })
                      .addClass(self.myClass('helper-icon'))
                    .end()

                    .start()
                      .addClass(self.myClass('tooltip-container'))
                      .start()
                        .addClass(self.myClass('helper-text'))
                        .start('p').style({ 'padding': '3px' })
                          .add(prop.help)
                        .end()
                      .end()
                      .start()
                        .addClass(self.myClass('arrow-right'))
                      .end()
                    .end()
                  .end()
                })
              .end()
              .callIf(prop.validationTextVisible, function() {
                this
                  .start()
                    .style({ 'align-items': 'center' })
                    .start(self.Cols)
                      .addClass(self.myClass('validation-container'))
                      .show(errorSlot)
                      .start({
                        class: 'foam.u2.tag.Image',
                        data: 'images/inline-error-icon.svg',
                        displayHeight: 16,
                        displayWidth: 16
                      })
                        .style({
                          'justify-content': 'flex-start',
                          'margin': '0 8px 0 0'
                        })
                      .end()
                      .start()
                        .style({ 'flex-grow': 1 })
                        .add(errorSlot.map((s) => {
                          return self.E().add(s);
                        }))
                      .end()
                    .end()
                  .end();
              })
            .end();
        }));
    }
  ]
});
