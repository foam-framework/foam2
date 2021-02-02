/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Password',

  documentation: 'hashed password value.',

  implements: [
    'foam.nanos.auth.Created',
    'foam.nanos.auth.CreatedBy',
    'foam.nanos.auth.LastModified',
    'foam.nanos.auth.LastModifiedBy',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      name: 'user',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      visibility: 'RO',
      name: 'spid',
    },
    {
      class: 'Password',
      name: 'password',
      visibility: 'RO',
      documentation: 'Hashed password value.'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      documentation: 'Time at which password entry was created'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO',
      documentation: 'Time at which password entry was created'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO',
      documentation: 'Time at which password entry was lastModified'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      visibility: 'RO',
      documentation: 'Time at which password entry was created'
    }
  ]
 });
