foam.CLASS({
  package: 'demos',
  name: 'TestObject',
  topics: [
    {
      name: 'hello',
      topics: [
        'world'
      ]
    }
  ],
  methods: [
    {
      name: 'greet',
      args: [],
      returns: 'Promise',
      code: function() {
        return Promise.resolve("hello world");
     }
    },
    {
      name: 'greetUser',
      returns: 'Promise',
      args: [
        {
          name: 'user',
        }
      ],
      code: function(user) {
        return Promise.resolve("Hello " + user);
      }
    },
    {
      name: 'start',
      code: function() {
        setInterval(function() {
          this.pub('hello', 'world');
        }.bind(this), 1000);
      }
    }
  ]
});


foam.CLASS({
  package: 'demos',
  name: 'Person',
  ids: ['name'],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'phone'
    },
    {
      class: 'Int',
      name: 'age'
    }
  ]
});
