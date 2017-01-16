/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

    var todo = Todo.create(undefined, foam.__context__);

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


    var values = TodoStatus.VALUES;
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
