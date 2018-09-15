foam.CLASS({
  package: 'foam.json2',
  name: 'DoubleToSingleQuoteReplaceOutputter',
  extends: 'foam.json2.ProxyOutputterOutput',
  methods: [
    {
      name: 'out',
      code: function(s) {
        var match = s.match && s.match(/^"(.+)"$/);
        if ( match ) {
          s = "'" + match[1]
              .replace(/\\"/g, '"')
              .replace(/'/g, "\\'") + "'"
        }
        this.delegate.out(s);
      },
    },
  ],
})
