/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.swift.ui',
  name: 'FOAMActionUIButton',
  swiftImports: [
    'UIKit',
  ],
  properties: [
    {
      name: 'view',
      swiftType: 'UIButton',
      swiftFactory: 'return UIButton()',
      swiftPostSet: function() {/*
newValue.addTarget(self, action: #selector(onButtonClick), for: .touchUpInside)
newValue.setTitle(self.action?.label, for: .normal)
      */},
    },
    {
      swiftType: 'FObject?',
      name: 'fobj',
    },
    {
      swiftType: 'Action?',
      name: 'action',
    },
  ],
  methods: [
    {
      name: 'onButtonClick',
      swiftCode: 'if fobj != nil { action?.call(fobj!) }',
      swiftAnnotations: ['@objc'],
    },
  ],
});
