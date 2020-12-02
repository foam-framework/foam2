/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view.date',
  name: 'AbstractDateView',
  extends: 'foam.u2.View',
  properties: [
    {
      class: 'DateTime',
      name: 'data',
    },
    {
      class: 'Int',
      name: 'year',
      expression: function(data) {
        if ( ! data || isNaN(data.getYear()) ) {
          return new Date().getYear() + 1900;
        }
        return data.getYear() + 1900;
      },
      preSet: function(old, nu) {
        var regex = /^\d{4}$/;
        if ( regex.test(nu) ) return nu;
        return old;
      },
      postSet: function(_, n) {
        var d = new Date(this.data);
        d.setYear(n);
        this.data = d;
        this.year = undefined;
      }
    },
    {
      class: 'Int',
      name: 'monthIndex',
      expression: function(data) {
        if ( ! data || isNaN(data.getMonth()) ) {
          return new Date().getMonth();
        }
        return data.getMonth();
      },
      postSet: function(_, n) {
        var d = new Date(this.data);
        d.setMonth(n);
        this.data = d;
        this.monthIndex = undefined;
      }
    },
    {
      class: 'Enum',
      of: 'foam.u2.view.date.Month',
      name: 'month',
      expression: function(monthIndex) {
        return this.Month.VALUES[monthIndex % this.Month.VALUES.length];
      },
      postSet: function(_, n) {
        this.monthIndex = n.ordinal;
        this.month = undefined;
      }
    },
    {
      class: 'Int',
      name: 'day',
      expression: function(data) {
        if ( ! data || isNaN(data.getDate()) ) {
          return new Date().getDate();
        }
        return data.getDate();
      },
      postSet: function(_, n) {
        var d = new Date(this.data);
        d.setDate(n);
        this.data = d;
        this.day = undefined;
      }
    },
    {
      name: 'hour24',
      expression: function(data) {
        if ( ! data || isNaN(data.getDate()) ) {
          return new Date().getHours();
        }
        return data.getHours();
      },
      postSet: function(_, n) {
        var d = new Date(this.data);
        d.setHours(n);
        this.data = d;
        this.hour24 = undefined;
      }
    },
    {
      name: 'hour12',
      expression: function(hour24) {
        var h = (hour24 % 12) || 12;
        return (h < 10 ? '0' : '') + h;
      },
      preSet: function(_, n) {
        return parseInt(n) % 12;
      },
      postSet: function(_, n) {
        this.hour24 = n + (this.period == 'pm' ? 12 : 0);
        this.hour12 = undefined;
      }
    },
    {
      name: 'minute',
      expression: function(data) {
        var m;
        if ( ! data || isNaN(data.getDate()) ) {
          m = new Date().getMinutes();
        } else { 
          m = data.getMinutes();
        }
        return (m < 10 ? '0' : '') + m;
      },
      postSet: function(_, n) {
        var d = new Date(this.data);
        d.setMinutes(n);
        this.data = d;
        this.minute = undefined;
      }
    },
    {
      name: 'second',
      expression: function(data) {
        if ( ! data || isNaN(data.getDate()) ) {
          return new Date().getSeconds();
        }
        return data.getSeconds();
      },
      postSet: function(_, n) {
        var d = new Date(this.data);
        d.setSeconds(n);
        this.data = d;
        this.second = undefined;
      }
    },
    {
      name: 'period',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: ['am', 'pm']
      },
      expression: function(hour24) {
        return hour24 >= 12 ? 'pm' : 'am';
      },
      postSet: function(_, n) {
        this.hour24 = this.hour24 +
          (n == 'am' ? -12 : 12);
        this.period = undefined;
      }
    }
  ],
  actions: [
    {
      name: 'noon',
      code: function() {
        this.hour24 = 12;
        this.minute = 0;
        this.second = 0;
      }
    }
  ]
});
