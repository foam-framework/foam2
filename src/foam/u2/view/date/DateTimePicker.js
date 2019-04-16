/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view.date',
  name: 'DateTimePicker',
  extends: 'foam.u2.view.date.AbstractDateView',
  requires: [
    'foam.u2.view.date.CalendarDatePicker',
    'foam.u2.view.date.Month',
    'foam.u2.view.ChoiceView'
  ],
  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^date_time_picker input,
        ^date_time_picker select {
          font-size: inherit;
        }

        ^next_btn, ^prev_btn {
          display: inline-block;
          width: 31px;
          height: 31px;
          line-height: 31px;
          background-color: lightgray;
          margin: 1px;
          text-align: center;
          cursor: pointer;
          user-select: none;
        }
      */}
    })
  ],
  methods: [
    function initE() {
      var zeroLeadingNumArray = function(start, end) {
        var a = [];
        for ( var i = start; i <= end; i++ ) {
          a.push((i < 10 ? '0' : '') + i);
        }
        return a;
      };

      var self = this;
      this.startContext({data: this}).
        addClass(this.myClass('date_time_picker')).
        style({
          'display': 'inline-flex',
          'flex-direction': 'column'
        }).
        start('span').
          style({
            'display': 'flex',
            'align-items': 'center'
          }).
          start('span').
            addClass(this.myClass('prev_btn')).
            entity('#8249').
            on('click', function() { self.year--; }).
          end().
          start(this.YEAR).
            style({
              'flex-grow': 1,
              'text-align': 'center'
            }).
          end().
          start('span').
            addClass(this.myClass('next_btn')).
            entity('#8250').
            on('click', function() { self.year++; }).
          end().
        end().
        start('div').
          style({
            'display': 'flex',
            'align-items': 'center'
          }).
          start('span').
            addClass(this.myClass('prev_btn')).
            entity('#8249').
            on('click', function() { self.monthIndex--; }).
          end().
          start(this.MONTH, {size: 3}).
            style({
              'flex-grow': 1,
              'display': 'flex',
              'flex-direction': 'column',
              'text-align-last': 'center'
            }).
          end().
          start('span').
            addClass(this.myClass('next_btn')).
            entity('#8250').
            on('click', function() { self.monthIndex++; }).
          end().
        end().
        start(this.CalendarDatePicker, {data$: this.data$}).
          style({
            'flex-shrink': '1'
          }).
        end().
        start('div').
          style({
            'display': 'flex',
            'justify-content': 'center',
            'font-size': 'medium'
          }).
          tag(this.NOON, { data: this }).
          start(this.ChoiceView, {
            choices: zeroLeadingNumArray(1, 12),
            data$: this.hour12$
          }).
            attrs({size: 2, maxlength: 2}).
          end().
          start().
            add(':').
            style({
              'padding': '0 4px',
              'font-weight': 'bold'
            }).
          end().
          start(this.ChoiceView, {
            choices: zeroLeadingNumArray(0, 59),
            data$: this.minute$
          }).
            attrs({size: 2, maxlength: 2}).
          end().
          add(this.PERIOD).
        end().
      endContext();
    }
  ]
});
