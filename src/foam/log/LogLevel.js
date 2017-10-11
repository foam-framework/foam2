/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

foam.ENUM({
  package: 'foam.log',
  name: 'LogLevel',

  properties: [
    {
      class: 'String',
      name: 'shortName'
    },
    {
      class: 'String',
      name: 'consoleMethodName'
    }
  ],

  values: [
    {
      name: 'DEBUG',
      shortName: 'DEBG',
      label: 'Debug',
      consoleMethodName: 'debug'
    },
    {
      name: 'INFO',
      shortName: 'INFO',
      label: 'Info',
      consoleMethodName: 'info'
    },
    {
      name: 'WARN',
      shortName: 'WARN',
      label: 'Warn',
      consoleMethodName: 'warn'
    },
    {
      name: 'ERROR',
      shortName: 'ERRR',
      label: 'Error',
      consoleMethodName: 'error'
    }
  ]
});
