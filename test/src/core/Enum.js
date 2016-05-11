describe('Enum tests', function() {
  it('Basic enum', function() {
    foam.ENUM({
      name: 'TodoStatus',
      properties: [
        {
          name: 'label'
        }
      ],

      values: [
        {
          name: 'OPEN',
          values: {
            label: 'Open'
          }
        },
        {
          name: 'CLOSED',
          ordinal: 100,
          values: {
            label: 'Closed'
          }
        },
        {
          name: 'ASSIGNED',
          values: {
            label: 'Assigned'
          }
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

    var values = TodoStatus.getValues();
    expect(values[0]).toBe(TodoStatus.OPEN);
    expect(values[1]).toBe(TodoStatus.CLOSED);
    expect(values[2]).toBe(TodoStatus.ASSIGNED);
  })
});
