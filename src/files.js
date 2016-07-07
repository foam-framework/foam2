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
  { name: "core/poly" },
  { name: "core/lib" },
  { name: "core/stdlib" },
  { name: "core/events" },
  { name: "core/Context" },
  { name: "core/AbstractClass" },
  { name: "core/Boot" },
  { name: "core/FObject" },
  { name: "core/Model" },
  { name: "core/Property" },
  { name: "core/Method" },
  { name: "core/Boolean" },
  { name: "core/AxiomArray" },
  { name: "core/EndBoot" },
  { name: "core/FObjectArray" },
  { name: "core/Constant" },
  { name: "core/types" },
  { name: "core/Topic" },
  { name: "core/InnerClass" },
  { name: "core/Implements" },
  { name: "core/ImportsExports" },
  { name: "core/Listener" },
  { name: "core/IDSupport" },
  { name: "core/Requires" },
  { name: "core/Slot" },
  { name: "core/Proxy" },
  { name: "core/Promised" },
  { name: "core/Enum" },
  { name: "core/Window" },
  { name: "core/debug" },
  { name: "core/patterns" },
  { name: "core/JSON" },
  { name: "core/parse" },
  { name: "core/templates" },
  { name: "core/Action" },
  { name: "lib/Promise" },
  { name: "lib/Timer" },
  { name: "lib/graphics", flags: ['web'] },
  { name: "lib/dao" },
  { name: "lib/mlang" },
  { name: "lib/AATree" },
  { name: "lib/Index" },
  { name: "lib/MDAO" },
  { name: "lib/TimestampDAO" },
  { name: "lib/GUIDDAO" },
  { name: "lib/JournalDAO" },
  { name: "lib/IDBDAO", flags: ['web'] },
  { name: "lib/Pooled" },
  { name: "lib/QueryParser" },
  { name: "lib/Physical" },
  { name: "lib/Collider" },
  { name: "lib/PhysicsEngine" },
  { name: "lib/PhysicalCircle", flags: ['web'] },
  { name: "lib/node/json_dao", flags: ['node'] },
  { name: "lib/utf8" },
  { name: "lib/net" },
  { name: "lib/messageport", flags: ['web'] },
  { name: "lib/node/net", flags: ['node'] },
  { name: "lib/firebase" },
  { name: "lib/fcm" },
  { name: "lib/Stub" },
  { name: "lib/box" },
  { name: "lib/u2", flags: ['web'] },
  { name: "lib/u2/daos", flags: ['web'] },
  { name: "lib/u2/TableView", flags: ['web'] },
  { name: "lib/node/net", flags: ['node'] },
  { name: "lib/node/box", flags: ['node'] }
]);
