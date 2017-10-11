# Enums

For those familiar with Java, FOAM Enums are very similar to Java enums in
design.

An Enum is essentially a class with a fixed number of named instances.
The instances are frequently referred to as Enum Values, or the 'values'
of an Enum.

Enums have most of the features available to FOAM classes, including
properties, methods, constants, templates, and listeners.

Enums extend from FObject, so they inherit FObject features such as
pub/sub events, diffing, hashCode, etc.

Enums also have a few built-in properties by default. Every Enum has an
'ordinal' property, which is a integer unique to all the Enum Values of a
particular Enum. Each enum also has a 'name' property, which is the name
given to each Enum Value.


## Example Usage:
To define an enum we use the `foam.ENUM()` function.
```js
foam.ENUM({
  name: 'IssueStatus',
  // Enums share many features with regular classes, the properties
  // and methods we want our enums to have are defined as follows.
  properties: [
    {
      class: 'Boolean',
      name: 'consideredOpen',
      value: true
    }
  ],
  methods: [
    function foo() {
      return this.label + ( this.consideredOpen ? ' is' : ' is not' ) +
          ' considered open.';
    }
  ],
  // Use the values: key to define the actual Enum Values that we
  // want to exist.
  values: [
    {
      name: 'OPEN'
    },
    {
      // The ordinal can be specified explicitly.
      name: 'CLOSED',
      ordinal: 100
    },
    {
      // If the ordinal isn't given explicitly it is auto assigned as
      // the previous ordinal + 1
      name: 'ASSIGNED'
    },
    {
      // You can specify the label, which will be used when rendering in a
      // combo box or similar
      name: 'UNVERIFIED',
      label: 'Unverified'
    },
    {
      // Values for additional properties to your enum are also defined
      // inline.
      name: 'FIXED',
      label: 'Fixed',
      consideredOpen: false
    }
  ]
});
```

```js
console.log(IssueStatus.OPEN.name); // outputs "OPEN"
console.log(IssueStatus.ASSIGNED.consideredOpen); // outputs "true"
```

Enum value ordinals can be specified.
```js
console.log(IssueStatus.CLOSED.ordinal); // outputs 100
// values without specified ordinals get auto assigned.
console.log(IssueStatus.ASSIGNED.ordinal); // outputs 101
```

Methods can be called on the enum values.
```js
// outputs "Fixed is not considered open."
console.log(IssueStatus.FIXED.foo());
```

To store enums on a class, it is recommended to use the Enum property type.
```js
foam.CLASS({
  name: 'Issue',
  properties: [
    {
      class: 'Enum',
      of: 'IssueStatus',
      name: 'status'
    }
  ]
});

var issue = Issue.create({ status: IssueStatus.UNVERIFIED });
console.log(issue.status.label); // outputs "Unverified"
```

Enum properties give you some convenient adapting. You can set the property to the ordinal or the name of an enum, and it will set the property to the correct Enum value.
```js
issue.status = 100;
issue.status === IssueStatus.CLOSED; // is true
```

Enum properties also allow you to assign them via the name of the enum.
```js
issue.status = "ASSIGNED"
issue.status === IssueStatus.ASSIGNED; // is true
```

The extent of all Enum values can be accessed from either the collection from any individual Enum value:
```js
console.log(IssueStatus.VALUES, IssueStatus.CLOSED.VALUES);
```

Values can be specified as just Strings if you don't want to explicitly the label or ordinal. 

```js
foam.ENUM({
 name: 'DaysOfWeek',
 values: [
   'SUNDAY',
   'MONDAY',
   'TUESDAY',
   'WEDNESDAY',
   'THURSDAY',
   'FRIDAY',
   'SATURDAY'
 ]
});
```