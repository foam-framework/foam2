/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view.date',
  name: 'DateTimePicker',
  extends: 'foam.u2.view.date.AbstractDateView',

  documentation: `
  This is a simple date time picker for browsers that do not have their own implementation.
  The date picker will automatically be used if it a browser does not support date, see Element.js`,

  requires: [
    'foam.u2.view.date.CalendarDatePicker',
    'foam.u2.view.date.Month',
    'foam.u2.view.ChoiceView'
  ],

  css: `
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
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    ^ .date-time-picker {
      display: inline-block;
      width: 333px;
      min-height: 304px;
      text-align: center;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #cbcfd4;
      border-radius: 5px;
      background-color: #ffffff;
      padding-bottom: 25px;
      margin-top: 16px;
      z-index: 100002;
      position: absolute;
    }

    .time-of-day {
      display: block;
      justify-content: center;
      font-size: medium;
    }

    ^ .colon {
      padding': '0 4px';
      font-weight': 'bold;
    }

    ^ .year {
      border-radius: 5px 5px 0px 0px;
      background-color: /*%PRIMARY3%*/ #406dea;
      color: #ffffff;
      display: inline-block;
      align-items: center;
      height: 47px;
      width: 333px;
      text-align: center;
    }

    ^ .year .property-year {
      padding-top:4px;
    }

    ^ .year .property-year .foam-u2-IntView {
      width: 70px;
      text-align: center;
    }

    ^ .year-number {
      background: rgba(0,0,0,0);
      border: none;
      color: white;
      display: inline-block;
      font-size: large;
    }

    ^ .arrow-left {
      float: left;
      padding: 10px;
      margin-top: 10px;
      margin-left: 23px;
    }

    ^ .arrow-right {
      float: right;
      padding: 10px;
      margin-top: 10px;
      margin-right: 23px;
    }

    ^ .month {
      display: inline-block;
      display: block;
      align-items: center;
      padding-top: 24px;
      padding-bottom: 24px;
      text-align: center;
    }

    ^ .month-name {
      padding-top: 3px;
      padding-bottom: 3px;
      display: inline-block;
      font-weight: 500;
    }

    ^ .arrow-container {
      display: inline-block;
      width: 24px;
      height: 24px;
      background-image: linear-gradient(#ffffff, #e7eaec);
      text-align: center;
      border: 1px solid #cbcfd4;
    }

    ^ .arrow-container-left{
      margin-left: 25px;
      float: left;
    }

    .arrow-container-left:hover, .arrow-container-right:hover, .arrow-left:hover, .arrow-right:hover {
      cursor: pointer;
    }

    ^ .arrow-container-right{
      margin-right: 25px;
      float:right;
    }

    ^ .arrow-black {
      padding-top: 6px;
    }

    ^ .calendar {
      display: inline-block;
      text-align: center;
    }

    ^ .time-of-day {
      display: inline-block;
    }

    ^overlay {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10000;
    }

    ^ .date-display-box {
      height: 36px;
      width: 216px;
      font-size: 14px;
      background-color: #ffffff;
      border: 1px solid #cbcfd4;
      border-radius: 3px;
    }

    ^ .date-display-box:hover {
      border-color: #9ba1a6;
    }

    ^ .focus-border {
      border-radius: 1px;
      border: solid 1px #406dea;
      box-shadow: inset 0 2px 1px 0 rgba(32, 46, 120, 0.42);
    }

    ^ .date-display-text {
      display: inline-block;
      margin-top: 9px;
      margin-left: 8px;
      width: 176px;
      height: 18px;
    }

    ^ .date-display-image {
      float: right;
      display: inline-block;
      margin-top: 10px;
      margin-right: 8px;
      position: relative;
    }

    ^ .date-display-image-cancel {
      z-index: 10001;
    }

    ^ {
      position: relative;
    }
  `,

  messages: [
    { name: 'SELECT_DATE', message: 'Select date' }
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'showTimeOfDay',
      value: false
    },
    {
      type: 'String',
      name: 'monthName',
      expression: function(month) {
        return this.month.label;
      }
    },
    {
      class: 'Boolean',
      name: 'isOpen_',
      value: false,
      documentation: `Used to show/hide the calendar.`
    },
    {
      class: 'String',
      name: 'date',
      expression: function(day, year, month) {
        if ( ! this.data ) {
          return this.SELECT_DATE;
        }
        return this.formatMonth(month.name) + ' ' + day + ' ' + year;
      }
    },
    {
      class: 'String',
      name: 'dateTime',
      expression: function(day, year, month, hour12, minute, period) {
        if ( ! this.data ) {
          return this.SELECT_DATE;
        }
        return this.formatMonth(month.name) + ' ' + day + ' ' + year + ', ' + hour12 + ':' + minute + ' ' + period;
      }
    },
    {
      class: 'String',
      name: 'icon',
      expression: function(isOpen_) {
        return this.data && isOpen_ ? '/images/cancel-round.svg' : '/images/calendar.svg';
      }
    }
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
      if ( ! this.mode ) {
        this.mode = foam.u2.DisplayMode.RW;
      }

      var self = this;
      this
      .start()
        .addClass(this.myClass())
        .start()
          .addClass('date-display-box')
          .enableClass('focus-border', this.isOpen_$)
          .call(function() {
            let display = self.showTimeOfDay ? self.dateTime$ : self.date$;
            this
              .start()
                .addClass('date-display-text')
                .add(display)
              .end()
              .start()
                .addClass('date-display-image').enableClass('date-display-image-cancel', self.slot(function(icon) {
                  return icon === '/images/cancel-round.svg';
                }))
                .start('img')
                  .attrs({ src: self.icon$ })
                  .on('click', self.clearDate)
                .end()
              .end();
          })
          .on('click', function() {
            if ( self.mode === foam.u2.DisplayMode.RW ) {
              self.isOpen_ = ! self.isOpen_;
            }
          })
        .end()

        .start()
          .addClass(this.myClass('overlay'))
          .show(this.isOpen_$)
          .on('click', this.onCancel)
        .end()

        .startContext({ data: this })
          .start()
            .show(this.isOpen_$)
            .addClass('date-time-picker')
            .start()
              .addClass('year')
              .start('img')
                .attrs({ src: '/images/arrow-left-white.svg' })
                .addClass('arrow-left')
                .on('click', this.updateDate)
                .on('click', function() { self.year--; })
              .end()
              .start(this.YEAR, {type: ''})
                .addClass('year-number')
              .end()
              .start('img')
                .attrs({ src: '/images/arrow-right-white.svg' })
                .addClass('arrow-right')
                .on('click', this.updateDate)
                .on('click', function() { self.year++; })
              .end()
            .end()

            .start()
              .addClass('month')
              .start()
                .addClass('arrow-container').addClass('arrow-container-left')
                .on('click', this.updateDate)
                .on('click', function() { self.monthIndex--; })
                .start('img')
                  .attrs({ src: '/images/arrow-left-black.svg' })
                  .addClass('arrow-black')
                .end()
              .end()
              .start()
                .add(this.monthName$)
                .addClass('month-name')
              .end()
              .start()
                .addClass('arrow-container').addClass('arrow-container-right')
                .on('click', this.updateDate)
                .on('click', function() { self.monthIndex++; })
                .start('img')
                  .attrs({ src: '/images/arrow-right-black.svg' })
                  .addClass('arrow-black')
                .end()
              .end()
            .end()

            .start()
              .addClass('calendar')
              .start(this.CalendarDatePicker, { data$: this.data$ }).end()
              .on('click', function() {
                if ( self.mode === foam.u2.DisplayMode.RW ) {
                  self.isOpen_ = ! self.isOpen_;
                }
              })
            .end()

            .start()
              .addClass('time-of-day')
              .show(this.showTimeOfDay$)
              .start(this.ChoiceView, {
                choices: zeroLeadingNumArray(1, 12),
                data$: this.hour12$
                })
                .on('click', this.updateDate)
                .addClass('time-of-day')
                .attrs({ size: 2, maxlength: 2 })
              .end().
              start()
                .add(':')
                .addClass('colon')
                .addClass('time-of-day')
              .end()
              .start(this.ChoiceView, {
                choices: zeroLeadingNumArray(0, 59),
                data$: this.minute$
                })
                .on('click', this.updateDate)
                .attrs({ size: 2, maxlength: 2 })
                .addClass('time-of-day')
              .end()
              .start()
                .add(this.PERIOD)
                .on('click', this.updateDate)
                .addClass('time-of-day')
              .end()
            .end()
          .end()
        .endContext()
      .end();
    },

    function formatMonth(month) {
      return month[0] + month.slice(1).toLowerCase();
    }
  ],

  listeners: [
    function onCancel() {
      this.isOpen_ = false;
    },

    function clearDate(event) {
      if ( this.icon === 'images/cancel-round.svg' ) {
        event.stopPropagation();
        this.data    = null;
        this.isOpen_ = false;
      }
    },

    function updateDate() {
      if ( ! this.data || this.data === undefined ) {
        this.data = new Date();
      }
    }
  ]
});
