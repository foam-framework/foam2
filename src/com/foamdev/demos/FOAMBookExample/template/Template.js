/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Template
// Template basics: Templates use a JSP syntax to insert properties and code
foam.CLASS({
  name: 'TemplateTest',
  properties: [
    'name'
  ],
  templates: [
    {
      name: 'hello',
      template: 'Hello, my name is <%= this.name %>.'
    }
  ]
});

var o = TemplateTest.create({
  name: 'Adam'
});
console.log(o.hello()); // Hello, my name is Adam.
// TODO in runtime, in the client

// Template arguments: Templates can be declared to accept arguments
foam.CLASS({
  name: 'TemplateTest',
  properties: [
    'name'
  ],
  templates: [
    {
      name: 'greet',
      args: [
        'stranger'
      ],
      template: 'Hello <%= stranger %>, my name is <%= this.name %>.'
    }
  ]
});

var o = TemplateTest.create({
  name: 'Adam'
});
console.log(o.greet("Bob"));


// Template code: Template can use raw JS code for loops and control structures
foam.CLASS({
  name: 'TemplateTest',
  properties: [ 'name' ],
  templates: [
    {
      name: 'complexTemplate',
      template: 'Use raw JS code for loops and control structures' +
        '<% for ( var i = 0 ; i < 10; i++ ) { %>\n' +
        'i is: "<%= i %>" <% if ( i % 2 == 0 ) { %> which is even!<% } ' +
        '} %>' +
        '\n\n' +
        'Use 2 percent signs to shortcut access to local properties\n' +
        'For instance, my name is %%name\n'
    }
  ]
});

console.log(TemplateTest.create({
  name: 'Adam'
}).complexTemplate());

//toBeAssertedThat(TemplateTest.create({ name: 'Adam' }).complexTemplate()).toEqual(
//         'Use raw JS code for loops and control structures\n' +
//         'i is: "0"  which is even!\n' +
//         'i is: "1" \n' +
//         'i is: "2"  which is even!\n' +
//         'i is: "3" \n' +
//         'i is: "4"  which is even!\n' +
//         'i is: "5" \n' +
//         'i is: "6"  which is even!\n' +
//         'i is: "7" \n' +
//         'i is: "8"  which is even!\n' +
//         'i is: "9"\n' +
//         '\n' +
//         'Use 2 percent signs to shortcut access to local properties\n' +
//         'For instance, my name is Adam\n');


// Template nesting: Templates can be called from other templates. Include
// output as the first argument.
foam.CLASS({
  name: 'TemplateTest',
  properties: [ 'name' ],
  templates: [
    {
      name: 'greeter',
      args: [ 'stranger' ],
      template: 'Hello <%= stranger %>'
    },
    {
      name: 'greet',
      args: [ 'stranger' ],
      // 'output' is an implicit argument you must pass when calling one template
      // from another.
      template: '<% this.greeter(output, stranger); %>, my name is <%= this.name %>'
    }
  ]
});

var o = TemplateTest.create({
  name: 'Adam'
});
console.log(o.greet("Alice"));


// Template mutliline: Multi-line templates can be defined as function comments
foam.CLASS({
  name: 'MultiLineTemplateTest',
  properties: [ 'name' ],
  templates: [
    {
      name: 'complexTemplate',
      template: function() {
        /*
        Use raw JS code for loops and control structures
        <% for ( var i = 0 ; i < 10; i++ ) { %>
        i is: "<%= i %>" <% if ( i % 2 == 0 ) { %> which is even!<% }
        } %>
        Use percent signs to shortcut access to local properties
        For instance, my name is %%name
         */
      }
    }
  ]
});
console.log(MultiLineTemplateTest.create({
  name: 'Adam'
}).complexTemplate());