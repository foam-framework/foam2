/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

FOAM_FILES([
  { name: "auth/ChangePassword" },
  { name: "auth/EnabledAware", flags: ['js'] },
  { name: "auth/EnabledAwareInterface", flags: ['java'] },
  { name: "auth/Group" },
  { name: "auth/Language" },
  { name: "auth/LastModifiedAware", flags: ['js'] },
  { name: "auth/LastModifiedAwareInterface", flags:['java']  },
  { name: "auth/LastModifiedByAware", flags: ['js'] },
  { name: "auth/LastModifiedByAwareInterface", flags: ['java'] },
  { name: "auth/Login" },
  { name: "auth/Permission" },
  { name: "auth/Country" },
  { name: "auth/Region" },
  { name: "auth/User" },
  { name: "boot/NSpec" },
  { name: "client/Client" },
  { name: "menu/Menu" },
  { name: "script/Language" },
  { name: "script/Script" },
  { name: "test/Test" },
  { name: "test/TestBorder" },
  { name: "cron/Cron" },
  { name: "export/ExportDriverRegistry"},
  { name: "export/JSONDriver"},
  { name: "export/XMLDriver"},
  { name: "export/CSVDriver"},
  { name: "auth/Relationships" },
  { name: "NanoService" },
  { name: "auth/WebAuthService" },
  { name: "auth/ClientAuthService" },
  { name: "pm/PMInfo" },
  { name: "pm/PMTableView" },
  { name: "pm/TemperatureCView" }
]);
