foam.CLASS({
  package: 'foam.u2',
  name: 'DateDropdownView',
  extends: 'foam.u2.View',
  properties: [
    {
      class: 'String',
      name: 'day',
      width: 2,
      minLength: 1,
    },
    {
      class: 'Int',
      name: 'month',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          '',
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
          'December',
        ].map((m, i) => [i, m]),
      },
    },
    {
      class: 'String',
      name: 'year',
      width: 4,
      minLength: 4,
    },
  ],
  css: `
    ^ {
      display: flex;
    }
    ^label {
      text-align: center;
    }
    ^ select {
      height: 44px;
    }
  `,
  methods: [
    function initE() {
      this.SUPER();
      this.startContext({ data: this })
        .addClass(this.myClass())
        .start('div')
        .start(this.MONTH)
        .end()
        .start()
        .addClass(this.myClass('label'))
        .add(this.MONTH.label)
        .end()
        .end()
        .start('div')
        .start(this.DAY)
        .attrs({ maxlength: 2 })
        .end()
        .start()
        .addClass(this.myClass('label'))
        .add(this.DAY.label)
        .end()
        .end()
        .start('div')
        .start(this.YEAR)
        .attrs({ maxlength: 4 })
        .end()
        .start()
        .addClass(this.myClass('label'))
        .add(this.YEAR.label)
        .end()
        .end()
        .endContext();

      let dateFromProps = () => {
        if (!/^\d{4}$/.exec(this.year)) return null;

        if (!/^\d{1,2}$/.exec(this.month)) return null;
        month = (this.month + '').padStart(2, '0');

        if (!/^\d{1,2}$/.exec(this.day)) return null;
        day = this.day.padStart(2, '0');

        let d = new Date([this.year, month, day].join('-'));
        return isNaN(d) ? null : d;
      };
      this.onDetach(
        this.data$.relateTo(
          this.year$,
          (date) => (date ? date.getUTCFullYear() + '' : this.year),
          dateFromProps,
        ),
      );
      this.onDetach(
        this.data$.relateTo(
          this.month$,
          (date) => (date ? date.getUTCMonth() + 1 : this.month),
          dateFromProps,
        ),
      );
      this.onDetach(
        this.data$.relateTo(
          this.day$,
          (date) => (date ? date.getUTCDate() + '' : this.day),
          dateFromProps,
        ),
      );
    },
  ],
});
