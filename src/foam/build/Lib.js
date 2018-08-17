foam.CLASS({
  package: 'foam.build',
  name: 'Lib',
  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      name: 'flags',
      expression: function(json) {
        return json.flags || null;
      },
    },
    'json'
  ],
});
