/**
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

/** A static method that is installed on the containing class object, not its
  prototype. */
foam.CLASS({
  package: 'foam.core',
  name: 'ClassMethod',
  extends: 'foam.core.Method',

  methods: [
    function installInClass(cls) {
      cls[this.name] = this.override_(cls, this.code);
    },
    function installInProto(_) {
      // nop
    }
  ]
});
