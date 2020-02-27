/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

FOAM_FILES([
  { name: 'foam/nanos/client/ClientBuilder' },
  { name: 'foam/nanos/controller/AppStyles', flags: ['web'] },
  { name: "foam/nanos/logger/LogMessage" },
  { name: "foam/nanos/logger/LogMessageDAO" },
  { name: "foam/nanos/logger/AbstractLogger" },
  { name: "foam/nanos/logger/ProxyLogger" },
  { name: "foam/nanos/logger/FileLogger" },
  { name: "foam/nanos/logger/LogLevelFilterLogger" },
  { name: "foam/nanos/logger/NotificationLogMessageDAO" },
  { name: "foam/nanos/logger/RepeatLogMessageDAO" },
  { name: "foam/nanos/logger/StdoutLoggerDAO" },
  { name: 'foam/nanos/fs/File' },
  { name: 'foam/nanos/fs/FileProperty' },
  { name: 'foam/nanos/fs/FileDAODecorator' },
  { name: 'foam/nanos/fs/FileArray' },
  { name: 'foam/nanos/fs/FileArrayDAODecorator' },
  { name: "foam/nanos/app/AppConfig" },
  { name: "foam/nanos/app/ContextLookupAppConfigService"},
  { name: "foam/nanos/app/AppConfigService" },
  { name: "foam/nanos/app/EmailConfig" },
  { name: "foam/nanos/app/ClientAppConfigService" },
  { name: "foam/nanos/theme/Theme" },
  { name: "foam/nanos/controller/ApplicationController" },
  { name: "foam/nanos/app/Mode" },
  { name: "foam/nanos/auth/DayOfWeek" },
  { name: "foam/nanos/auth/Hours" },
  { name: "foam/nanos/auth/Address" },
  { name: "foam/nanos/auth/DeletedAware" },
  { name: "foam/nanos/auth/DeletedAwareDAOTest" },
  { name: "foam/nanos/auth/PasswordPolicy" },
  { name: "foam/nanos/auth/Group" },
  { name: "foam/nanos/auth/ServiceProvider" },
  { name: "foam/nanos/auth/ServiceProviderAware" },
  { name: "foam/nanos/auth/ServiceProviderAwareDAO" },
  { name: "foam/nanos/auth/ServiceProviderAwarePredicate" },
  { name: "foam/nanos/auth/ServiceProviderAwareSink" },
  { name: "foam/nanos/auth/ServiceProviderAwareSupport" },
  { name: "foam/nanos/auth/test/ServiceProviderAwareTest" },
  { name: "foam/nanos/auth/test/UserAndGroupPermissionTest" },
  { name: "foam/nanos/auth/Language" },
  { name: "foam/nanos/auth/CreatedAware" },
  { name: "foam/nanos/auth/CreatedAwareDAO" },
  { name: "foam/nanos/auth/LastModifiedAware" },
  { name: "foam/nanos/auth/LastModifiedAwareDAO" },
  { name: "foam/nanos/auth/LifecycleState" },
  { name: "foam/nanos/auth/LifecycleAware" },
  { name: "foam/nanos/auth/LifecycleAwareDAO" },
  { name: "foam/nanos/auth/Login" },
  { name: "foam/nanos/auth/Permission" },
  { name: "foam/nanos/auth/Country" },
  { name: "foam/nanos/auth/Region" },
  { name: 'foam/nanos/auth/ResendVerificationEmail', flags: ['web'] },
  { name: "foam/nanos/auth/Phone" },
  { name: "foam/nanos/auth/HtmlDoc" },
  { name: "foam/nanos/auth/SignOutView" },
  { name: 'foam/nanos/auth/email/EmailTokenService'},
  { name: "foam/nanos/auth/email/EmailDocInterface" },
  { name: "foam/nanos/auth/email/EmailDocService" },
  { name: "foam/nanos/auth/email/ClientEmailDocService" },
  { name: "foam/nanos/auth/resetPassword/ForgotPasswordView" },
  { name: "foam/nanos/auth/resetPassword/SuccessView" },
  { name: "foam/nanos/auth/resetPassword/ResetPasswordTokenService" },
  { name: "foam/nanos/auth/token/TokenService" },
  { name: "foam/nanos/auth/token/ClientTokenService" },
  { name: "foam/nanos/auth/token/Token" },
  { name: "foam/nanos/auth/token/AbstractTokenService" },
  { name: "foam/nanos/auth/ChangePasswordView"},
  { name: 'foam/nanos/auth/HumanNameTrait' },
  { name: "foam/nanos/auth/User" },
  { name: "foam/nanos/auth/PriorPassword" },
  { name: "foam/nanos/auth/ruler/AddPasswordHistoryAction" },
  { name: "foam/nanos/auth/test/PasswordPolicyTest" },
  { name: "foam/nanos/auth/CreatedByAware" },
  { name: "foam/nanos/auth/CreatedByAwareDAO" },
  { name: "foam/nanos/auth/LastModifiedByAware" },
  { name: "foam/nanos/auth/LastModifiedByAwareDAO" },
  { name: "foam/nanos/auth/PermissionedPropertyDAO" },
  { name: "foam/nanos/auth/ProfilePictureView", flags: ['web'] },
  { name: "foam/nanos/auth/twofactor/OTPAuthService" },
  { name: "foam/nanos/auth/twofactor/AbstractOTPAuthService" },
  { name: "foam/nanos/auth/twofactor/AbstractTOTPAuthService" },
  { name: "foam/nanos/auth/twofactor/ClientOTPAuthService" },
  { name: "foam/nanos/auth/twofactor/TwoFactorSignInView" },
  { name: "foam/nanos/auth/twofactor/refinements" },
  { name: "foam/nanos/auth/UserAndGroupAuthService" },
  { name: "foam/nanos/auth/UserQueryService" },
  { name: "foam/nanos/auth/SimpleUserQueryService" },
  { name: "foam/nanos/bench/Benchmark" },
  { name: "foam/nanos/boot/DAOConfigSummaryView", flags: ['web'] },
  { name: "foam/nanos/session/Session" },
  { name: "foam/nanos/session/SessionTimer" },
  { name: "foam/nanos/session/SessionService" },
  { name: "foam/nanos/menu/XRegistration" },
  { name: "foam/nanos/menu/AbstractMenu" },
  { name: "foam/nanos/menu/DAOMenu" },
  { name: "foam/nanos/menu/DAOMenu2" },
  { name: "foam/nanos/menu/DocumentMenu" },
  { name: "foam/nanos/menu/DocumentFileMenu" },
  { name: "foam/nanos/menu/LinkMenu" },
  { name: "foam/nanos/menu/ListMenu" },
  { name: "foam/nanos/menu/Menu" },
  { name: "foam/nanos/menu/MenuBar" },
  { name: "foam/nanos/menu/PopupMenu" },
  { name: "foam/nanos/menu/SubMenu" },
  { name: "foam/nanos/menu/SubMenuView" },
  { name: "foam/nanos/menu/TabsMenu" },
  { name: "foam/nanos/menu/VerticalMenu" },
  { name: "foam/nanos/menu/ViewMenu" },
  { name: "foam/nanos/menu/ScriptMenu" },
  { name: "foam/nanos/menu/TreeAltView", flags: ['web'] },
  { name: "foam/nanos/menu/TreeGraphAltView" },
  { name: "foam/nanos/auth/PermissionTableView", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/TopNavigation", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/FooterView", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/SideNavigation", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/SideNavigationItemView", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/NavigationView", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/BusinessLogoView", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/UserView", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/SubMenuBar", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/ApplicationLogoView", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/UserInfoNavigationView", flags: ['web'] },
  { name: "foam/nanos/u2/navigation/NotificationMenuItem", flags: ['web'] },
  { name: "foam/nanos/script/Language" },
  { name: "foam/nanos/script/ScriptStatus" },
  { name: "foam/nanos/script/Script" },
  { name: "foam/nanos/script/TestRunnerConfig" },
  { name: "foam/nanos/script/TestRunnerScript" },
  { name: "foam/nanos/jetty/HttpServer" },
  { name: "foam/nanos/servlet/Servlet" },
  { name: "foam/nanos/servlet/ErrorPageMapping" },
  { name: "foam/nanos/servlet/FilterMapping" },
  { name: "foam/nanos/servlet/ServletMapping" },
  { name: "foam/nanos/servlet/VirtualHostRoutingServlet" },
  { name: "foam/nanos/test/Test" },
  { name: "foam/nanos/test/TestBorder" },
  { name: "foam/nanos/cron/Cron" },
  { name: "foam/nanos/cron/CronSchedule" },
  { name: "foam/nanos/cron/CronScheduleDAO" },
  { name: "foam/nanos/cron/IntervalSchedule" },
  { name: "foam/nanos/cron/NeverSchedule" },
  { name: "foam/nanos/cron/OrSchedule" },
  { name: "foam/nanos/cron/Schedule" },
  { name: "foam/nanos/cron/TimeHMS" },
  { name: "foam/nanos/cron/TimeOfDaySchedule" },
  { name: "foam/nanos/cron/test/IntervalScheduleTest" },
  { name: "foam/nanos/cron/test/TimeOfDayScheduleTest" },
  { name: "foam/nanos/export/ExportDriverRegistry"},
  { name: "foam/nanos/export/ExportDriver" },
  { name: "foam/nanos/export/JSONDriver"},
  { name: "foam/nanos/export/JSONJDriver"},
  { name: "foam/nanos/export/XMLDriver"},
  { name: "foam/nanos/export/CSVDriver"},
  { name: "foam/nanos/auth/Relationships" },
  { name: "foam/nanos/NanoService" },
  { name: "foam/nanos/auth/twofactor/OTPKey" },
  { name: "foam/nanos/auth/AuthService" },
  { name: "foam/nanos/auth/ProxyAuthService" },
  { name: "foam/nanos/auth/CachedAuthServiceProxy" },
  { name: "foam/nanos/auth/ClientAuthService" },
  { name: "foam/nanos/auth/ClientLoginAuthService" },
  { name: "foam/nanos/auth/AgentAuthService" },
  { name: "foam/nanos/auth/ClientAgentAuthService" },
  { name: "foam/nanos/pm/PMTemperatureCellFormatter" },
  { name: "foam/nanos/pm/NullPM" },
  { name: "foam/nanos/pm/PM" },
  { name: "foam/nanos/pm/PMInfo" },
  { name: "foam/nanos/pm/PMTableView", flags:['web'] },
  { name: "foam/nanos/pm/TemperatureCView" },
  { name: "foam/nanos/auth/PMAuthService" },
  { name: 'foam/nanos/notification/email/EmailMessage' },
  { name: 'foam/nanos/notification/email/EmailService' },
  { name: 'foam/nanos/notification/email/EmailTemplate' },
  { name: 'foam/nanos/notification/email/SMTPEmailService' },
  { name: 'foam/nanos/notification/email/Status' },
  { name: 'foam/nanos/notification/push/PushService' },
  { name: 'foam/nanos/notification/push/FirebasePushService' },
  { name: 'foam/nanos/demo/DemoObject' },
  { name: 'foam/nanos/demo/Demo' },
  { name: 'foam/nanos/http/Format' },
  { name: 'foam/nanos/http/Command' },
  { name: 'foam/nanos/http/WebAgent' },
  { name: "foam/nanos/http/ProxyWebAgent" },
  { name: "foam/nanos/http/HttpParameters" },
  { name: "foam/nanos/http/DefaultHttpParameters" },
  { name: "foam/nanos/doc/DocumentationView" },
  { name: 'foam/nanos/demo/relationship/CourseType' },
  { name: 'foam/nanos/demo/relationship/Course' },
  { name: 'foam/nanos/demo/relationship/Professor' },
  { name: 'foam/nanos/demo/relationship/Student' },
  { name: 'foam/nanos/demo/relationship/Controller' },
  { name: 'foam/nanos/notification/Notification'},
  { name: 'foam/nanos/notification/notifications/ScriptRunNotification'},
  { name: 'foam/nanos/notification/NotificationListView'},
  { name: 'foam/nanos/notification/NotificationRowView'},
  { name: 'foam/nanos/notification/NotificationSettingsView'},
  { name: 'foam/nanos/notification/NotificationView'},
  { name: 'foam/nanos/notification/NotificationNotificationView'},
  { name: 'foam/nanos/notification/notifications/ScriptRunNotificationNotificationView'},
  { name: 'foam/nanos/dashboard/Demo' },

  // Ticket
  { name: 'foam/nanos/ticket/TicketStatus' },
  { name: 'foam/nanos/ticket/TicketComment' },
  { name: 'foam/nanos/ticket/Ticket' },
  { name: 'foam/nanos/ticket/Relationships' },
  { name: 'foam/nanos/ticket/TicketAddCommentDAO' },
  { name: 'foam/nanos/ticket/TicketOwnerDAO' },
  { name: 'foam/nanos/ticket/TicketCommentOwnerDAO' },
  { name: 'foam/nanos/ticket/TicketSummaryView' },
  { name: 'foam/nanos/ticket/SummaryCard' },

  // Dig
  { name: "foam/nanos/dig/exception/DigErrorMessage" },
  { name: 'foam/nanos/dig/Argument'},
  { name: 'foam/nanos/dig/ResultView' },
  { name: 'foam/nanos/dig/DIG' },
  { name: 'foam/nanos/dig/DUGRule' },
  { name: 'foam/nanos/dig/DUGRuleAction' },
  { name: 'foam/nanos/dig/DigFileUploadView' },
  { name: 'foam/nanos/dig/DigSnippetView' },
  { name: 'foam/nanos/dig/LinkView' },
  { name: 'foam/nanos/dig/SUGAR' },

  { name: 'foam/nanos/notification/email/ClientPOP3EmailService'},
  { name: 'foam/nanos/notification/email/POP3Email'},

  // foam/nanos/ruler
  { name: "foam/nanos/ruler/RuleGroup" },
  { name: "foam/nanos/ruler/Operations" },
  { name: "foam/nanos/ruler/Rule" },
  { name: "foam/nanos/ruler/RuleAction" },
  { name: "foam/nanos/ruler/CompositeRuleAction" },
  { name: "foam/nanos/ruler/RuleHistory" },
  { name: "foam/nanos/ruler/RuleHistoryStatus" },
  { name: "foam/nanos/ruler/RulerDAO" },
  { name: "foam/nanos/ruler/ScriptPredicate"},
  { name: "foam/nanos/ruler/UpdateRulesListSink" },
  { name: "foam/nanos/ruler/TestedRule" },
  { name: "foam/nanos/ruler/RulerProbe" },
  { name: "foam/nanos/ruler/predicate/PropertyChangePredicate" },
  { name: "foam/nanos/ruler/predicate/PropertyEQProperty" },
  { name: "foam/nanos/ruler/Relationships" },
  { name: "foam/nanos/ruler/action/SendNotification" },
  { name: "foam/nanos/ruler/predicate/PropertyEQValue" },
  { name: "foam/nanos/ruler/predicate/PropertyNEQValue" },
  { name: "foam/nanos/ruler/predicate/NewEqOld" },
  { name: "foam/nanos/ruler/predicate/IsInstancePredicate" },
  { name: "foam/nanos/ruler/predicate/PropertyIsInstance" },
  { name: "foam/nanos/ruler/predicate/PropertyIsClass" },
  { name: "foam/nanos/ruler/action/ChangePropertyAction" },
  { name: "foam/nanos/test/EchoService" },
  { name: "foam/nanos/test/SerializationTestEchoService" },
  { name: "foam/nanos/analytics/Foldable" },
  { name: "foam/nanos/analytics/Candlestick" },
  { name: "foam/nanos/test/ClientEchoService" },

  { name: "foam/dao/jdbc/JDBCConnectionSpec" },

  // foam/nanos/crunch
  { name: "foam/nanos/crunch/crunchtest/FakeTestObject" },
  // models
  { name: "foam/nanos/crunch/Capability" },
  { name: "foam/nanos/crunch/CapabilityCategory" },
  { name: "foam/nanos/crunch/CapabilityJunctionStatus" },
  { name: "foam/nanos/crunch/UserCapabilityJunctionRefine" },
  //daos
  { name: "foam/nanos/crunch/UserCapabilityJunctionDAO" },
  //rules
  { name: "foam/nanos/crunch/SendNotificationOnTopLevelCapabilityStatusUpdate" },
  { name: "foam/nanos/crunch/IsUserCapabilityJunctionStatusUpdate" },
  { name: "foam/nanos/crunch/RemoveJunctionsOnUserRemoval" },

  // approval
  { name: 'foam/nanos/approval/ApprovalRequest' },
  { name: 'foam/nanos/approval/ApprovalStatus' },
  { name: 'foam/nanos/approval/ApprovableAware'},
  { name: 'foam/nanos/approval/PropertiesToUpdateView', flags: ['web'] },
  { name: 'foam/nanos/approval/Approvable' },
  { name: 'foam/nanos/approval/ApprovableAwareDAO' },
  { name: 'foam/nanos/approval/ApprovableApprovalRequestsPredicate' },
  { name: 'foam/nanos/approval/ApprovableApprovalRequestsRule' },
  { name: 'foam/nanos/approval/RoleApprovalRequest' },
  { name: 'foam/nanos/approval/FulfilledApprovablePredicate' },
  { name: 'foam/nanos/approval/FulfilledApprovableRule' },

  //authservice
  { name: "foam/nanos/auth/CapabilityAuthService" },
  // google
  { name: "foam/nanos/geocode/GoogleMapsCredentials" }
]);
