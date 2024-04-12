/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// ENUM
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
  // Use the values: key to define the actual Enum Values that we want to exist.
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

console.log(IssueStatus.OPEN.name); // "OPEN"
console.log(IssueStatus.ASSIGNED.consideredOpen); // "true"

console.log(IssueStatus.CLOSED.ordinal); // 100
// values without specified ordinals get auto assigned.
console.log(IssueStatus.ASSIGNED.ordinal); // 101

console.log(IssueStatus.FIXED.foo()); // "Fixed is not considered open."

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
console.log(issue.status.label); // "Unverified"

issue.status = 100;
issue.status === IssueStatus.CLOSED; // is true

issue.status = "ASSIGNED"
issue.status === IssueStatus.ASSIGNED; // is true


console.log(IssueStatus.VALUES, IssueStatus.CLOSED.VALUES);

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