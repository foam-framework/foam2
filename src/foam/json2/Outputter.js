foam.CLASS({
  package: 'foam.json2',
  name: 'Outputter',
  properties: [
    {
      class: 'String',
      name: 'str'
    },
    {
      name: 'state',
      factory: function() {
        return [
          {}
          ];
      }
    }
  ],
  methods: [
    function obj() {
      this.e();
      this.str += '{';
      this.state.push({
        end: '}',
        comma: false
      });
      return this;
    },
    function array() {
      this.e();
      this.str += '[';
      this.state.push({
        end: ']',
        array: true,
        comma: false
      });
      return this;
    },
    function top() {
      return this.state[this.state.length - 1];
    },
    function key(s) {
      if ( this.top().comma ) this.str += ',';
      else this.top().comma = true;

      this.str += this.string(s);
      this.str += ':';

      return this;
    },
    function e() {
      if ( this.top().array ) {
        if ( this.top().comma ) this.str += ',';
        this.top().comma = true;
      }
    },
    function string(s) {
      return '"' + s.
        replace(/\\/g, '\\\\').
        replace(/"/g, '\\"').
        replace(/[\x00-\x1f]/g, function(c) {
          return "\\u00" + ((c.charCodeAt(0) < 0x10) ?
                            '0' + c.charCodeAt(0).toString(16) :
                            c.charCodeAt(0).toString(16));
        }) + '"';
    },
    function s(s) {
      this.e();
      this.str += this.string(s);
      return this;
    },
    function n(n) {
      this.e();
      this.str += n;
      return this;
    },
    function b(b) {
      this.e();
      this.str += b;
      return this;
    },
    function nul() {
      this.e();
      this.str += 'null';
      return this;
    },
    function end() {
      var s = this.state.pop();
      this.str += s.end;
      return this;
    }
  ]
});
