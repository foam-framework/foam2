/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'Calendar',
  extends: 'foam.u2.View',

  imports: [
    'MONTH_NAMES',
    'document'
  ],

  documentation: `A view for a calendar month. Not intended to be used
    directly! This is a subcomponent of DateField and DatePicker.
    Expects as its $$DOC{ref:".data"} a Javascript Date object for the
    currently selected day. Uses local time, not UTC.`,

  properties: [
    {
      name: 'data',
      adapt: function(old, nu) {
        if ( typeof nu === 'string' ) return new Date(nu);
        return nu;
      }
    },
    {
      name: 'day',
      expression: function() {
        return this.data && this.data.getDate();
      }
    },
    {
      name: 'month',
      expression: function() {
        return this.data.getMonth();
      }
    },
    {
      name: 'year',
      expression: function() {
        return this.data.getFullYear();
      }
    },
    {
      name: 'hour',
      expression: function() {
        return this.data.getHours();
      }
    },
    {
      name: 'minute',
      expression: function() {
        return this.data.getMinutes();
      }
    },
    {
      name: 'preferredWidth',
      defaultValue: 300
    }
  ],

  methods: [
    function isToday(day) {
      var today = new Date();
      return this.month === today.getMonth() &&
          this.year === today.getFullYear() &&
          day === today.getDate();
    },
    function isSelected(day) {
      if ( ! this.data ) return false;
      return this.month === this.data.getMonth() &&
          this.year === this.data.getFullYear() &&
          day === this.data.getDate();
    },
    function initE() {
      this.addClass(this.myClass());

      this.start()
          .addClass(this.myClass('heading'))
          .start('span')
              .addClass(this.myClass('heading-month'))
              .add(this.MONTH_NAMES[this.month] + ' ' + this.year)
              .end()
          .end();

      var table = this.start()
          .addClass(this.myClass('body'))
          .start('table');

      table.addClass(this.myClass('table'));
      table.start('tr')
          .start('th').add('S').end()
          .start('th').add('M').end()
          .start('th').add('T').end()
          .start('th').add('W').end()
          .start('th').add('T').end()
          .start('th').add('F').end()
          .start('th').add('S').end()
          .end();

      var firstDay = new Date(this.year, this.month, 1).getDay();
      for ( var row = 0 ; row < 6 ; row++ ) {
        var tr = table.start('tr');
        for ( var col = 0 ; col < 7 ; col++ ) {
          if ( row === 0 && col < firstDay ) {
            tr.start('td').end();
          } else {
            var day = row * 7 + (col - firstDay) + 1;
            var testDate = new Date(this.year, this.month, day, this.hour, this.minute);
            if ( testDate.getMonth() != this.month ) {
              tr.start('td').end();
            } else {
              tr.start('td')
                  // HACK: We put the toolbar colors on every td, then hide it
                  // on most. See the CSS rules for ^selected.
                  .addClass('foam-u2-md-toolbar-colors')
                  .addClass(this.slot(function(day) {
                    return this.isSelected(day) ? this.myClass('selected') :
                        this.isToday(day) ? this.myClass('today') : '';
                  }.bind(this, day), this.data$))
                  .add(day)
                  .end();
            }
          }
        }
        tr.end();
      }

      table.on('click', this.onClick);

      // End the table and the containing body.
      table.end().end();
    }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function(e) {
//         var point = e.pointMap[Object.keys(e.pointMap)[0]];
//        var element = this.document.elementFromPoint(point.x, point.y);
var element = e.target;
        if ( element && element.tagName === 'TD' ) {
          var newDay = element.innerText;
          this.data = new Date(this.year, this.month, newDay, this.hour, this.minute);
        }
      }
    }
  ],

  css: `
    ^ {
      height: 310px;
      width: 300px;
    }
    ^heading {
      align-items: center;
      display: flex;
      font-size: 14px;
      height: 48px;
      justify-content: center;
    }

    ^body {
      display: flex;
      justify-content: center;
    }

    ^table {
      font-size: 12px;
    }
    ^table th {
      color: #999;
      font-weight: normal;
      text-align: center;
    }
    ^table td {
      height: 40px;
      text-align: center;
      width: 38px;
    }

    ^ td^selected {
      border-radius: 50%;
    }
    ^ td:not(^selected) {
      background-color: inherit;
      color: inherit;
    }

    ^today {
      color: #4285f4;
      font-weight: bolder;
    }
  `
});
