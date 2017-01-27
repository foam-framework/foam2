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

'String Int Array AxiomArray Blob Boolean Class Color Date DateTime EMail Float Double FObjectArray Function Image Long Map Object Password PhoneNumber Reference StringArray URL'.split(' ').forEach(function (t) {
  foam.__context__.register(foam.core.property[t + 'Property'], 'foam.core.' + t);
  foam.__context__.register(foam.core.property[t + 'Property'], t);
  foam.core[t] = foam.core.property[t + 'Property'];
});

foam.__context__.register(foam.core.property.FObjectProperty, 'foam.core.FObjectProperty');

/*

  { name: "foam/core/property/BooleanProperty" },
  { name: "foam/core/property/AxiomArrayProperty" },
  { name: "foam/core/EndBoot" },
  { name: "foam/core/property/FObjectArrayProperty" },
  { name: "foam/core/Constant" },
  { name: "foam/core/Validation" },
  { name: "foam/pattern/Faceted" },
  { name: "foam/core/property/StringProperty" },
  { name: "foam/core/property/IntProperty" },
  { name: "foam/core/property/ArrayProperty" },
  { name: "foam/core/property/BlobProperty" },
  { name: "foam/core/property/ClassProperty" },
  { name: "foam/core/property/ColorProperty" },
  { name: "foam/core/property/DateProperty" },
  { name: "foam/core/property/DateTimeProperty" },
  { name: "foam/core/property/DoubleProperty" },
  { name: "foam/core/property/EMailProperty" },
  { name: "foam/core/property/FloatProperty" },
  { name: "foam/core/property/FObjectProperty" },
  { name: "foam/core/property/FunctionProperty" },
  { name: "foam/core/property/ImageProperty" },
  { name: "foam/core/property/LongProperty" },
  { name: "foam/core/property/MapProperty" },
  { name: "foam/core/property/ObjectProperty" },
  { name: "foam/core/property/PasswordProperty" },
  { name: "foam/core/property/PhoneNumberProperty" },
  { name: "foam/core/property/ReferenceProperty" },
  { name: "foam/core/property/StringArrayProperty" },

*/
