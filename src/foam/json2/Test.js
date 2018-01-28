foam.CLASS({
  package: 'foam.json2',
  name: 'Test',
  methods: [
    function init() {
      foam.CLASS({
        name: 'AllProperties',
        properties: [
          {
            class: 'String',
            name: 'str'
          },
          {
            class: 'Int',
            name: 'n'
          }
        ]
      });

      var o1 = AllProperties.create({
        str: 'str',
        n: 12
      });

      var o2 = foam.json2.Deserializer.create().aparseString(
        foam.__context__,
        foam.json2.Serializer.create().stringify(
          foam.__context__,
          o1));

      console.log("o1 equals o2?", o1.equals(o2));

      if ( ! o1.equals(o2) ) {
        console.log("Diff:", JSON.stringify(o1.diff(o2)));
      }

      var m1 = AllProperties.model_;

      var m2 = foam.json2.Deserializer.create().aparseString(
        foam.__context__,
        foam.json2.Serializer.create().stringify(
          foam.__context__,
          m1));

      console.log("m1 equals m2?", m1.equals(m2));

      if ( ! m1.equals(m2) ) {
        console.log("Diff:", JSON.stringify(m1.diff(m2)));
      }
    }
  ]
});
