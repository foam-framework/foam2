/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.session',
  name: 'SessionService',

  documentation: `
    A service that can be used to create sessions for users. The idea behind
    this service was to create an alternative to letting users access sessionDAO
    directly to manage sessions. This service has a much simpler interface and
    reveals less information.
  `,

  methods: [
    {
      name: 'createSession',
      documentation: 'Creates a new session for the given user/agent. Returns the access token for the new session.',
      type: 'String',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'userId', type: 'Long' },
        { name: 'agentId', type: 'Long' }
      ]
    },
    {
      name: 'createSessionWithTTL',
      documentation: 'Creates a new session for the given user/agent with the specified time to live. Returns the access token for the new session.',
      type: 'String',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'userId', type: 'Long' },
        { name: 'agentId', type: 'Long' },
        { name: 'ttl',    type: 'Long' }
      ]
    }
  ],
});
