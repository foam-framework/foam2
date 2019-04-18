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

        ^ .date-time-picker {
          display: inline-block;
          width: 333px;
          min-height: 304px;
          text-align: center;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.16);
          border: solid 1px #cbcfd4;
          background-color: #ffffff;
          padding-bottom: 25px;
          z-index: 10001;
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
          background-color: #406dea;
          color: #ffffff;
          display: inline-block;
          align-items: center;
          height: 47px;
          width: 333px;
          text-align: center;
        }

        ^ .year-number {
          margin-left: 100px;
          margin-right: 100px;
          display: inline-block;
          padding-top: 15px;
        }

        ^ .arrow-left {
          margin-top: 15px;
          margin-left: 30px;
        }

        ^ .arrow-right {
          margin-top: 15px;
          margin-right: 30px;
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
        }

        ^ .arrow-container-left{
          margin-left: 25px;
          float: left;
        }

        ^ .arrow-container-right{
          margin-right: 25px;
          float:right;
        }

        ^ .arrow-black {
          padding-top: 6px;
        }

        ^ .calendar {
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
          border: 1px solid #406dea;
          border-radius: 3px;
        }

        ^ .date-display-text {
          display: inline-block;
          color: #9ba1a6;
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
        }
        ^ {
          position: relative;
        }
      */}
    })
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
          return 'mm dd yyyy';
        }
        return this.formatMonth(month.name) + ' ' + day + ' ' + year;
      }
    },
    {
      class: 'String',
      name: 'dateTime',
      expression: function(day, year, month, hour12, minute, period) {
        if ( ! this.data ) {
          return 'mm dd yyyy --:-- --';
        }
        return this.formatMonth(month.name) + ' ' + day + ' ' + year + ', ' + hour12 + ':' + minute + ' ' + period;
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
          .call(function() {
            let display = self.showTimeOfDay ? self.dateTime$ : self.date$;
            this
              .start()
                .addClass('date-display-text')
                .add(display)
              .end()
              .start()
                .addClass('date-display-image')
                .start('img')
                  .attrs({ src: 'images/cancel-round.svg' })
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
                .attrs({ src: 'images/arrow-left-white.svg' })
                .addClass('arrow-left')
                .on('click', this.updateDate)
                .on('click', function() { self.year--; })
              .end()
              .start()
                .add(this.year$).addClass('year-number')
              .end()
              .start('img')
                .attrs({ src: 'images/arrow-right-white.svg' })
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
                  .attrs({ src: 'images/arrow-left-black.svg' })
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
                  .attrs({ src: 'images/arrow-right-black.svg' })
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
      event.stopPropagation();
      this.data = null;
    },

    function updateDate() {
      if ( ! this.data || this.data === undefined ) {
        this.data = new Date();
      }
    }
  ]
});