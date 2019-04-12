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
          padding-top: 15px;
          padding-left: 30px;
        }

        ^ .arrow-right {
          padding-top: 15px;
          padding-right: 30px;
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
          margin-left: 54px;
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
      expression: function(monthIndex) {
        return this.Month.VALUES[monthIndex].label + ' ' + this.year;
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

      var self = this;
      this
      .start()
        .addClass(this.myClass())
        .startContext({ data: this })
          .start()
            .addClass('date-time-picker')

            .start()
              .addClass('year')
              .start('img')
                .attrs({ src: '/src/foam/u2/images/arrow-left-white.svg' })
                .addClass('arrow-left')
                .on('click', function() { self.year--; })
              .end()
              .start()
                .add(this.year$).addClass('year-number')
              .end()
              .start('img')
                .attrs({ src: '/src/foam/u2/images/arrow-right-white.svg' })
                .addClass('arrow-right')
                .on('click', function() { self.year++; })
              .end()
            .end()

            .start()
              .addClass('month')
              .start()
                .addClass('arrow-container').addClass('arrow-container-left')
                .start('img')
                  .attrs({ src: '/src/foam/u2/images/arrow-left-black.svg' })
                  .addClass('arrow-black')
                  .on('click', function() { self.monthIndex--; })
                .end()
              .end()
              .start()
                .add(this.monthName$)
                .addClass('month-name')
              .end()
              .start()
                .addClass('arrow-container').addClass('arrow-container-right')
                .start('img')
                  .attrs({ src: '/src/foam/u2/images/arrow-right-black.svg' })
                  .addClass('arrow-black')
                  .on('click', function() { self.monthIndex++; })
                .end()
              .end()
            .end()

            .start()
              .addClass('calendar')
              .start(this.CalendarDatePicker, { data$: this.data$ }).end()
            .end()

            .start()
              .addClass('time-of-day')
              .show(this.showTimeOfDay$)
              .tag(this.NOON, { data: this })
              .start(this.ChoiceView, {
                choices: zeroLeadingNumArray(1, 12),
                data$: this.hour12$
              })
                .attrs({ size: 2, maxlength: 2 })
              .end().
              start()
                .add(':')
                .addClass('colon')
              .end()
              .start(this.ChoiceView, {
                choices: zeroLeadingNumArray(0, 59),
                data$: this.minute$
              })
                .attrs({ size: 2, maxlength: 2 })
              .end()
              .add(this.PERIOD)
          .end()
        .endContext()
      .end();
    }
  ]
});