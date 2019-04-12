foam.CLASS({
  package: 'foam.u2.view.date',
  name: 'CalendarDatePicker',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.view.date.Weekday'
  ],
  properties: [
    {
      class: 'Date',
      name: 'data',
      value: new Date()
    },
    {
      name: 'nodeName',
      value: 'table'
    }
  ],
  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^selected_day_cell {
          background-color: #e5f1fc;
        }
        ^prev_month_cell, ^next_month_cell {
          color: lightgray !important;
        }
        ^calendar_table td {
          text-align: center;
        }
        ^calendar_table th {
          cursor: default;
        }
        ^calendar_table td {
          cursor: pointer;
        }

        ^calendar_table td:hover {
          background-color: gray;
        }

        ^calendar_table tr > td {
          border:1px solid #cbcfd4;
          color: #5e6061;
          padding: 6px 7px 6px 7px;
        }

        ^calendar_table  {
          border-collapse: collapse;
          width: 224px;
          height: 160px;
        }

        ^calendar_table tbody > tr > th {
          font-size: 10px;
          color: #5e6061;
        }
      */}
    })
  ],
  methods: [
    function daysInMonth(month, year) {
      var d = new Date();
      d.setYear(year);
      d.setMonth(month+1);
      d.setDate(0);
      return d.getDate();
    },
    function startingWeekday(month, year) {
      var d = new Date();
      d.setYear(year);
      d.setMonth(month);
      d.setDate(1);
      return d.getDay();
    },
    function weeksOfMonth(month, year) {
      var weeks = [[]];
      var curWeekday = this.startingWeekday(month, year);
      var curDay = 1;
      var daysInMonth = this.daysInMonth(month, year);
      while ( curDay <= daysInMonth ) {
        weeks[weeks.length-1][curWeekday] = curDay;
        curDay++;
        curWeekday = (curWeekday+1) % this.Weekday.VALUES.length;
        if ( curWeekday == 0 && curDay <= daysInMonth ) weeks.push([]);
      }
      return weeks;
    },
    function initE() {
      var self = this;
      this.startContext({data: this}).
        addClass(this.myClass('calendar_table')).
        add(this.slot(function(data) {
          var month = data.getMonth();
          var year = data.getYear() + 1900;

          var prevMonthLastWeek = self.weeksOfMonth(month-1, year).pop()
            .map(function(day) {
              return self.E('td').
                add(day).
                on('click', function() {
                  var d = new Date(data);
                  d.setDate(1);
                  d.setMonth(d.getMonth()-1);
                  d.setDate(day);
                  self.data = d;
                }).
                addClass(self.myClass('prev_month_cell'));
            });

          var curMonthWeeks = self.weeksOfMonth(month, year)
            .map(function(week) {
              return week.map(function(day) {
                return self.E('td').
                  add(day).
                  on('click', function() {
                    var d = new Date(data);
                    d.setDate(day);
                    self.data = d;
                  }).
                  addClass(day == self.data.getDate() ? self.myClass('selected_day_cell') : '').
                  addClass(self.myClass('cur_month_cell'));
              });
            });

          var nextMonthFirstWeek = self.weeksOfMonth(month+1, year).shift()
            .map(function(day) {
              return self.E('td').
                add(day).
                on('click', function() {
                  var d = new Date(data);
                  d.setDate(1);
                  d.setMonth(d.getMonth()+1);
                  d.setDate(day);
                  self.data = d;
                }).
                addClass(self.myClass('next_month_cell'));
            }).filter(function(d) { return d; });

          if ( prevMonthLastWeek.length < 7 ) {
            prevMonthLastWeek = prevMonthLastWeek.concat(curMonthWeeks.shift());
          }
          if ( nextMonthFirstWeek.length < 7 ) {
            nextMonthFirstWeek = curMonthWeeks.pop().concat(nextMonthFirstWeek);
          }

          var weeks = [].concat([prevMonthLastWeek], curMonthWeeks, [nextMonthFirstWeek]);

          return this.E('tbody').
              start('tr').
                forEach(self.Weekday.VALUES, function(wd) {
                  this.start('th').add(wd.name).end();
                }).
              end().
              forEach(weeks, function(w) {
                this.
                  start('tr').
                    forEach(w, function(wd) {
                      this.add(wd);
                    }).
                  end();
              });
        })).
      endContext();
    }
  ]
});