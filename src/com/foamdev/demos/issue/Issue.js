/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demo.issue',
  name: 'Issue',

  properties:
  [
    {
      class: 'Int',
      name: 'id',
      help: 'ID of the issue, unique to this project.'
    },
    /*
    {
      type: 'Reference',
      name: 'author',
      subType: 'IssuePerson',
      help: 'Person who originally filed this issue.',
      subType: 'IssuePerson'
    },*/
    {
      class: 'StringArray',
      name: 'blockedOn',
      help: 'References to issues this issue is blocked on.'
    },
    {
      class: 'StringArray',
      name: 'blocking',
      help: 'References to issues blocking on this issue.'
    },
    {
      class: 'StringArray',
      name: 'cc',
      help: 'List of people who are CC\'ed on updates to this issue.'
    },
    {
      class: 'DateTime',
      name: 'closed',
      help: 'Date and time the issue was closed.'
    },
    {
      class: 'String',
      name: 'description',
      help: 'Description of the issue.'
    },
    {
      class: 'StringArray',
      name: 'labels',
      help: 'Labels for this issue.'
    },
    /*
    {
      type: 'Reference',
      name: 'mergedInto',
      subType: 'Issue',
      help: 'Reference to the issue this issue was merged into.',
      subType: 'Issue'
    },
    {
      type: 'Reference',
      name: 'movedFrom',
      subType: 'Issue',
      help: 'Reference to the issue this issue was moved from.',
      subType: 'Issue'
    },
    */
    {
      class: 'StringArray',
      name: 'movedTo',
      help: 'Reference to the issue(s) this issue was moved to.'
    },
    /*
    {
      type: 'Reference',
      name: 'owner',
      subType: 'IssuePerson',
      help: 'Person to whom this issue is currently assigned.',
    },
    */
    {
      class: 'Date',
      name: 'published',
      help: 'Date and time the issue was originally published.'
    },
    {
      class: 'Boolean',
      name: 'starred',
      help: 'Whether the authenticated user has starred this issue.'
    },
    {
      class: 'Int',
      name: 'stars',
      help: 'Number of stars this issue has.'
    },
    {
      class: 'String',
      name: 'state',
      help: 'State of this issue (open or closed).'
    },
    {
      class: 'String',
      name: 'status',
      help: 'Status of this issue.'
    },
    {
      class: 'String',
      name: 'summary',
      help: 'One-line summary of the issue.'
    },
    {
      class: 'Date',
      name: 'updated',
      help: 'Date and time the issue was last updated.'
    }
  ]
});
