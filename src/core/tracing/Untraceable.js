/*
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

// Some foam.core.tracing objects should not publish property changes.
foam.CLASS({
  name: 'Untraceable',
  package: 'foam.core.tracing',

  methods: [
    // Never publish event state changes.
    function pub() { return 0; },
    function sub() {
      throw new Error('Attempt to subscribe to foam.core.tracing.Untraceable');
    },
    function unsub() {
      throw new Error('Attempt to unsubscribe from foam.core.tracing.Untraceable');
    },
    function hasListeners() { return false; },
    function pubPropertyChange_() {},
  ]
});
