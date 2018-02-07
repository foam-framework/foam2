foam.CLASS({
  package: 'foam.json2',
  name: 'Test',
  requires: [
    'foam.test.AllProperties'
  ],
  methods: [
    function init() {
      var o1 = this.AllProperties.create({
        str: 'str',
        n: 12,
        function: function(asdfasdf) { console.log("arg is:", asdfasdf); }
      });

      var o2 = foam.json2.Deserializer.create({ parseFunctions: true }).aparseString(
        foam.__context__,
        foam.json2.Serializer.create().stringify(
          foam.__context__,
          o1));

      console.log("o1 equals o2?", o1.equals(o2));

      if ( ! o1.equals(o2) ) {
        console.log("Diff:", o1.diff(o2));
      }

      o2.function("foo");

      var m1 = this.AllProperties.model_;

      var m2 = foam.json2.Deserializer.create({ parseFunctions: true }).aparseString(
        foam.__context__,
        foam.json2.Serializer.create().stringify(
          foam.__context__,
          m1));

      console.log("m1 equals m2?", m1.equals(m2));

      if ( ! m1.equals(m2) ) {
        console.log("Diff:", m1.diff(m2));
      }
    }
  ]
});
