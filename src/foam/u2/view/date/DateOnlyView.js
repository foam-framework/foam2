foam.CLASS({
  package: 'foam.u2.view.date',
  name: 'DateOnlyView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing Date values.',

  css: '^:read-only { border: none; background: rgba(0,0,0,0); }',

  axioms: [
    { class: 'foam.u2.TextInputCSS' }
  ],

  properties: [
    [ 'placeholder', 'yyyy-mm-dd' ],
    {
      name: 'data',
      preSet: function(o, d) {
        var f = ! d || foam.core.DateOnly.isInstance(d);
        if ( ! f ) {
          this.__context__.warn('Set Input data to non-primitive:' + d);
          return o;
        }
        return d;
      }
    },
  ],

  listeners: [
    {
      name: 'onBlur',
      isFramed: true,
      code: function() {
        if ( ! this.el() ) return;
        this.el().value = this.dataToInput(this.data);
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.setAttribute('type', 'date');
      this.setAttribute('placeholder', 'yyyy-mm-dd');
      this.on('blur', this.onBlur);
    },

    function link() {
      this.data$.relateTo(
        this.attrSlot(null, this.onKey ? 'input' : null),
        (d) => this.dataToInput(d),
        (d) => this.inputToData(d)
      );
    },

    function inputToData(input) {
      if ( ! input ) return input;
      let date = input.split('-');

      return foam.core.DateOnly.create({
        year: parseInt(date[0]),
        month: parseInt(date[1]),
        day: parseInt(date[2])
      });
    },

    function dataToInput(data) {
      if ( ! data ) return data;
      let year = data.year;
      let month = data.month.toString().length == 1 ? '0' + data.month : data.month;
      let day = data.day.toString().length == 1 ? '0' + data.day : data.day;
      return `${year}-${month}-${day}`;
    }
  ]
});
