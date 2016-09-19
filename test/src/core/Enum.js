describe('Enum tests', function() {
  it('Basic enum', function() {
    foam.ENUM({
      name: 'TodoStatus',
      properties: [
        {
          class: 'Boolean',
          name: 'isOpen',
          value: true
        }
      ],
      methods: [
        function hello() {
          return 'hello ' + this.label;
        }
      ],

      values: [
        {
          name: 'OPEN',
          label: 'Open'
        },
        {
          ordinal: 100,
          name: 'CLOSED',
          label: 'Closed',
          isOpen: false
        },
        {
          name: 'ASSIGNED',
          label: 'Assigned'
        }
      ]
    });

    foam.CLASS({
      name: 'Todo',
      properties: [
        {
          class: 'String',
          name: 'assignee'
        },
        {
          class: 'Enum',
          name: 'status',
          of: 'TodoStatus',
          value: TodoStatus.OPEN
        }
      ]
    });

    var todo = Todo.create();

    expect(todo.status).toBe(TodoStatus.OPEN);
    expect(todo.status.toString()).toBe('OPEN');
    expect(todo.status.name).toBe('OPEN');
    expect(todo.status.label).toBe('Open');

    expect(
      foam.json.parse(
        foam.json.parseString(
          foam.json.stringify(TodoStatus.CLOSED)))).toBe(
            TodoStatus.CLOSED);

    todo.status = 101;

    expect(todo.status).toBe(TodoStatus.ASSIGNED);

    todo.status = 'OPEN';

    expect(todo.status).toBe(TodoStatus.OPEN);
    expect(todo.status.isOpen).toBe(true);

    expect(todo.status.hello()).toBe('hello Open');

    todo.status = 'CLOSED';

    expect(todo.status.isOpen).toBe(false);


    var values = TodoStatus.getValues();
    expect(values[0]).toBe(TodoStatus.OPEN);
    expect(values[1]).toBe(TodoStatus.CLOSED);
    expect(values[2]).toBe(TodoStatus.ASSIGNED);

    expect(function() {
      foam.ENUM({
        name: 'BadEnum',
        values: [
          {
            name: 'a',
          },
          {
            name: 'b',
            ordinal: 0
          }
        ]
      });
    }).toThrow();
  })
});
