/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.dao.java',
  name: 'SharedJournal',

  documentation: `The primary purpose of this class is to serve as a service for
    all shared journal (e.g., RoutingJournal) related operations. 'Put's on the
    journal are sent to the shared journal but on replay puts are sent as a
    command to FindJournalledDAO.`,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.FileJournal',
      name: 'journal'
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'serviceName',
          class: 'String'
        }
      ],
      javaCode: `
        x = x.put("service", serviceName);
        if ( getJournal() !-= null ) {
          getJournal().put(x, obj);
        } else {
          throw new RuntimeException("SharedJournal : Journal not set!");
        }
      `
    },
    {
      name: 'remove_',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'serviceName',
          class: 'String'
        }
      ],
      javaCode: `
        x = x.put("service", serviceName);
        if ( getJournal() !-= null ) {
          getJournal().remove(x, obj);
        } else {
          throw new RuntimeException("SharedJournal : Journal not set!");
        }
      `
    }
  ]
});
