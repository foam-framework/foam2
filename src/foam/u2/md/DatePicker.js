/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'DatePicker',

  extends: 'foam.u2.View',

  requires: [
    'foam.input.touch.GestureTarget',
    'foam.u2.md.Calendar'
  ],

  imports: [
    'popup',
    'window'
  ],

  exports: [
    'MONTH_NAMES'
  ],

  documentation: `A Material Design date picker widget. Intended to be shown
    inside a $$DOC{ref:"foam.u2.Dialog"} by a
    $$DOC{ref:"foam.u2.md.DateField"}. Requires a $$DOC{ref:"foam.input.touch.GestureManager"}!`,

  constants: {
    // TODO(braden): i18n. The whole business of calendars and dates is a deep
    // well of i18n problems.
    DAY_NAMES: [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat'
    ],

    MONTH_NAMES: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
  },

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) { this.softData = nu; },
      factory: function() { return new Date(); }
    },
    {
      name: 'softData',
      factory: function() { return new Date(); },
      adapt: function(old, nu) {
        if (typeof nu === 'string') return new Date(nu);
        if ( ! nu ) return new Date();
        return nu;
      },
      postSet: function(old, nu) {
        this.year  = nu.getFullYear();
        this.month = nu.getMonth();
        this.date  = nu.getDate();
        this.day   = nu.getDay();
      }
    },
    {
      name: 'years',
      factory: function() {
        var years = [];
        for ( var i = 1900 ; i <= 2100 ; i++ ) {
          years.push(i);
        }
        return years;
      }
    },
    {
      name: 'year',
      documentation: 'The real, currently selected year.'
    },
    {
      name: 'month',
      documentation: 'The real, currently selected month (0-based).'
    },
    {
      name: 'date',
      documentation: 'The real, currently selected date.'
    },
    {
      name: 'day',
      documentation: 'The real, currently selected day of the week (0=Sunday).'
    },
    {
      name: 'viewYear',
      documentation: 'The year currently being viewed.',
      factory: function() { return this.year; },
      postSet: function(old, nu) {
        if (old !== nu) this.reconstructCalendars();
      }
    },
    {
      name: 'viewMonth',
      documentation: 'The month currently being viewed (0-based).',
      factory: function() { return this.month; },
      postSet: function(old, nu) {
        if ( old !== nu ) this.reconstructCalendars();
      }
    },
    {
      name: 'leftYear',
      documentation: 'The year currently being viewed by the left-hand swipe.',
      getter: function() { return this.leftMonth === 11 ? this.viewYear - 1 : this.viewYear; }
    },
    {
      name: 'leftMonth',
      documentation: 'The month currently being viewed (0-based).',
      getter: function() { return Math.max(0, this.viewMonth - 1); }
    },
    {
      name: 'rightYear',
      documentation: 'The year currently being viewed.',
      getter: function() { return this.rightMonth === 0 ? this.viewYear + 1 : this.viewYear; }
    },
    {
      name: 'rightMonth',
      documentation: 'The month currently being viewed (0-based).',
      defaultValueFn: function() {
        var m = this.viewMonth + 1;
        if ( m > 11 ) m = 0;
        return m;
      }
    },
    {
      name: 'sliderE'
    },
    {
      name: 'innerE'
    },
    {
      name: 'width',
      documentation: 'The width of the outermost element.',
      defaultValue: 300
    },
    {
      name: 'xPos',
      documentation: 'X coordinate of the translation currently',
      hidden: true,
      transient: true,
      postSet: function(old, nu) {
        this.adjustX(nu);
      }
    },
    {
      name: 'swipeGesture',
      factory: function() {
        return this.GestureTarget.create({
          containerID: this.bodyE.id,
          handler: this,
          gesture: 'horizontalScroll'
        });
      }
    },
    {
      name: 'calendarViews_',
      factory: function() { return []; }
    },
    {
      type: 'Boolean',
      name: 'showYears_',
      defaultValue: false
    },
    {
      name: 'titleE',
      documentation: 'Element for the header portion, used by the Dialog.',
      factory: function() {
        var header = this.E()
            .addClass(this.myClass('header'))
            .addClass('foam-u2-md-toolbar-colors');
        header.start()
            .addClass(this.myClass('header-year'))
            .enableClass(this.myClass('selected'), this.showYears_$)
            .add(this.year$)
            .end();

        header.start()
            .addClass(this.myClass('header-date'))
            .enableClass(this.myClass('selected'), this.showYears_$, true /* negate */)
            .add(this.slot(function(day, month, date) {
              return this.DAY_NAMES[day] + ', ' + this.MONTH_NAMES[month] +
                ' ' + date;
            }.bind(this), this.day$, this.month$, this.date$))
            .end();

        header.on('click', this.headerClick);
        return header;
      }
    },
    {
      name: 'bodyE',
      documentation: 'Element for the body portion, used by the Dialog.',
      factory: function() {
        var body = this.E().addClass(this.myClass('body'));
        body.startContext({data: this}).start('span')
          .addClass(this.myClass('switcher'))
          .addClass(this.myClass('switcher-left'))
          .add(this.LEFT)
        .end();
        body.start('span')
          .addClass(this.myClass('switcher'))
          .addClass(this.myClass('switcher-right'))
          .add(this.RIGHT)
        .end();

        this.sliderE = body.start()
          .addClass(this.myClass('slider'))
          .style({
            transform: this.slot(function(x) {
              return 'translate3d(-' + x + 'px, 0, 0)';
            }, this.xPos$)
          });

        this.innerE = this.sliderE.start().addClass(this.myClass('slider-inner'));
        this.innerE.end();
        this.sliderE.end();

        // TODO: use show()
        body.enableClass(this.myClass('hidden'), this.showYears_$);

        var years = this.E().addClass(this.myCls('years'));
        for ( var i = 1900 ; i <= 2100 ; i++ ) {
          years.start('span')
            .setID(this.id + '-year-' + i)
            .addClass(this.myCls('years-year'))
            .add('' + i)
            .enableClass(this.myCls('selected'), this.slot(function(index, viewYear) {
              return index === viewYear;
            }.bind(this, i), this.viewYear$))
            .on('click', this.pickYear.bind(this, i))
          .end();
        }

        // TODO: use show()
        years.enableClass(this.myCls('hidden'), this.showYears_$, true /* negate */);

        return [body, years];
      }
    }
  ],

  listeners: [
    {
      name: 'adjustX',
      isFramed: true,
      code: function() { this.rawAdjustX(this.xPos); }
    },
    {
      name: 'horizontalScrollMove',
      code: function(dx, tx) {
        var x = this.width - tx;
        if ( x < 0 ) x = 0;
        if ( x > 2 * this.width ) x = 2 * this.width;
        this.xPos = x;
      }
    },
    {
      name: 'horizontalScrollEnd',
      code: function(dx, tx, x) {
        var adj = 0;

        if ( Math.abs(tx) > this.width / 3 ) {
          // > 1/3 of a width is sufficient to snap.
          if ( tx > 0 ) {
            adj = -1;
          } else {
            adj = 1;
          }
        }
        this.snapToView(adj);
      }
    },
    {
      name: 'reconstructCalendars',
      isFramed: true,
      documentation: 'Called whenever viewMonth changes. Centers a calendar ' +
          'for the currently viewed month, and creates the adjacent months.',
      code: function() {
        var newCals = [
          this.Calendar.create({ data$: this.softData$, year: this.leftYear, month: this.leftMonth }),
          this.Calendar.create({ data$: this.softData$, year: this.viewYear, month: this.viewMonth }),
          this.Calendar.create({ data$: this.softData$, year: this.rightYear, month: this.rightMonth })
        ];
        // TODO(braden): Setting this.xPos here should be sufficient, but it
        // causes jank. The postSet on xPos calls adjustX, which is framed like
        // this function is. That means that the calendars render, and then the
        // frame after they are moved. This workaround results in rawAdjustX
        // getting called twice, but that's not a big problem.
        this.xPos = this.width;
        this.rawAdjustX(this.width);
        for ( i = 0 ; i < 3 ; i++ ) {
          if (this.calendarViews_[i]) {
            this.innerE.replaceChild(newCals[i], this.calendarViews_[i]);
          } else {
            this.innerE.add(newCals[i]);
          }
          this.calendarViews_[i] = newCals[i];
        }
      }
    },
    {
      name: 'headerClick',
      isFramed: true,
      documentatin: 'Called to flip the mode from calendar view to years view.',
      code: function() {
        this.showYears_ = ! this.showYears_;
        if ( this.showYears_ ) this.scrollToYear();
      }
    },
    {
      name: 'scrollToYear',
      isFramed: true,
      code: function() {
        // Since scrollIntoView() puts it at the top, we actually want to scroll
        // three years earlier to the top. Clamp to 1900.
        var targetYear = Math.max(1900, this.viewYear - 3);
        var e = this.getElementById(this.id + '-year-' + targetYear);
        if ( e ) e.scrollIntoView();
      }
    },
    {
      name: 'pickYear',
      code: function(year) {
        this.year       = this.viewYear = year;
        this.softData   = new Date(this.year, this.month, this.date, this.softData.getHours(), this.softData.getMinutes());
        this.showYears_ = false;
      }
    },
  ],

  methods: [
    function snapToView(adj) {
      // Animates a slide to the view in question, and then adjusts the views
      // behind the scenes.
      // First we compute the new target X coordinate, month and year.
      var month   = this.viewMonth;
      var year    = this.viewYear;
      var targetX = this.width;

      if ( adj < 0 ) {
        month--;
        if ( month < 0 ) {
          month = 11;
          year--;
        }
        targetX = 0;
      } else if ( adj > 0 ) {
        month++;
        if ( month > 11 ) {
          month = 0;
          year++;
        }
        targetX = this.width * 2;
      }

      var time = 300 * (Math.abs(targetX - this.xPos) / this.width);
      var self = this;
      // TODO:
      // this.animate(time, function(evt) { self.xPos = targetX; },
      //    Movement.ease(0.8, 0.4),
      //    function() {
            self.viewYear  = year;
            self.viewMonth = month;
      //    })();
    },

    function rawAdjustX(x) {
      var str = 'translate3d(-' + x + 'px, 0, 0)';
      this.sliderE.style({ transform: str });
    }
  ],

  actions: [
    {
      name: 'cancel',
      label: 'CANCEL',
      code: function() { this.popup.close(); }
    },
    {
      name: 'ok',
      label: 'OK',
      code: function() {
        this.data = this.softData;
        this.popup.close();
      }
    },
    {
      name: 'left',
      label: '<',
      code: function() { this.snapToView(-1); }
    },
    {
      name: 'right',
      label: '>',
      code: function() { this.snapToView(1); }
    }
  ],

  css: `
    ^hidden {
      display: none !important;
    }

    ^header {
      cursor: pointer;
      font-size: 16px;
      padding: 12px 16px;
    }
    ^header div {
      opacity: 0.8;
    }
    ^header div^selected {
      opacity: 1;
    }
    ^header-year {
      margin: 8px 0;
    }
    ^header-date {
      font-size: 24px;
      font-weight: bolder;
    }

    ^body {
      cursor: pointer;
      font-size: 16px;
      height: 310px;
      overflow: hidden;
      position: relative;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      width: 300px;
    }
    ^slider {
      position: absolute;
      height: 100%;
      top: 0;
      width: 900px;
    }
    ^slider-inner {
      display: flex;
      height: 100%;
      position: relative;
      width: 100%;
    }

    ^switcher {
      align-items: center;
      display: flex;
      height: 48px;
      position: absolute;
      z-index: 3;
    }
    ^switcher-left {
      left: 0;
    }
    ^switcher-right {
      right: 0;
    }

    ^years {
      align-items: center;
      display: flex;
      flex-direction: column;
      height: 310px;
      overflow-y: scroll;
      width: 300px;
    }
    ^years-year {
      flex-shrink: 0;
      padding: 16px;
    }
    ^years-year^selected {
      color: #3e50b4;
      font-size: 24px;
      font-weight: bold;
    }
  `
});
