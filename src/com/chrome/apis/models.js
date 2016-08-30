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
foam.CLASS({
  package: 'com.chrome.apis',
  name: 'Origin',

  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      class: 'String',
      name: 'origin'
      // TODO(braden): Validation rules for origins.
    }
    // TODO(braden): Add a reference to the owner here, for use with that
    // Relationship.
  ]
  // TODO(braden): Add the relationship for activeExperiments on this origin.
});
