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

foam.INTERFACE({
  package: 'foam.log',
  name: 'Logger',

  methods: [
    { name: 'debug', documentation: 'Log at "debug" log level.' },
    { name: 'log',   documentation: 'Log at "log" log level.'   },
    { name: 'info',  documentation: 'Log at "info" log level.'  },
    { name: 'warn',  documentation: 'Log at "warn" log level.'  },
    { name: 'error', documentation: 'Log at "error" log level.' }
  ],
});
