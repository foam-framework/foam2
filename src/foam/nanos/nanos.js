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

/**
 * List of all FOAM files available to be loaded in a JSONP
 * format, so it can used from both nodejs scripts, and web
 * pages via script tags easily.
 */

FOAM_FILES([
  { name: "foam/nanos/menu/Menu" },
  { name: "foam/nanos/client/Client" },
  { name: "foam/nanos/script/Script" },
  { name: "foam/nanos/test/Test" },
  { name: "foam/nanos/boot/NSpec" },
  { name: "foam/nanos/auth/ChangePassword" },
  { name: "foam/nanos/auth/EnabledAware" },
  { name: "foam/nanos/auth/Group" },
  { name: "foam/nanos/auth/Language" },
  { name: "foam/nanos/auth/LastModifiedAware" },
  { name: "foam/nanos/auth/LastModifiedByAware" },
  { name: "foam/nanos/auth/Login" },
  { name: "foam/nanos/auth/Permission" },
  { name: "foam/nanos/auth/User" },
  { name: "foam/nanos/auth/Relationships" },
  { name: "foam/nanos/log/LogLevel" },
  { name: "foam/nanos/log/Logger" },
  { name: "foam/nanos/log/ConsoleLogger" },
]);
