/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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

/*
  Accessible through browser at location path static/foam2/src/foam/nanos/controller/index.html
  Available on browser console as ctrl. (exports axiom)
*/
foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'ApplicationController',
  extends: 'foam.u2.Element',

  documentation: 'FOAM Application Controller.',

  implements: [
    'foam.box.Context',
    'foam.mlang.Expressions',
    'foam.nanos.controller.AppStyles'
  ],

  requires: [
    'foam.nanos.client.ClientBuilder',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.nanos.theme.ThemeDomain',
    'foam.nanos.u2.navigation.TopNavigation',
    'foam.nanos.u2.navigation.FooterView',
    'foam.u2.crunch.CapabilityIntercept',
    'foam.u2.crunch.CapabilityInterceptView',
    'foam.u2.crunch.CrunchController',
    'foam.u2.borders.MarginBorder',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.session.SessionTimer',
    'foam.u2.dialog.Popup',
    'foam.i18n.Locale',
    'foam.i18n.XLIFFTranslationValue',
  ],

  imports: [
    'capabilityDAO',
    'installCSS',
    'sessionSuccess',
    'window',
  ],

  exports: [
    'displayWidth',
    'agent',
    'appConfig',
    'as ctrl',
    'currentMenu',
    'group',
    'lastMenuLaunched',
    'lastMenuLaunchedListener',
    'loginSuccess',
    'theme',
    'menuListener',
    'notify',
    'pushMenu',
    'requestCapability',
    'capabilityCache',
    'requestLogin',
    'signUpEnabled',
    'loginVariables',
    'stack',
    'subject',
    'user',
    'webApp',
    'wrapCSS as installCSS',
    'sessionTimer',
    'crunchController',
    'XLIFFTranslation'
  ],

  constants: {
    MACROS: [
      'logoBackgroundColour',
      'customCSS',
      'primary1',
      'primary2',
      'primary3',
      'primary4',
      'primary5',
      'approval1',
      'approval2',
      'approval3',
      'approval4',
      'approval5',
      'warning1',
      'warning2',
      'warning3',
      'warning4',
      'warning5',
      'destructive1',
      'destructive2',
      'destructive3',
      'destructive4',
      'destructive5',
      'grey1',
      'grey2',
      'grey3',
      'grey4',
      'grey5',
      'black',
      'white',
      'inputHeight',
      'inputVerticalPadding',
      'inputHorizontalPadding'
    ]
  },

  messages: [
    { name: 'GROUP_FETCH_ERR', message: 'Error fetching group' },
    { name: 'GROUP_NULL_ERR', message: 'Group was null' },
    { name: 'LOOK_AND_FEEL_NOT_FOUND', message: 'Could not fetch look and feel object.' }
  ],

  css: `
    body {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: #373a3c;
      background: /*%GREY5%*/ #f5f7fa;
      margin: 0;
    }
    .stack-wrapper {
      min-height: calc(80% - 60px);
    }
    .stack-wrapper:after {
      content: "";
      display: block;
    }

    .truncate-ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,

  properties: [
    {
      name: 'loginVariables',
      expression: function(client$userDAO) {
        return {
          dao_: client$userDAO || null,
          imgPath: '',
          group: 'system',
          countryChoices_: [] // empty defaults to entire countryDAO
        };
      }
    },
    {
      class: 'Enum',
      of: 'foam.u2.layout.DisplayWidth',
      name: 'displayWidth',
      value: foam.u2.layout.DisplayWidth.XL
    },
    {
      name: 'clientPromise',
      factory: function() {
        var self = this;
        return self.ClientBuilder.create().promise.then(function(cls) {
          self.client = cls.create(null, self);
          return self.client;
        });
      },
    },
    {
      name: 'client',
    },
    {
      name: 'appConfig',
      expression: function(client$appConfig) {
        return client$appConfig || null;
      }
    },
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function() { return this.User.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'agent',
      factory: function() { return this.User.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'subject',
      factory: function() { return this.Subject.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Group',
      name: 'group'
    },
    {
      class: 'Boolean',
      name: 'signUpEnabled',
      adapt: function(_, v) {
        return foam.String.isInstance(v) ? v !== 'false' : v;
      }
    },
    {
      class: 'Boolean',
      name: 'loginSuccess'
    },
    {
      class: 'Boolean',
      name: 'capabilityAcquired',
      documentation: `
        The purpose of this is to handle the intercept flow for a capability that was granted,
        via the InterceptView from this.requestCapability(exceptionCapabilityType).
      `
    },
    {
      class: 'Boolean',
      name: 'capabilityCancelled'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.session.SessionTimer',
      name: 'sessionTimer',
      factory: function() {
        return this.SessionTimer.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.CrunchController',
      name: 'crunchController',
      factory: function() {
        return this.CrunchController.create();
      }
    },
    {
      class: 'Map',
      name: 'capabilityCache',
      factory: function() {
        return new Map();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.theme.Theme',
      name: 'theme'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'topNavigation_',
      factory: function() {
        return this.TopNavigation;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'footerView_',
      factory: function() {
        return this.FooterView;
      }
    },
    'currentMenu',
    'lastMenuLaunched',
    'webApp',
    {
      name   : 'XLIFFTranslation',
      factory: function() {
        if ( foam.language == 'fr-CA' || foam.language == 'fr' ) {
          return this.Locale.create({
            locale:'fr',
            variant:'CA',
            locale_variant: 'fr-CA',
            translationValues:
              {
                values:[
                  this.XLIFFTranslationValue.create(
                    {
                      id: 'net.nanopay.sme.ui.dashboard.TopCardsOnDashboardOne',
                      source: 'LOWER_LINE_TXT',
                      target: 'Welcome back Fr 1 '
                    }),
                  this.XLIFFTranslationValue.create(//net.nanopay.sme.ui.dashboard.TopCardsOnDashboard.LOWER_LINE_TXT = 'Bon retour à ';
                    {
                      id: 'net.nanopay.sme.ui.dashboard.TopCardsOnDashboard.LOWER_LINE_TXT',
                      source: 'net.nanopay.sme.ui.dashboard.TopCardsOnDashboard.LOWER_LINE_TXT',
                      target: 'Welcome back Fr 2 '
                    }),
                  //foam.nanos.auth.Address.COUNTRY_ID.label = 'Pays';
                  this.XLIFFTranslationValue.create(
                    {
                      id: 'foam.nanos.auth.Address.COUNTRY_ID.label',
                      source: 'foam.nanos.auth.Address.COUNTRY_ID.label',
                      target: 'Pays Fr 2 '
                    }),
                  //net.nanopay.sme.onboarding.BusinessOnboarding.axiomMap_['businessAddressSection'].title = 'Entrez l\'adresse professionnelle';
//                   this.XLIFFTranslationValue.create(
//                     {
//                       id: 'net.nanopay.sme.onboarding.BusinessOnboarding.axiomMap_["businessAddressSection"].title',
//                       source: 'net.nanopay.sme.onboarding.BusinessOnboarding.axiomMap_["businessAddressSection"].title',
//                       target: 'Entrez l\'adresse professionnelle Fr 2 '
//              }),

                  //net.nanopay.sme.onboarding.BusinessOnboarding.axiomMap_[net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS.section].title
                  this.XLIFFTranslationValue.create(
                    {
                      id: 'net.nanopay.sme.onboarding.BusinessOnboarding.axiomMap_[net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS.section].title',
                      source: 'net.nanopay.sme.onboarding.BusinessOnboarding.axiomMap_[net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ADDRESS.section].title',
                      target: 'Entrez l\'adresse professionnelle Fr 2 '
                    }),
  
                  //net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.axiomMap_['getStarted'].label = 'Commencer';
                  this.XLIFFTranslationValue.create(
                    {
                      id:'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.GET_STARTED.label',
                      source:'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.GET_STARTED.label',
                      target: 'Commencer Fr 2 '
                    }),
                  this.XLIFFTranslationValue.create(
                    {
                      id:'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.TITLE_DOMESTIC',
                      source:'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.TITLE_DOMESTIC',
                      target: 'Unlock domestic payments Fr 2 '
                    }),
                      //foam.u2.filter.BooleanFilterView.BOOL_T.label = 'Vrai';
                  this.XLIFFTranslationValue.create(
                    {
                      id:'foam.u2.filter.properties.BooleanFilterView.BOOL_T.label',
                      source:'foam.u2.filter.properties.BooleanFilterView.BOOL_T.label',
                      target: 'Vrai Fr 2 '
                    }),
                    //net.nanopay.contacts.ui.modal.PaymentCodeSearch.search.TITLE
                  this.XLIFFTranslationValue.create(
                    {
                      id:'net.nanopay.contacts.ui.modal.PaymentCodeSearch.search.TITLE',
                      source:'net.nanopay.contacts.ui.modal.PaymentCodeSearch.search.TITLE',
                      target: 'Search by Payment Code Fr 2 '
                    }),

                  this.XLIFFTranslationValue.create(
                    {
                      id:'net.nanopay.contacts.ui.modal.PaymentCodeSearch.search.SUB_TITLE',
                      source:'net.nanopay.contacts.ui.modal.PaymentCodeSearch.search.SUB_TITLE',
                      target: 'Search by Payment Code Fr 2 '
                    }),

//+++++++++++++++++++++++++++++++++++++++++

this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.Element",
    "source": "foam.u2.Element.SELECT_BAD_USAGE",
    "target": "You're using Element.select() wrong. The function passed to it must return an Element. Don't try to modify the view by side effects. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.SampleData2",
    "source": "com.google.foam.demos.u2.SampleData2.FIRST_NAME.label",
    "target": "First name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.SampleData2",
    "source": "com.google.foam.demos.u2.SampleData2.LAST_NAME.label",
    "target": "Last name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.core.Action",
    "source": "foam.core.Action.IS_AVAILABLE.label",
    "target": "Available fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.core.Action",
    "source": "foam.core.Action.IS_ENABLED.label",
    "target": "Enabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.Theme",
    "source": "foam.nanos.theme.Theme.SECTION_INFO_SECTION.title",
    "target": "Info fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.Theme",
    "source": "foam.nanos.theme.Theme.SECTION_URL_MAPPING.title",
    "target": "URL Mapping fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.Theme",
    "source": "foam.nanos.theme.Theme.SECTION_COLOURS.title",
    "target": "Colours fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.Theme",
    "source": "foam.nanos.theme.Theme.SECTION_IMAGES.title",
    "target": "Icons / Images fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.Theme",
    "source": "foam.nanos.theme.Theme.SECTION_SECTION_CSS.title",
    "target": "CSS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.Theme",
    "source": "foam.nanos.theme.Theme.SECTION_NAVIGATION.title",
    "target": "Navigation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.Theme",
    "source": "foam.nanos.theme.Theme.SECTION_INPUTS.title",
    "target": "Inputs fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.Theme",
    "source": "foam.nanos.theme.Theme.SECTION_APPLICATION_SECTION.title",
    "target": "Application fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.User",
    "source": "foam.nanos.auth.User.USER_NAME.label",
    "target": "Username fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.User",
    "source": "foam.nanos.auth.User.EMAIL.label",
    "target": "Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.User",
    "source": "foam.nanos.auth.User.ADDRESS.label",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.User",
    "source": "foam.nanos.auth.User.DESIRED_PASSWORD.label",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.User",
    "source": "foam.nanos.auth.User.SECTION_BUSINESS.title",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.User",
    "source": "foam.nanos.auth.User.SECTION_PERSONAL.title",
    "target": "Personal Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.UserRefine",
    "source": "net.nanopay.model.UserRefine.JOB_TITLE.label",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.UserRefine",
    "source": "net.nanopay.model.UserRefine.ORGANIZATION.label",
    "target": "Company Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.UserRefine",
    "source": "net.nanopay.model.UserRefine.SECTION_PERSONAL.title",
    "target": "User Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.UserRefine",
    "source": "net.nanopay.model.UserRefine.SECTION_BUSINESS.title",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.wizard.WizardView",
    "source": "net.nanopay.ui.wizard.WizardView.ButtonCancel",
    "target": "Cancel fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.wizard.WizardView",
    "source": "net.nanopay.ui.wizard.WizardView.ButtonBack",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.wizard.WizardView",
    "source": "net.nanopay.ui.wizard.WizardView.ButtonNext",
    "target": "Next fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.wizard.WizardView",
    "source": "net.nanopay.ui.wizard.WizardView.ButtonSubmit",
    "target": "Submit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.core.Unit",
    "source": "foam.core.Unit.ID.label",
    "target": "Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.Account",
    "source": "net.nanopay.account.Account.ID.label",
    "target": "Account Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.Account",
    "source": "net.nanopay.account.Account.NAME.label",
    "target": "Account Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.Account",
    "source": "net.nanopay.account.Account.DESC.label",
    "target": "Memo fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.Account",
    "source": "net.nanopay.account.Account.IS_DEFAULT.label",
    "target": "Set As Default fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.Account",
    "source": "net.nanopay.account.Account.BALANCE.label",
    "target": "Balance (local) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.Account",
    "source": "net.nanopay.account.Account.HOME_BALANCE.label",
    "target": "Balance (home) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.Account",
    "source": "net.nanopay.account.Account.SECTION__DEFAULT_SECTION.title",
    "target": "Relationships fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.Invoice",
    "source": "net.nanopay.invoice.model.Invoice.ON_VOID_NOTE",
    "target": "On Void Note:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.Invoice",
    "source": "net.nanopay.invoice.model.Invoice.INVOICE_NUMBER.label",
    "target": "Invoice # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.Invoice",
    "source": "net.nanopay.invoice.model.Invoice.PURCHASE_ORDER.label",
    "target": "PO # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.Invoice",
    "source": "net.nanopay.invoice.model.Invoice.ISSUE_DATE.label",
    "target": "Date Issued fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.Invoice",
    "source": "net.nanopay.invoice.model.Invoice.DUE_DATE.label",
    "target": "Date Due fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.Invoice",
    "source": "net.nanopay.invoice.model.Invoice.PAYMENT_DATE.label",
    "target": "Received fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.Invoice",
    "source": "net.nanopay.invoice.model.Invoice.INVOICE_FILE.label",
    "target": "Attachment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.BusinessType",
    "source": "net.nanopay.model.BusinessType.NAME.label",
    "target": "Business Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.BusinessSector",
    "source": "net.nanopay.model.BusinessSector.NAME.label",
    "target": "Business Sector fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.Country",
    "source": "foam.nanos.auth.Country.ISO31661CODE.label",
    "target": "ISO Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.Phone",
    "source": "foam.nanos.auth.Phone.NUMBER.label",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.Address",
    "source": "foam.nanos.auth.Address.COUNTRY_ID.label",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.Address",
    "source": "foam.nanos.auth.Address.REGION_ID.label",
    "target": "Region fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.Address",
    "source": "foam.nanos.auth.Address.STREET_NUMBER.label",
    "target": "Street No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.Business",
    "source": "net.nanopay.model.Business.COMPLIANCE_REPORT_WARNING",
    "target": " has not completed the business profile, and cannot generate compliance documents. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.Business",
    "source": "net.nanopay.model.Business.OPERATING_BUSINESS_NAME.label",
    "target": "Company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.Business",
    "source": "net.nanopay.model.Business.TARGET_CUSTOMERS.label",
    "target": "Who do you market the products and services to? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.Business",
    "source": "net.nanopay.model.Business.SECTION_BUSINESS.title",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.Business",
    "source": "net.nanopay.model.Business.SECTION_PERSONAL.title",
    "target": "Personal Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo",
    "source": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.PLACE_HOLDER",
    "target": "Please select... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo",
    "source": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_REVENUE.label",
    "target": "Gross annual sales (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo",
    "source": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE.label",
    "target": "Purpose of transactions on application fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo",
    "source": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_FREQUENCY.label",
    "target": "Annual number of transactions (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo",
    "source": "net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_DOMESTIC_VOLUME.label",
    "target": "Annual volume on application (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.BeneficialOwner",
    "source": "net.nanopay.model.BeneficialOwner.BIRTHDAY.label",
    "target": "Date of birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.UserRefine",
    "source": "net.nanopay.accounting.UserRefine.INTEGRATION_CODE.label",
    "target": "Accounting Integration fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.ID.label",
    "target": "ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.REFERENCE_NUMBER.label",
    "target": "Reference Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.ORIGIN.label",
    "target": "Originating Source fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.PAYER.label",
    "target": "Sender fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.PAYEE.label",
    "target": "Receiver fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.PAYER_ID.label",
    "target": "payer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.AMOUNT.label",
    "target": "Source Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.DESTINATION_AMOUNT.label",
    "target": "Destination Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.SEARCH_NAME.label",
    "target": "Payer/Payee Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.SECTION_BASIC_INFO.title",
    "target": "Transaction Info fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.Transaction",
    "source": "net.nanopay.tx.model.Transaction.SECTION_LINE_ITEMS_SECTION.title",
    "target": "Additional Detail fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.SecurityAccount",
    "source": "net.nanopay.account.SecurityAccount.BALANCE.label",
    "target": "Balance (local) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.TransactionLineItem",
    "source": "net.nanopay.tx.TransactionLineItem.REVERSABLE.label",
    "target": "Refundable fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.TransactionLineItem",
    "source": "net.nanopay.tx.TransactionLineItem.TRANSACTION.label",
    "target": "From Transaction fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroOnboarding.INTRO_TEXT",
    "target": "I’ll be asking you for some information that will verify your personal \n          identity and your organization's identity. It may feel like a lot, but we take \n          security very seriously, and we want to make sure that your account is protected \n          at all times.  We are dealing with your hard earned money after all, so a little \n          extra security goes a long way! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroOnboarding.INTRO_TITLE_1",
    "target": "Your personal information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroOnboarding.INTRO_SUB_TEXT_1",
    "target": "Things like your address and phone number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroOnboarding.INTRO_TITLE_2",
    "target": "Your business information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroOnboarding.INTRO_SUB_TEXT_2",
    "target": "Things like your organization's operating name and the type of business it is registered as fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroOnboarding.INTRO_TITLE_3",
    "target": "Your transaction information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroOnboarding.INTRO_SUB_TEXT_3",
    "target": "Things like the purpose of your transactions and your company's estimated annual sales fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding.AUTHENTICATOR",
    "target": "Google Authenticator fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding.ANDROID_NAME",
    "target": "Android fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding.TWO_FACTOR_INSTR1",
    "target": "Download and use your  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.TwoFactorAuthOnboarding.TWO_FACTOR_INSTR2",
    "target": " app on your mobile device to scan the QR code. If you can’t use the QR code, you can enter the provided key into the Google Authenticator app manually. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroUSOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroUSOnboarding.INTRO_TEXT",
    "target": "I’ll be asking you a few questions about your business to help me enable international payments for you. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroUSOnboarding",
    "source": "net.nanopay.sme.onboarding.ui.IntroUSOnboarding.INTRO_TITLE_1",
    "target": "Your business registration details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.DataSecurityBanner",
    "source": "net.nanopay.ui.DataSecurityBanner.Title",
    "target": "Your safety is our top priority fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.DataSecurityBanner",
    "source": "net.nanopay.ui.DataSecurityBanner.Subtitle",
    "target": "Our platform uses state-of-the-art security and encryption measures when handling your data fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DigitalAccount",
    "source": "net.nanopay.account.DigitalAccount.SECTION_LIQUIDITY_SETTINGS_SECTION.title",
    "target": "Liquidity Settings fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DebtAccount",
    "source": "net.nanopay.account.DebtAccount.DEBTOR_ACCOUNT.label",
    "target": "Debtor fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DebtAccount",
    "source": "net.nanopay.account.DebtAccount.CREDITOR_ACCOUNT.label",
    "target": "Creditor fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingBankAccountId",
    "source": "net.nanopay.accounting.AccountingBankAccountId.QUICK_BOOKS_BANK_ACCOUNT_ID.label",
    "target": "Quick Books Bank Account Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingBankAccountId",
    "source": "net.nanopay.accounting.AccountingBankAccountId.REALM_ID.label",
    "target": "Realm Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingBankAccountId",
    "source": "net.nanopay.accounting.AccountingBankAccountId.XERO_BANK_ACCOUNT_ID.label",
    "target": "Xero Bank Account Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingBankAccountId",
    "source": "net.nanopay.accounting.AccountingBankAccountId.XERO_ORGANIZATION_ID.label",
    "target": "Xero Organization Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.ActionView",
    "source": "foam.u2.ActionView.CONFIRM",
    "target": "Confirm fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.view.RichChoiceView",
    "source": "foam.u2.view.RichChoiceView.CHOOSE_FROM",
    "target": "Choose from  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.view.RichChoiceView",
    "source": "foam.u2.view.RichChoiceView.CLEAR_SELECTION",
    "target": "Clear fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.business.NatureOfBusiness",
    "source": "net.nanopay.business.NatureOfBusiness.PLACE_HOLDER",
    "target": "Please select... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceFileUploadView",
    "source": "net.nanopay.invoice.ui.InvoiceFileUploadView.ErrorMessage",
    "target": "One or more file(s) were not uploaded as they exceeded the file size limit of 10MB fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ProfilePictureView",
    "source": "foam.nanos.auth.ProfilePictureView.UploadImageLabel",
    "target": "Choose File fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ProfilePictureView",
    "source": "foam.nanos.auth.ProfilePictureView.RemoveImageLabel",
    "target": "Remove File fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ProfilePictureView",
    "source": "foam.nanos.auth.ProfilePictureView.UploadDesc",
    "target": "Or drag and drop an image here fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ProfilePictureView",
    "source": "foam.nanos.auth.ProfilePictureView.UploadRestrict",
    "target": "* jpg, jpeg, or png only, 2MB maximum, 100*100 72dpi recommended fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ProfilePictureView",
    "source": "foam.nanos.auth.ProfilePictureView.FileError",
    "target": "File required fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ProfilePictureView",
    "source": "foam.nanos.auth.ProfilePictureView.FileTypeError",
    "target": "Wrong file format fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ProfilePictureView",
    "source": "foam.nanos.auth.ProfilePictureView.ErrorMessage",
    "target": "Please upload an image less than 2MB fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PersonalIdentification",
    "source": "net.nanopay.model.PersonalIdentification.IDENTIFICATION_TYPE_ID.label",
    "target": "Type of Identification fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PersonalIdentification",
    "source": "net.nanopay.model.PersonalIdentification.COUNTRY_ID.label",
    "target": "Country of Issue fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PersonalIdentification",
    "source": "net.nanopay.model.PersonalIdentification.REGION_ID.label",
    "target": "Province/State of Issue fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PersonalIdentification",
    "source": "net.nanopay.model.PersonalIdentification.ISSUE_DATE.label",
    "target": "Date Issued fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PersonalIdentification",
    "source": "net.nanopay.model.PersonalIdentification.EXPIRATION_DATE.label",
    "target": "Expiry Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.ExchangeRateId",
    "source": "net.nanopay.fx.ExchangeRateId.FROM_CURRENCY.label",
    "target": "From Currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.ExchangeRateId",
    "source": "net.nanopay.fx.ExchangeRateId.TO_CURRENCY.label",
    "target": "To Currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.graphics.Label",
    "source": "foam.graphics.Label.ALIGN.label",
    "target": "Alignment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.graphics.Label",
    "source": "foam.graphics.Label.BORDER.label",
    "target": "Border Color fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.graphics.Label",
    "source": "foam.graphics.Label.MAX_WIDTH.label",
    "target": "Maximum Width fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.LiquiditySettings",
    "source": "net.nanopay.liquidity.LiquiditySettings.CASH_OUT_FREQUENCY.label",
    "target": "Sweep Frequency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.LiquiditySettings",
    "source": "net.nanopay.liquidity.LiquiditySettings.LOW_LIQUIDITY.label",
    "target": "Low Threshold fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.LiquiditySettings",
    "source": "net.nanopay.liquidity.LiquiditySettings.HIGH_LIQUIDITY.label",
    "target": "High Threshold fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.LiquiditySettings",
    "source": "net.nanopay.liquidity.LiquiditySettings.SECTION_ACCOUNTS_SECTION.title",
    "target": "Accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.notification.Notification",
    "source": "foam.nanos.notification.Notification.NOTIFICATION_TYPE.label",
    "target": "Notification type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.notification.Notification",
    "source": "foam.nanos.notification.Notification.EMAIL_NAME.label",
    "target": "Email template name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.AccountTreeView",
    "source": "net.nanopay.account.ui.AccountTreeView.VIEW_HEADER",
    "target": "Account Hierarchy View fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.AccountTreeView",
    "source": "net.nanopay.account.ui.AccountTreeView.MESSAGE_SELECT_ROOT",
    "target": "Please select a base account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.FilterView",
    "source": "foam.u2.filter.FilterView.LABEL_FILTER",
    "target": "Filter fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.FilterView",
    "source": "foam.u2.filter.FilterView.LABEL_RESULTS",
    "target": "Filter Results:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.FilterView",
    "source": "foam.u2.filter.FilterView.LABEL_CLEAR",
    "target": "Clear fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.FilterView",
    "source": "foam.u2.filter.FilterView.LINK_ADVANCED",
    "target": "Advanced fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.FilterView",
    "source": "foam.u2.filter.FilterView.LINK_SIMPLE",
    "target": "Simple fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.FilterView",
    "source": "foam.u2.filter.FilterView.MESSAGE_ADVANCEDMODE",
    "target": "Advanced filters are currently being used. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.FilterView",
    "source": "foam.u2.filter.FilterView.MESSAGE_VIEWADVANCED",
    "target": "View filters fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.comics.v2.DAOBrowserView",
    "source": "foam.comics.v2.DAOBrowserView.REFRESH_MSG",
    "target": "Refresh Requested ...  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboardingId",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboardingId.USER_ID.label",
    "target": "User Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboardingId",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboardingId.BUSINESS_ID.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.documents.AcceptanceDocument",
    "source": "net.nanopay.documents.AcceptanceDocument.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.documents.AcceptanceDocument",
    "source": "net.nanopay.documents.AcceptanceDocument.ISSUED_DATE.label",
    "target": "Effective Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.PROHIBITED_MESSAGE",
    "target": "You do not have permission to update a submitted onboard profile. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.PLACE_HOLDER",
    "target": "Please select... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.BUSINESS_ID.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.BIRTHDAY.label",
    "target": "Date of birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.PEPHIORELATED.label",
    "target": "I am a politically exposed person or head of an international organization (PEP/HIO) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.ADMIN_JOB_TITLE.label",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.ADMIN_PHONE.label",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.ADMIN_FIRST_NAME.label",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.ADMIN_LAST_NAME.label",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SIGNING_OFFICER_EMAIL.label",
    "target": "Enter a signing officer's email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.BUSINESS_TYPE_ID.label",
    "target": "Type of business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.BUSINESS_SECTOR_ID.label",
    "target": "Nature of business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SOURCE_OF_FUNDS.label",
    "target": "Primary source of funds fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.OPERATING_UNDER_DIFFERENT_NAME.label",
    "target": "Does your business operate under a different name? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.OPERATING_BUSINESS_NAME.label",
    "target": "Company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.TAX_IDENTIFICATION_NUMBER.label",
    "target": "Federal Tax ID Number (EIN) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.ANNUAL_REVENUE.label",
    "target": "Gross annual sales (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.ANNUAL_DOMESTIC_VOLUME.label",
    "target": "Annual volume on application (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.ANNUAL_TRANSACTION_FREQUENCY.label",
    "target": "Annual number of transactions (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.TRANSACTION_PURPOSE.label",
    "target": "Purpose of transactions on application fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.TARGET_CUSTOMERS.label",
    "target": "Who do you market the products and services to? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.PUBLICLY_TRADED.label",
    "target": "This is a publicly traded company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.DIRECTORS_LISTED.label",
    "target": "I certify that all directors have been listed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.NO_BENEFICIAL_OWNERS.label",
    "target": "There are no beneficial owners with 25% or more ownership listed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_GETTING_STARTED_SECTION.title",
    "target": "Before you get started fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_ADMIN_REFERENCE_SECTION.title",
    "target": "Admin Reference Properties fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_SIGNING_OFFICER_QUESTION_SECTION.title",
    "target": "Are you considered a signing officer at your company? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_PERSONAL_INFORMATION_SECTION.title",
    "target": "Enter your personal information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_SIGNING_OFFICER_EMAIL_SECTION.title",
    "target": "Enter a signing officer's information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_HOME_ADDRESS_SECTION.title",
    "target": "Enter the signing officer's personal information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_BUSINESS_ADDRESS_SECTION.title",
    "target": "Enter the business address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_BUSINESS_DETAILS_SECTION.title",
    "target": "Enter the business details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_TRANSACTION_DETAILS_SECTION.title",
    "target": "Enter the business transaction details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_OWNERSHIP_AMOUNT_SECTION.title",
    "target": "How many individuals directly or indirectly own 25% or more of the business? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_PERSONAL_OWNERSHIP_SECTION.title",
    "target": "Please select the percentage of ownership fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_DIRECTORS_INFO_SECTION.title",
    "target": "Enter the directors information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_REVIEW_OWNERS_SECTION.title",
    "target": "Review the list of owners fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.USBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.USBusinessOnboarding.SECTION_TWO_FACTOR_SECTION.title",
    "target": "Protect your account against fraud with two-factor authentication fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboardingId",
    "source": "net.nanopay.sme.onboarding.BusinessOnboardingId.USER_ID.label",
    "target": "User Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboardingId",
    "source": "net.nanopay.sme.onboarding.BusinessOnboardingId.BUSINESS_ID.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.PROHIBITED_MESSAGE",
    "target": "You do not have permission to update a submitted onboard profile. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.PLACE_HOLDER",
    "target": "Please select... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_ID.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.BIRTHDAY.label",
    "target": "Date of birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.PEPHIORELATED.label",
    "target": "I am a politically exposed person or head of an international organization (PEP/HIO) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.THIRD_PARTY.label",
    "target": "I am taking instructions from and/or conducting transactions on behalf of a 3rd party fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.ADMIN_JOB_TITLE.label",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.ADMIN_PHONE.label",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.ADMIN_FIRST_NAME.label",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.ADMIN_LAST_NAME.label",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SIGNING_OFFICER_EMAIL.label",
    "target": "Enter a signing officer's email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_TYPE_ID.label",
    "target": "Type of business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.BUSINESS_SECTOR_ID.label",
    "target": "Nature of business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SOURCE_OF_FUNDS.label",
    "target": "Primary source of funds fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.OPERATING_UNDER_DIFFERENT_NAME.label",
    "target": "Does your business operate under a different name? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.OPERATING_BUSINESS_NAME.label",
    "target": "Company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_REVENUE.label",
    "target": "Gross annual sales (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_DOMESTIC_VOLUME.label",
    "target": "Annual volume on application (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.ANNUAL_TRANSACTION_FREQUENCY.label",
    "target": "Annual number of transactions (estimated) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.TRANSACTION_PURPOSE.label",
    "target": "Purpose of transactions on application fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.TARGET_CUSTOMERS.label",
    "target": "Who do you market the products and services to? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.PUBLICLY_TRADED.label",
    "target": "This is a publicly traded company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.DIRECTORS_LISTED.label",
    "target": "I certify that all directors have been listed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.NO_BENEFICIAL_OWNERS.label",
    "target": "There are no beneficial owners with 25% or more ownership listed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_GETTING_STARTED_SECTION.title",
    "target": "Before you get started fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_ADMIN_REFERENCE_SECTION.title",
    "target": "Admin Reference Properties fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_SIGNING_OFFICER_QUESTION_SECTION.title",
    "target": "Are you considered a signing officer at the company? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_PERSONAL_INFORMATION_SECTION.title",
    "target": "Enter your personal information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_SIGNING_OFFICER_EMAIL_SECTION.title",
    "target": "Enter a signing officer's information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_HOME_ADDRESS_SECTION.title",
    "target": "Enter the signing officer's personal information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_BUSINESS_ADDRESS_SECTION.title",
    "target": "Enter the business address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_BUSINESS_DETAILS_SECTION.title",
    "target": "Enter the business details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_TRANSACTION_DETAILS_SECTION.title",
    "target": "Enter the business transaction details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_OWNERSHIP_AMOUNT_SECTION.title",
    "target": "How many individuals directly or indirectly own 25% or more of the business? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_PERSONAL_OWNERSHIP_SECTION.title",
    "target": "Please select the percentage of ownership fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_DIRECTORS_INFO_SECTION.title",
    "target": "Enter the directors information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_REVIEW_OWNERS_SECTION.title",
    "target": "Review the list of owners fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.BusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.BusinessOnboarding.SECTION_TWO_FACTOR_SECTION.title",
    "target": "Protect your account against fraud with two-factor authentication fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboardingId",
    "source": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboardingId.USER_ID.label",
    "target": "User Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboardingId",
    "source": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboardingId.BUSINESS_ID.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.PROHIBITED_MESSAGE",
    "target": "You do not have permission to update a submitted onboard profile. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.BUSINESS_ID.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.TAX_IDENTIFICATION_NUMBER.label",
    "target": "Federal Tax ID Number (EIN) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SECTION_GETTING_STARTED_SECTION.title",
    "target": "Before you get started fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SECTION_ADMIN_REFERENCE_SECTION.title",
    "target": "Admin Reference Properties fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding",
    "source": "net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SECTION_INTERNATIONAL_TRANSACTION_SECTION.title",
    "target": "We need some more information about your business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.PayeePayerSearchView",
    "source": "net.nanopay.tx.ui.PayeePayerSearchView.PAYER_OR_PAYEE_NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.Institution",
    "source": "net.nanopay.payment.Institution.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.Institution",
    "source": "net.nanopay.payment.Institution.COUNTRY_ID.label",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.Institution",
    "source": "net.nanopay.payment.Institution.SWIFT_CODE.label",
    "target": "SWIFT Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccount",
    "source": "net.nanopay.bank.BankAccount.BANK_ACCOUNT_LABEL",
    "target": "Bank Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccount",
    "source": "net.nanopay.bank.BankAccount.ACCOUNT_NUMBER_REQUIRED",
    "target": "Account number required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccount",
    "source": "net.nanopay.bank.BankAccount.ACCOUNT_NUMBER_INVALID",
    "target": "Account number invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccount",
    "source": "net.nanopay.bank.BankAccount.NICKNAME_REQUIRED",
    "target": "Nickname required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccount",
    "source": "net.nanopay.bank.BankAccount.ACCOUNT_NUMBER.label",
    "target": "Account No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccount",
    "source": "net.nanopay.bank.BankAccount.FLAG_IMAGE.label",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccount",
    "source": "net.nanopay.bank.BankAccount.NAME.label",
    "target": "Nickname fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.CONFIRM_RELATIONSHIP",
    "target": "I confirm that I have a business relationship with this contact and\n        acknowledge that the bank account info entered by the contact\n        business will be used for all deposits to their account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.INVITE_LABEL",
    "target": "Invite this contact to join Ablii fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.RESTRICT_INVITE_LABEL",
    "target": "This contact cannot be invited to join Ablii fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.ORGANIZATION.label",
    "target": "Business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.LEGAL_NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.EMAIL.label",
    "target": "Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.SIGN_UP_STATUS.label",
    "target": "Status fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.SECTION_STEP_ONE.title",
    "target": "Create a contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.SECTION_STEP_ONE.subTitle",
    "target": "\n        Create a new contact by entering in their business information below.\n        If you have their banking information, you can start sending payments\n        to the contact right away.\n       fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.SECTION_STEP_TWO.title",
    "target": "Add banking information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.SECTION_STEP_TWO.subTitle",
    "target": "\n        Enter the contact’s bank account information. Please make sure that this is\n        accurate as payments will go directly to the specified account.\n       fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.SECTION_STEP_THREE.title",
    "target": "Add business address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.Contact",
    "source": "net.nanopay.contacts.Contact.SECTION_STEP_THREE.subTitle",
    "target": "\n        In order to send payments to this business, we’ll need you to verify their\n        business address below.\n       fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ETALineItem",
    "source": "net.nanopay.tx.ETALineItem.ETA.label",
    "target": "ETA fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.InvoiceLineItem",
    "source": "net.nanopay.invoice.InvoiceLineItem.GROUP.label",
    "target": "Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.xero.model.XeroInvoice",
    "source": "net.nanopay.accounting.xero.model.XeroInvoice.LAST_DATE_UPDATED.label",
    "target": "Xero Last Updated fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.quickbooks.model.QuickbooksInvoice",
    "source": "net.nanopay.accounting.quickbooks.model.QuickbooksInvoice.LAST_DATE_UPDATED.label",
    "target": "Quickbooks Last Updated fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.MISSING_CONTACT",
    "target": "Missing Contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.INVALID_CURRENCY",
    "target": "Invalid Currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.UNAUTHORIZED_INVOICE",
    "target": "Draft Xero Invoice fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.MISSING_BUSINESS_EMAIL",
    "target": "Missing Business Name & Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.MISSING_BUSINESS",
    "target": "Missing Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.MISSING_EMAIL",
    "target": "Missing Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.MISS_ADDRESS",
    "target": "Missing Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.OTHER",
    "target": "Other fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.EXISTING_USER_CONTACT",
    "target": "There is a contact who is also a user with that email. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.EXISTING_CONTACT",
    "target": "There is an existing contact with that email. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.EXISTING_USER",
    "target": "There is already a user with that email. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingIntegrationUtil",
    "source": "net.nanopay.accounting.AccountingIntegrationUtil.EXISTING_USER_MULTI",
    "target": "The user belongs to multiple businesses. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.crunch.CrunchController",
    "source": "foam.u2.crunch.CrunchController.CANNOT_OPEN_GRANTED",
    "target": "This capability has already been granted to you. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.crunch.CrunchController",
    "source": "foam.u2.crunch.CrunchController.CANNOT_OPEN_PENDING",
    "target": "This capability is awaiting approval, updates are not permitted at this time. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SuccessPasswordView",
    "source": "net.nanopay.sme.ui.SuccessPasswordView.INSTRUCTIONS",
    "target": "Successfully reset password! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SuccessPasswordView",
    "source": "net.nanopay.sme.ui.SuccessPasswordView.RESET_PASSWORD",
    "target": "Reset you password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SuccessPasswordView",
    "source": "net.nanopay.sme.ui.SuccessPasswordView.BACK_TO",
    "target": "Back to sign in fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddressView",
    "source": "net.nanopay.sme.ui.AddressView.PROVINCE_LABEL",
    "target": "Province/State fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddressView",
    "source": "net.nanopay.sme.ui.AddressView.POSTAL_CODE",
    "target": "Postal Code/ZIP Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddressView",
    "source": "net.nanopay.sme.ui.AddressView.PLACE_HOLDER",
    "target": "Please select... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddressView",
    "source": "net.nanopay.sme.ui.AddressView.PO_DISCLAIMER",
    "target": "* PO Boxes are not Allowed fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.BusinessUserJunctionId",
    "source": "net.nanopay.model.BusinessUserJunctionId.SOURCE_ID.label",
    "target": "Source Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.BusinessUserJunctionId",
    "source": "net.nanopay.model.BusinessUserJunctionId.TARGET_ID.label",
    "target": "Target Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorSignInView",
    "source": "net.nanopay.sme.ui.TwoFactorSignInView.TWO_FACTOR_NO_TOKEN",
    "target": "Please enter a verification code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorSignInView",
    "source": "net.nanopay.sme.ui.TwoFactorSignInView.TWO_FACTOR_LABEL",
    "target": "Enter verification code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorSignInView",
    "source": "net.nanopay.sme.ui.TwoFactorSignInView.TWO_FACTOR_ERROR",
    "target": "Incorrect code. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorSignInView",
    "source": "net.nanopay.sme.ui.TwoFactorSignInView.TWO_FACTOR_TITLE",
    "target": "Two-factor authentication fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorSignInView",
    "source": "net.nanopay.sme.ui.TwoFactorSignInView.TWO_FACTOR_EXPLANATION",
    "target": "Open your Google Authenticator app on your mobile device to view the 6-digit code and verify your identity fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorSignInView",
    "source": "net.nanopay.sme.ui.TwoFactorSignInView.TWO_FACTOR_NOTES_1",
    "target": "Need another way to authenticate? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorSignInView",
    "source": "net.nanopay.sme.ui.TwoFactorSignInView.TWO_FACTOR_NOTES_2",
    "target": "Contact us fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorSignInView",
    "source": "net.nanopay.sme.ui.TwoFactorSignInView.GO_BACK",
    "target": "Go to ablii.com fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.TITLE",
    "target": "Check your email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.INSTRUCTIONS1",
    "target": "We've sent an email to  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.INSTRUCTIONS2",
    "target": " with a link to activate your account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.NO_EMAIL_LINK",
    "target": "Don't see the email? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.RESEND_EMAIL_LINK",
    "target": "Resend the email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.NO_EMAIL_INSTRUCTIONS_1",
    "target": "If you don't see an email from us within a few minutes, the following may have happened: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.NO_EMAIL_INSTRUCTIONS_2",
    "target": "The email went into your spam folder. (We know it's a scary place to look at, but it might be in there!) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.NO_EMAIL_INSTRUCTIONS_3",
    "target": "The email you entered may have had typo. (Don't sweat it, we type fast too! It happens) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.NO_EMAIL_INSTRUCTIONS_4",
    "target": "We can't send emails to this address. (You might have strong filtering or corporate firewalls) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmailView",
    "source": "net.nanopay.sme.ui.VerifyEmailView.NO_EMAIL_INSTRUCTIONS_5",
    "target": "If none of the above helped, we can simply fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PadCapture",
    "source": "net.nanopay.model.PadCapture.ACCEPTANCE_TIME.label",
    "target": "Time of Acceptance fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PadCapture",
    "source": "net.nanopay.model.PadCapture.FIRST_NAME.label",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PadCapture",
    "source": "net.nanopay.model.PadCapture.LAST_NAME.label",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PadCapture",
    "source": "net.nanopay.model.PadCapture.ADDRESS.label",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.PadCapture",
    "source": "net.nanopay.model.PadCapture.ACCOUNT_NUMBER.label",
    "target": "Account Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.TITLE",
    "target": "Create a free account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.FOOTER_TXT",
    "target": "Already have an account? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.FOOTER_LINK",
    "target": "Sign in fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.ERROR_MSG",
    "target": "There was a problem creating your account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.SELECTION_TEXT",
    "target": "Select your country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.SELECTION",
    "target": "Please select... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.VALIDATION_ERR_TEXT",
    "target": "Please enter job title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.ORGANIZATION.label",
    "target": "Company Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.COUNTRY_ID.label",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.USER_NAME.label",
    "target": "Username fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignUp",
    "source": "foam.nanos.u2.navigation.SignUp.DESIRED_PASSWORD.label",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.crunch.CapabilityInterceptView",
    "source": "foam.u2.crunch.CapabilityInterceptView.REJECTED_MSG",
    "target": "Your choice to bypass this was stored, please refresh page to revert cancel selection. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.EasyDAO",
    "source": "foam.dao.EasyDAO.GUID.label",
    "target": "GUID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.CAPadCapture",
    "source": "net.nanopay.model.CAPadCapture.INVALID_ACCOUNT_NUMBER",
    "target": "Invalid account number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.CAPadCapture",
    "source": "net.nanopay.model.CAPadCapture.INVALID_INSTITUTION_NUMBER",
    "target": "Invalid institution number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.CAPadCapture",
    "source": "net.nanopay.model.CAPadCapture.INVALID_TRANSIT_NUMBER",
    "target": "Invalid transit number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.CAPadCapture",
    "source": "net.nanopay.model.CAPadCapture.BRANCH_ID.label",
    "target": "Transit No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.CAPadCapture",
    "source": "net.nanopay.model.CAPadCapture.INSTITUTION_NUMBER.label",
    "target": "Inst No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.CAPadCapture",
    "source": "net.nanopay.model.CAPadCapture.ACCOUNT_NUMBER.label",
    "target": "Account No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.USPadCapture",
    "source": "net.nanopay.model.USPadCapture.INVALID_ACCOUNT_NUMBER",
    "target": "Invalid account number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.USPadCapture",
    "source": "net.nanopay.model.USPadCapture.INVALID_BRANCH",
    "target": "Invalid transit number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.USPadCapture",
    "source": "net.nanopay.model.USPadCapture.BRANCH_ID.label",
    "target": "ACH Routing Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.USPadCapture",
    "source": "net.nanopay.model.USPadCapture.ACCOUNT_NUMBER.label",
    "target": "ACH Account Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.SignUp",
    "source": "net.nanopay.model.SignUp.DISCLAIMER",
    "target": "*Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.SignUp",
    "source": "net.nanopay.model.SignUp.DESIRED_PASSWORD.label",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.theme.ThemeDomain",
    "source": "foam.nanos.theme.ThemeDomain.ID.label",
    "target": "Domain fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.Step1",
    "target": "Step  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.Step2",
    "target": " :Pre-authorized debit confirmation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelFirstName",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelLastName",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelCountry",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelStreetNumber",
    "target": "Street Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelStreetName",
    "target": "Street Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelAddress2",
    "target": "Address 2 (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.Address2Hint",
    "target": "Apartment, suite, unit, building, floor, etc. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelCity",
    "target": "City fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelRegion",
    "target": "Region fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelPostal",
    "target": "Postal Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelAccount",
    "target": "Account Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelInstitute",
    "target": "Institution Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.LabelTransit",
    "target": "Transit Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.TC1",
    "target": "I authorize nanopay Corporation to withdraw from my (debit)account with the financial institution listed above from time to time for the amount that I specify when processing a one-time (\"sporadic\") pre-authorized debit. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.TC2",
    "target": "I have certain recourse rights if any debit does not comply with this agreement. For example, I have right to receive reimbursement for any debit that is not authorized or is not consistent with the PAD Agreement. To obtain more information on my recourse rights, I may contact my financial institution or visit  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.TC3",
    "target": "This Authorization may be cancelled at any time upon notice being provided by me, either in writing or orally, with proper authorization to verify my identity. I acknowledge that I can obtain a sample cancellation form or further information on my right to cancel this Agreement from nanopay Corporation or by visiting  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.link",
    "target": "www.payments.ca. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.Accept",
    "target": "I Agree fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.Back",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization.BANK_ADDRESS_TITLE",
    "target": "Bank Branch Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.TopNavigation",
    "source": "foam.nanos.u2.navigation.TopNavigation.GREETING",
    "target": "Welcome fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.TRANSIT_NUMBER_REQUIRED",
    "target": "Transit number required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.TRANSIT_NUMBER_FORMAT",
    "target": "Transit number must contain numbers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.TRANSIT_NUMBER_FIVE",
    "target": "Transit number must be 5 digits long. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.ACCOUNT_NUMBER_REQUIRED",
    "target": "Account number required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.ACCOUNT_NUMBER_INVALID",
    "target": "Account number must be between 6 and 17 digits long. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.INSTITUTION_NUMBER_REQUIRED",
    "target": "Institution number required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.INSTITUTION_NUMBER_THREE",
    "target": "Institution number must be 3 digits long. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.ADD_SUCCESSFUL",
    "target": "Bank Account added successfully! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.SECTION_DETAILS_TITLE_CONTACT",
    "target": "Add contact bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.SECTION_DETAILS_TITLE_VOID",
    "target": "Connect using a void check fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.BRANCH_ID.label",
    "target": "Transit No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.INSTITUTION_NUMBER.label",
    "target": "Inst. No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.SECTION_ACCOUNT_DETAILS.title",
    "target": "function(forContact) {\n        return forContact ? this.SECTION_DETAILS_TITLE_CONTACT : this.SECTION_DETAILS_TITLE_VOID;\n      } fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.SECTION_ACCOUNT_DETAILS.subTitle",
    "target": "Connect to the account without signing in to online banking.\n          Please ensure the details are entered properly. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.SECTION_PAD.title",
    "target": "Connect using a void check fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.CABankAccount",
    "source": "net.nanopay.bank.CABankAccount.SECTION_PAD.subTitle",
    "target": "Connect to your account without signing in to online banking. \n          Please ensure your details are entered properly. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.DROP_ZONE_TITLE",
    "target": "DRAG & DROP YOUR VOID CHECK OR STATEMENT HERE fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.ROUTING_NUMBER_REQUIRED",
    "target": "Routing number required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.ROUTING_NUMBER_INVALID",
    "target": "Routing number must be 9 digits long. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.ACCOUNT_NUMBER_REQUIRED",
    "target": "Account number required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.ACCOUNT_NUMBER_INVALID",
    "target": "Account number must be between 6 and 17 digits long. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.IMAGE_REQUIRED",
    "target": "Please attach a void check or a 3 month bank statement. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.ADD_SUCCESSFUL",
    "target": "Bank Account added successfully! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.SECTION_DETAILS_TITLE_CONTACT",
    "target": "Add contact bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.SECTION_DETAILS_TITLE_VOID",
    "target": "Connect using a void check fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.BRANCH_ID.label",
    "target": "ACH Routing Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.ACCOUNT_NUMBER.label",
    "target": "ACH Account Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.BRANCH.label",
    "target": "Routing No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.SUPPORTING_DOCUMENTS.label",
    "target": "Please upload either an image of a void check or a bank statement from within\n          the past 3 months to verify ownership of this bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.SECTION_ACCOUNT_DETAILS.title",
    "target": "function(forContact) {\n        return forContact ? this.SECTION_DETAILS_TITLE_CONTACT : this.SECTION_DETAILS_TITLE_VOID;\n      } fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.SECTION_ACCOUNT_DETAILS.subTitle",
    "target": "Connect to the account without signing in to online banking.\n          Please ensure the details are entered properly. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.SECTION_PAD.title",
    "target": "Connect using a void check fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.USBankAccount",
    "source": "net.nanopay.bank.USBankAccount.SECTION_PAD.subTitle",
    "target": "Connect to your account without signing in to online banking. \n          Please ensure your details are entered properly. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.controller.ApplicationController",
    "source": "foam.nanos.controller.ApplicationController.GROUP_FETCH_ERR",
    "target": "Error fetching group fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.controller.ApplicationController",
    "source": "foam.nanos.controller.ApplicationController.GROUP_NULL_ERR",
    "target": "Group was null fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.controller.ApplicationController",
    "source": "foam.nanos.controller.ApplicationController.LOOK_AND_FEEL_NOT_FOUND",
    "target": "Could not fetch look and feel object. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.COMPLIANCE_NOT_REQUESTED_NO_BANK",
    "target": "Please complete your business profile and add a bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.COMPLIANCE_NOT_REQUESTED_BANK_NEED_VERIFY",
    "target": "Please verify your bank account and complete your business profile to submit your account for review. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.COMPLIANCE_NOT_REQUESTED_BANK_VERIFIED",
    "target": "Please complete your business profile to submit your account for review. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.COMPLIANCE_REQUESTED_NO_BANK",
    "target": "Please add a bank account to submit your account for review. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.COMPLIANCE_REQUESTED_BANK_NEED_VERIFY",
    "target": "Please verify your bank account to submit your account for review. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.COMPLIANCE_PASSED_NO_BANK",
    "target": "Please add a bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.COMPLIANCE_PASSED_BANK_NEED_VERIFY",
    "target": "Please verify your bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.BUSINESS_INFO_UNDER_REVIEW",
    "target": "Our compliance team is reviewing the information you have submitted. Your account will be updated in 1-3 business days. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.PASSED_BANNER",
    "target": "Congratulations, your business is now fully verified! You're now ready to make domestic payments! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.PASSED_BANNER_DOMESTIC_US",
    "target": "Congratulations, your business is now fully verified! You're now ready to send and receive payments between Canada and the US! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.PASSED_BANNER_INTERNATIONAL",
    "target": "Congratulations, your business is now fully verified! You're now ready to make domestic and international payments to USA! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.TWO_FACTOR_REQUIRED_ONE",
    "target": "For your security, two factor authentication is required to send payment. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.TWO_FACTOR_REQUIRED_TWO",
    "target": "Click here to set up. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.HAS_NOT_PASSED_COMPLIANCE",
    "target": "Our team is reviewing your account. Once it is approved, you can complete this action. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.QUERY_BANK_AMOUNT_ERROR",
    "target": "An unexpected error occurred while counting the number of bank accounts the user has:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.ADDED_TO_BUSINESS_1",
    "target": "You've been successfully added to  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.ADDED_TO_BUSINESS_2",
    "target": ". Welcome to Ablii! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.ABILITY_TO_PAY_ERROR",
    "target": "Error occurred when checking the ability to send payment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.ABILITY_TO_RECEIVE_ERROR",
    "target": "Error occurred when checking the ability to receive payment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.FETCH_MENU_ERROR",
    "target": "Error occurred when fetching menu fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.QUERY_SIGNING_OFFICERS_ERROR",
    "target": "An unexpected error occurred while querying signing officers:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.SELECT_BUSINESS_WARNING",
    "target": "Please select a business before proceeding fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.INVALID_TOKEN_ERROR_TITLE",
    "target": "We’re Sorry fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.INVALID_TOKEN_ERROR_1",
    "target": "It looks like you’re trying to accept an invitation, but the invitation has been revoked. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.Controller",
    "source": "net.nanopay.ui.Controller.INVALID_TOKEN_ERROR_2",
    "target": "If you feel you’ve reached this message in error, please contact your Company Administrator. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.box.SessionReplyBox",
    "source": "foam.box.SessionReplyBox.REFRESH_MSG",
    "target": "Your session has expired. The page will now be refreshed so that you can log in again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.analytics.CandlestickId",
    "source": "foam.nanos.analytics.CandlestickId.CLOSE_TIME.label",
    "target": "Close Time fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.analytics.CandlestickId",
    "source": "foam.nanos.analytics.CandlestickId.KEY.label",
    "target": "Key fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ruler.Rule",
    "source": "foam.nanos.ruler.Rule.DAO_KEY.label",
    "target": "DAO Key fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.PublicBusinessInfo",
    "source": "net.nanopay.auth.PublicBusinessInfo.ID.label",
    "target": "Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.PublicBusinessInfo",
    "source": "net.nanopay.auth.PublicBusinessInfo.OPERATING_BUSINESS_NAME.label",
    "target": "Company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.PublicBusinessInfo",
    "source": "net.nanopay.auth.PublicBusinessInfo.BUSINESS_NAME.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.PublicBusinessInfo",
    "source": "net.nanopay.auth.PublicBusinessInfo.ORGANIZATION.label",
    "target": "Company Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.PublicBusinessInfo",
    "source": "net.nanopay.auth.PublicBusinessInfo.ADDRESS.label",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.PublicBusinessInfo",
    "source": "net.nanopay.auth.PublicBusinessInfo.BUSINESS_SECTOR_ID.label",
    "target": "Business Sector Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingContactEmailCacheId",
    "source": "net.nanopay.accounting.AccountingContactEmailCacheId.QUICK_ID.label",
    "target": "Quick Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingContactEmailCacheId",
    "source": "net.nanopay.accounting.AccountingContactEmailCacheId.REALM_ID.label",
    "target": "Realm Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.AccountingContactEmailCacheId",
    "source": "net.nanopay.accounting.AccountingContactEmailCacheId.XERO_ID.label",
    "target": "Xero Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.security.csp.CSPViolation",
    "source": "net.nanopay.security.csp.CSPViolation.EFFECTIVE_DIRECTIVE.label",
    "target": "Violating Directive fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.ID.label",
    "target": "Business ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.NAME.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.OWNER.label",
    "target": "Business Owner fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.COUNTRY.label",
    "target": "Country of Origin fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.ONBOARDED.label",
    "target": "Business Verification fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.BANK_ACCOUNT_ADDED.label",
    "target": "Bank Added fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.DATE_SUBMITTED.label",
    "target": "Date Submitted fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.OPS_REVIEW.label",
    "target": "Ops Review fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.COMPLIANCE_REVIEW.label",
    "target": "Compliance Review fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.STATUS.label",
    "target": "ComplianceStatus fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.DECLINED_REASON.label",
    "target": "Reason if Declined fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.NOT_INTERESTED_REASON.label",
    "target": "Reason for No Longer Interested fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.NUM_OF_TRANSACTION.label",
    "target": "Number of Transactions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.DECISION_DATE.label",
    "target": "Decision Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.IP.label",
    "target": "IP Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.AbliiBusinessReport",
    "source": "net.nanopay.meter.report.AbliiBusinessReport.EMAIL.label",
    "target": "Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.afex.AFEXBeneficiary",
    "source": "net.nanopay.fx.afex.AFEXBeneficiary.CREATED.label",
    "target": "Creation Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.afex.AFEXBusiness",
    "source": "net.nanopay.fx.afex.AFEXBusiness.CREATED.label",
    "target": "Creation Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.UserUserJunctionId",
    "source": "foam.nanos.auth.UserUserJunctionId.SOURCE_ID.label",
    "target": "Source Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.UserUserJunctionId",
    "source": "foam.nanos.auth.UserUserJunctionId.TARGET_ID.label",
    "target": "Target Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.ascendantfx.AscendantUserPayeeJunction",
    "source": "net.nanopay.fx.ascendantfx.AscendantUserPayeeJunction.CREATED.label",
    "target": "Creation Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.Capability",
    "source": "foam.nanos.crunch.Capability.SECTION__DEFAULT_SECTION.title",
    "target": "Administrative fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.Capability",
    "source": "foam.nanos.crunch.Capability.SECTION_BASIC_INFO.title",
    "target": "Basic Info fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.Capability",
    "source": "foam.nanos.crunch.Capability.SECTION_UI_SETTINGS.title",
    "target": "UI Settings fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.Capability",
    "source": "foam.nanos.crunch.Capability.SECTION_CAPABILITY_RELATIONSHIPS.title",
    "target": "Capability Relationships fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.ConditionResult",
    "source": "net.nanopay.meter.compliance.identityMind.ConditionResult.FIRED_STRING.label",
    "target": "Fired fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.email.DoNotSolicit",
    "source": "net.nanopay.auth.email.DoNotSolicit.ID.label",
    "target": "Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.model.AddressModel",
    "source": "net.nanopay.flinks.model.AddressModel.ADDRESS_ERROR",
    "target": "Street address is invalid fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.model.AddressModel",
    "source": "net.nanopay.flinks.model.AddressModel.ADDRESS_CITY_ERROR",
    "target": "City name is invalid fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.model.AddressModel",
    "source": "net.nanopay.flinks.model.AddressModel.ADDRESS_PROVINCE_ERROR",
    "target": "Invalid province option fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.model.AddressModel",
    "source": "net.nanopay.flinks.model.AddressModel.ADDRESS_POSTAL_ERROR",
    "target": "Invalid postal code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.HtmlDoc",
    "source": "foam.nanos.auth.HtmlDoc.ISSUED_DATE.label",
    "target": "Effective Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.IpHistory",
    "source": "net.nanopay.meter.IpHistory.IP_ADDRESS.label",
    "target": "IP Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.logger.LogMessage",
    "source": "foam.nanos.logger.LogMessage.MESSAGE.label",
    "target": "Log Message fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.LoginAttempt",
    "source": "net.nanopay.auth.LoginAttempt.IP_ADDRESS.label",
    "target": "IP Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.LoginAttempt",
    "source": "net.nanopay.auth.LoginAttempt.LOGIN_IDENTIFIER.label",
    "target": "Login Identifier fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.LoginAttempt",
    "source": "net.nanopay.auth.LoginAttempt.LOGIN_ATTEMPTED_FOR.label",
    "target": "User ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.notification.NotificationSetting",
    "source": "foam.nanos.notification.NotificationSetting.LACKS_CREATE_PERMISSION",
    "target": "You don't have permission to create this notification setting. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.notification.NotificationSetting",
    "source": "foam.nanos.notification.NotificationSetting.LACKS_UPDATE_PERMISSION",
    "target": "You don't have permission to update notification settings you do not own. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.notification.NotificationSetting",
    "source": "foam.nanos.notification.NotificationSetting.LACKS_DELETE_PERMISSION",
    "target": "You don't have permission to delete notification settings you do not own. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.notification.NotificationSetting",
    "source": "foam.nanos.notification.NotificationSetting.LACKS_READ_PERMISSION",
    "target": "You don't have permission to read notification settings you do not own. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.PaymentCode",
    "source": "net.nanopay.payment.PaymentCode.LACKS_CREATE_PERMISSION",
    "target": "You do not have permission to create a payment code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.PaymentCode",
    "source": "net.nanopay.payment.PaymentCode.LACKS_READ_PERMISSION",
    "target": "You do not have permission to read this payment code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.PaymentCode",
    "source": "net.nanopay.payment.PaymentCode.LACKS_UPDATE_PERMISSION",
    "target": "You do not have permission to update this payment code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.PaymentCode",
    "source": "net.nanopay.payment.PaymentCode.LACKS_REMOVE_PERMISSION",
    "target": "You do not have permission to remove this payment code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMId",
    "source": "foam.nanos.pm.PMId.CLASS_TYPE.label",
    "target": "Class Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMId",
    "source": "foam.nanos.pm.PMId.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMId",
    "source": "foam.nanos.pm.PMId.START_TIME.label",
    "target": "Start Time fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.quickbooks.QuickbooksConfig",
    "source": "net.nanopay.accounting.quickbooks.QuickbooksConfig.INTUIT_ACCOUNTING_APIHOST.label",
    "target": "Intuit Accounting API Host fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.SecurityPriceId",
    "source": "net.nanopay.fx.SecurityPriceId.SECURITY.label",
    "target": "Security fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.SecurityPriceId",
    "source": "net.nanopay.fx.SecurityPriceId.CURRENCY.label",
    "target": "Currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.session.Session",
    "source": "foam.nanos.session.Session.TTL.label",
    "target": "TTL fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.Argument",
    "source": "foam.nanos.dig.Argument.JAVA_TYPE.label",
    "target": "java Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.Argument",
    "source": "foam.nanos.dig.Argument.OF.label",
    "target": "of fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.Argument",
    "source": "foam.nanos.dig.Argument.OBJECT_TYPE.label",
    "target": "Object Value fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.Ticket",
    "source": "foam.nanos.ticket.Ticket.SECTION_INFO_SECTION.title",
    "target": "Ticket fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.Ticket",
    "source": "foam.nanos.ticket.Ticket.SECTION_META_SECTION.title",
    "target": "Audit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.Ticket",
    "source": "foam.nanos.ticket.Ticket.SECTION__DEFAULT_SECTION.title",
    "target": "Comments fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.TicketComment",
    "source": "foam.nanos.ticket.TicketComment.SECTION_INFO_SECTION.title",
    "target": "Comment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.TicketComment",
    "source": "foam.nanos.ticket.TicketComment.SECTION_META_SECTION.title",
    "target": "Audit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.TicketStatus",
    "source": "foam.nanos.ticket.TicketStatus.ID.label",
    "target": "Status fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.TransactionReport",
    "source": "net.nanopay.meter.report.TransactionReport.ID.label",
    "target": "Txn ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.TransactionReport",
    "source": "net.nanopay.meter.report.TransactionReport.PARENT.label",
    "target": "Parent Txn fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.TransactionReport",
    "source": "net.nanopay.meter.report.TransactionReport.CREATED.label",
    "target": "Created Time fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.TransactionReport",
    "source": "net.nanopay.meter.report.TransactionReport.PAYEE_ID.label",
    "target": "Payee ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.TransactionReport",
    "source": "net.nanopay.meter.report.TransactionReport.PAYER_ID.label",
    "target": "Payer ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.TransactionReport",
    "source": "net.nanopay.meter.report.TransactionReport.SOURCE_CURRENCY.label",
    "target": "Source Currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.report.TransactionReport",
    "source": "net.nanopay.meter.report.TransactionReport.STATUS_UPDATE_TIME.label",
    "target": "Status Update Time fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.TransactionPurpose",
    "source": "net.nanopay.tx.TransactionPurpose.PURPOSE_CODE.label",
    "target": "Purpose fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.email.EmailWhitelistEntry",
    "source": "net.nanopay.auth.email.EmailWhitelistEntry.ID.label",
    "target": "Email address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.LiquidCapability",
    "source": "net.nanopay.liquidity.crunch.LiquidCapability.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.LiquidCapability",
    "source": "net.nanopay.liquidity.crunch.LiquidCapability.SECTION__DEFAULT_SECTION.title",
    "target": "Permissions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.PaymentProviderCorridorJunctionId",
    "source": "net.nanopay.payment.PaymentProviderCorridorJunctionId.SOURCE_ID.label",
    "target": "Source Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.PaymentProviderCorridorJunctionId",
    "source": "net.nanopay.payment.PaymentProviderCorridorJunctionId.TARGET_ID.label",
    "target": "Target Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.model.P2PTxnRequest",
    "source": "net.nanopay.retail.model.P2PTxnRequest.REQUESTOR_EMAIL.label",
    "target": "Requestor's Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.model.P2PTxnRequest",
    "source": "net.nanopay.retail.model.P2PTxnRequest.REQUESTEE_EMAIL.label",
    "target": "Requestee's email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.model.P2PTxnRequest",
    "source": "net.nanopay.retail.model.P2PTxnRequest.DATE_REQUESTED.label",
    "target": "Date Requested fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.model.P2PTxnRequest",
    "source": "net.nanopay.retail.model.P2PTxnRequest.LAST_UPDATED.label",
    "target": "Last Updated fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.model.P2PTxnRequest",
    "source": "net.nanopay.retail.model.P2PTxnRequest.AMOUNT.label",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.alarming.AlarmConfig",
    "source": "foam.nanos.alarming.AlarmConfig.SEND_EMAIL.label",
    "target": "Notify fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovalRequest",
    "source": "foam.nanos.approval.ApprovalRequest.SUCCESS_APPROVED",
    "target": "You have successfully approved this request. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovalRequest",
    "source": "foam.nanos.approval.ApprovalRequest.SUCCESS_REJECTED",
    "target": "You have successfully rejected this request. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovalRequest",
    "source": "foam.nanos.approval.ApprovalRequest.SUCCESS_CANCELLED",
    "target": "You have successfully cancelled this request. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovalRequest",
    "source": "foam.nanos.approval.ApprovalRequest.REQUESTED",
    "target": "Pending fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovalRequest",
    "source": "foam.nanos.approval.ApprovalRequest.CLASSIFICATION.label",
    "target": "Approval Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovalRequest",
    "source": "foam.nanos.approval.ApprovalRequest.OPERATION.label",
    "target": "Action fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.ascendantfx.AscendantFXUser",
    "source": "net.nanopay.fx.ascendantfx.AscendantFXUser.USER.label",
    "target": "User ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.ascendantfx.AscendantFXUser",
    "source": "net.nanopay.fx.ascendantfx.AscendantFXUser.USER_STATUS.label",
    "target": "Status fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.ascendantfx.AscendantFXUser",
    "source": "net.nanopay.fx.ascendantfx.AscendantFXUser.CREATED.label",
    "target": "Creation Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.Invitation",
    "source": "net.nanopay.model.Invitation.TIMESTAMP.label",
    "target": "Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.Invitation",
    "source": "net.nanopay.model.Invitation.SECTION_INVITATION.title",
    "target": "Invite a contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.CapabilityCategoryCapabilityJunctionId",
    "source": "foam.nanos.crunch.CapabilityCategoryCapabilityJunctionId.SOURCE_ID.label",
    "target": "Source Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.CapabilityCategoryCapabilityJunctionId",
    "source": "foam.nanos.crunch.CapabilityCategoryCapabilityJunctionId.TARGET_ID.label",
    "target": "Target Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.CapabilityCapabilityJunctionId",
    "source": "foam.nanos.crunch.CapabilityCapabilityJunctionId.SOURCE_ID.label",
    "target": "Source Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.CapabilityCapabilityJunctionId",
    "source": "foam.nanos.crunch.CapabilityCapabilityJunctionId.TARGET_ID.label",
    "target": "Target Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.PrerequisiteCapabilityJunctionRefine",
    "source": "net.nanopay.crunch.PrerequisiteCapabilityJunctionRefine.SOURCE_ID.label",
    "target": "Top Level Capability fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.PrerequisiteCapabilityJunctionRefine",
    "source": "net.nanopay.crunch.PrerequisiteCapabilityJunctionRefine.TARGET_ID.label",
    "target": "Dependent fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.UserCapabilityJunctionId",
    "source": "foam.nanos.crunch.UserCapabilityJunctionId.SOURCE_ID.label",
    "target": "Source Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.crunch.UserCapabilityJunctionId",
    "source": "foam.nanos.crunch.UserCapabilityJunctionId.TARGET_ID.label",
    "target": "Target Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.NO_AMOUNT_OF_OWNERS_SELECTED_ERROR",
    "target": "Please select a number of owners. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.INVALID_OWNER_SELECTION_ERROR",
    "target": "One or more of the owner selection is invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.OWNER_1_ERROR",
    "target": "Owner1 is invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.OWNER_2_ERROR",
    "target": "Owner2 is invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.OWNER_3_ERROR",
    "target": "Owner3 is invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.OWNER_4_ERROR",
    "target": "Owner4 is invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.TOTAL_OWNERSHIP_ERROR",
    "target": "The total ownership should be less than 100%. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.PUBLICLY_TRADED.label",
    "target": "This is a publicly traded company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.NO_BENEFICIAL_OWNERS.label",
    "target": "There are no beneficial owners with 25% or more ownership listed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.SECTION_OWNERSHIP_AMOUNT_SECTION.title",
    "target": "How many individuals directly or indirectly own 25% or more of the business? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessOwnershipData.SECTION_REVIEW_OWNERS_SECTION.title",
    "target": "Review the list of owners fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.model.Device",
    "source": "net.nanopay.retail.model.Device.SERIAL_NUMBER.label",
    "target": "Serial No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.model.HolderModel",
    "source": "net.nanopay.flinks.model.HolderModel.EMAIL_ERROR",
    "target": "Invalid email address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.model.HolderModel",
    "source": "net.nanopay.flinks.model.HolderModel.PHONE_ERROR",
    "target": "Invalid phone number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.GroupPermissionJunctionId",
    "source": "foam.nanos.auth.GroupPermissionJunctionId.SOURCE_ID.label",
    "target": "Source Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.GroupPermissionJunctionId",
    "source": "foam.nanos.auth.GroupPermissionJunctionId.TARGET_ID.label",
    "target": "Target Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.history.HistoryRecordId",
    "source": "foam.dao.history.HistoryRecordId.OBJECT_ID.label",
    "target": "Updated Object fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.history.HistoryRecordId",
    "source": "foam.dao.history.HistoryRecordId.SEQ_NO.label",
    "target": "Seq No fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.history.HistoryRecord",
    "source": "foam.dao.history.HistoryRecord.OBJECT_ID.label",
    "target": "Updated Object fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.history.HistoryRecord",
    "source": "foam.dao.history.HistoryRecord.USER.label",
    "target": "Updated By fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.history.HistoryRecord",
    "source": "foam.dao.history.HistoryRecord.AGENT.label",
    "target": "Updated By fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.history.HistoryRecord",
    "source": "foam.dao.history.HistoryRecord.UPDATES.label",
    "target": "Updated Properties fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.Liquidity",
    "source": "net.nanopay.liquidity.Liquidity.REBALANCING_ENABLED.label",
    "target": "Automate Sweep fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.Liquidity",
    "source": "net.nanopay.liquidity.Liquidity.RESET_BALANCE.label",
    "target": "Reset balance to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.Liquidity",
    "source": "net.nanopay.liquidity.Liquidity.PUSH_PULL_ACCOUNT.label",
    "target": "Rebalancing Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.plaid.model.PlaidAccountDetailId",
    "source": "net.nanopay.plaid.model.PlaidAccountDetailId.USER_ID.label",
    "target": "User Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.plaid.model.PlaidAccountDetailId",
    "source": "net.nanopay.plaid.model.PlaidAccountDetailId.INSTITUTION_ID.label",
    "target": "Institution Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.plaid.model.PlaidAccountDetailId",
    "source": "net.nanopay.plaid.model.PlaidAccountDetailId.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.plaid.model.PlaidAccountDetailId",
    "source": "net.nanopay.plaid.model.PlaidAccountDetailId.MASK.label",
    "target": "Mask fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.SUGAR",
    "source": "foam.nanos.dig.SUGAR.SERVICE_KEY.label",
    "target": "Service fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.SUGAR",
    "source": "foam.nanos.dig.SUGAR.METHOD.label",
    "target": "Method fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.SUGAR",
    "source": "foam.nanos.dig.SUGAR.SUGAR_URL.label",
    "target": "URL fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.TransactionLimitId",
    "source": "net.nanopay.tx.model.TransactionLimitId.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.TransactionLimitId",
    "source": "net.nanopay.tx.model.TransactionLimitId.TIME_FRAME.label",
    "target": "Time Frame fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.model.TransactionLimitId",
    "source": "net.nanopay.tx.model.TransactionLimitId.TYPE.label",
    "target": "Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability.CAN_VIEW_ACCOUNT.label",
    "target": "View Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability.CAN_MAKE_ACCOUNT.label",
    "target": "Make Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability.CAN_APPROVE_ACCOUNT.label",
    "target": "Approve Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability.CAN_VIEW_TRANSACTION.label",
    "target": "View Transaction fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability.CAN_MAKE_TRANSACTION.label",
    "target": "Make Transaction fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability.CAN_APPROVE_TRANSACTION.label",
    "target": "Approve Transaction fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.AccountBasedLiquidCapability.CAN_VIEW_DASHBOARD.label",
    "target": "View Dashboard fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_VIEW_RULE.label",
    "target": "View Rule fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_MAKE_RULE.label",
    "target": "Make Rule fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_APPROVE_RULE.label",
    "target": "Approve Rule fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_VIEW_USER.label",
    "target": "View User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_MAKE_USER.label",
    "target": "Make User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_APPROVE_USER.label",
    "target": "Approve User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_VIEW_LIQUIDITYSETTINGS.label",
    "target": "View Liquidity Settings fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_MAKE_LIQUIDITYSETTINGS.label",
    "target": "Make Liquidity Settings fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_APPROVE_LIQUIDITYSETTINGS.label",
    "target": "Approve Liquidity Settings fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_VIEW_CAPABILITY.label",
    "target": "View Role fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_MAKE_CAPABILITY.label",
    "target": "Make Role fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_APPROVE_CAPABILITY.label",
    "target": "Approve Role fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_MAKE_CAPABILITYREQUEST.label",
    "target": "Make Role Assignment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_APPROVE_CAPABILITYREQUEST.label",
    "target": "Approve Role Assignment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.GlobalLiquidCapability",
    "source": "net.nanopay.liquidity.crunch.GlobalLiquidCapability.CAN_INGEST_FILE.label",
    "target": "Ingest File fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMInfoId",
    "source": "foam.nanos.pm.PMInfoId.CLS_NAME.label",
    "target": "Class fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMInfoId",
    "source": "foam.nanos.pm.PMInfoId.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMInfo",
    "source": "foam.nanos.pm.PMInfo.CLS_NAME.label",
    "target": "Class fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMInfo",
    "source": "foam.nanos.pm.PMInfo.COUNT.label",
    "target": "Count fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMInfo",
    "source": "foam.nanos.pm.PMInfo.MIN_TIME.label",
    "target": "Min fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMInfo",
    "source": "foam.nanos.pm.PMInfo.AVERAGE.label",
    "target": "Avg fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMInfo",
    "source": "foam.nanos.pm.PMInfo.MAX_TIME.label",
    "target": "Max fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.pm.PMInfo",
    "source": "foam.nanos.pm.PMInfo.TOTAL_TIME.label",
    "target": "Total fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityRequest",
    "source": "net.nanopay.liquidity.crunch.CapabilityRequest.REQUEST_TYPE.label",
    "target": "Step 1: Action fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityRequest",
    "source": "net.nanopay.liquidity.crunch.CapabilityRequest.ACCOUNT_BASED_CAPABILITY.label",
    "target": "Step 2: Choose a Transactional Role Template fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityRequest",
    "source": "net.nanopay.liquidity.crunch.CapabilityRequest.GLOBAL_CAPABILITY.label",
    "target": "Step 2: Choose an Administrative Role Template fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityRequest",
    "source": "net.nanopay.liquidity.crunch.CapabilityRequest.USERS.label",
    "target": "Step 3: Select user(s) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityRequest",
    "source": "net.nanopay.liquidity.crunch.CapabilityRequest.CAPABILITY_ACCOUNT_TEMPLATE_CHOICE.label",
    "target": "Step 5: Choose an Account Group (Legal Entity) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityRequest",
    "source": "net.nanopay.liquidity.crunch.CapabilityRequest.CAPABILITY_ACCOUNT_TEMPLATE_MAP.label",
    "target": "Create New Template Or Customize Chosen Account Group  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityRequest",
    "source": "net.nanopay.liquidity.crunch.CapabilityRequest.APPROVER_LEVEL.label",
    "target": "Transaction Authorization Level (if applicable) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityRequest",
    "source": "net.nanopay.liquidity.crunch.CapabilityRequest.LIFECYCLE_STATE.label",
    "target": "Status fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.model.Broker",
    "source": "net.nanopay.model.Broker.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.TxnProcessor",
    "source": "net.nanopay.tx.TxnProcessor.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.TxnProcessor",
    "source": "net.nanopay.tx.TxnProcessor.USER_ID.label",
    "target": "User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA.SECTION_AUTOMATED_REVIEW.title",
    "target": "Automated Review Engine Result fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA.SECTION_EVALUATED_TEST_RESULTS.title",
    "target": "Evaluated Test Results fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA.SECTION_TEST_RESULTS.title",
    "target": "Test Results fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponseEDNA.SECTION_EXTERNALIZED_EVALUATION.title",
    "target": "Externalized Evaluation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.secureFact.lev.LEVResponse",
    "source": "net.nanopay.meter.compliance.secureFact.lev.LEVResponse.CLOSE_MATCHES.label",
    "target": "Close Matches fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.InstitutionPurposeCode",
    "source": "net.nanopay.payment.InstitutionPurposeCode.INSTITUTION_ID.label",
    "target": "Institution fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.payment.InstitutionPurposeCode",
    "source": "net.nanopay.payment.InstitutionPurposeCode.TXN_PROCESSOR_ID.label",
    "target": "Payment Platform fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.TxnProcessorUserReference",
    "source": "net.nanopay.tx.TxnProcessorUserReference.PROCESSOR_ID.label",
    "target": "Processor fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.TxnProcessorUserReference",
    "source": "net.nanopay.tx.TxnProcessorUserReference.USER_ID.label",
    "target": "User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.USER.label",
    "target": "User reputation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.UPR.label",
    "target": "Previous reputation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.FRN.label",
    "target": "Fraud rule name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.FRP.label",
    "target": "Fraud evaluation result fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.FRD.label",
    "target": "Fraud rule description fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.ARPR.label",
    "target": "Automated review fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.ARPD.label",
    "target": "Automated review rule description fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.ARPID.label",
    "target": "Automated review rule id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.TID.label",
    "target": "IDM transaction id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.ERD.label",
    "target": "User reputation description fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.RES.label",
    "target": "Result of policy evaluation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.RCD.label",
    "target": "Result codes fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse",
    "source": "net.nanopay.meter.compliance.identityMind.IdentityMindResponse.EDNA_SCORE_CARD.label",
    "target": "eDNA Score Card fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DIG",
    "source": "foam.nanos.dig.DIG.ID.label",
    "target": "Request Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DIG",
    "source": "foam.nanos.dig.DIG.DAO_KEY.label",
    "target": "Data Access Object (DAO) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DIG",
    "source": "foam.nanos.dig.DIG.CMD.label",
    "target": "API Command fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DIG",
    "source": "foam.nanos.dig.DIG.FORMAT.label",
    "target": "Data Format fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DIG",
    "source": "foam.nanos.dig.DIG.KEY.label",
    "target": "Object ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DIG",
    "source": "foam.nanos.dig.DIG.Q.label",
    "target": "Select Query fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DIG",
    "source": "foam.nanos.dig.DIG.SNIPPET.label",
    "target": "Snippet fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.ComplianceItem",
    "source": "net.nanopay.meter.compliance.ComplianceItem.USER.label",
    "target": "User/Business ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.ComplianceItem",
    "source": "net.nanopay.meter.compliance.ComplianceItem.TRANSACTION.label",
    "target": "Transaction ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.ComplianceItem",
    "source": "net.nanopay.meter.compliance.ComplianceItem.ENTITY_LABEL.label",
    "target": "Entity Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.ComplianceItem",
    "source": "net.nanopay.meter.compliance.ComplianceItem.RESPONSE_ID.label",
    "target": "ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ClientUserQueryService",
    "source": "foam.nanos.auth.ClientUserQueryService.DELEGATE.label",
    "target": "Delegate fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TopNavigation",
    "source": "net.nanopay.ui.TopNavigation.GREETING",
    "target": "Welcome fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.NotificationMenuItem",
    "source": "foam.nanos.u2.navigation.NotificationMenuItem.INVALID_MENU",
    "target": "No menu in menuDAO with id: \"notifications\". fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.FooterView",
    "source": "net.nanopay.sme.ui.FooterView.CONTACT_SUPPORT",
    "target": "Contact Support fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.crunch.CapabilityStore",
    "source": "foam.u2.crunch.CapabilityStore.TAB_ALL",
    "target": "All fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.view.LoginView",
    "source": "foam.u2.view.LoginView.GO_BACK",
    "target": "Go to  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.view.LoginView",
    "source": "foam.u2.view.LoginView.MODE1",
    "target": "SignUp fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.mlang.expr.PropertyExpr",
    "source": "foam.mlang.expr.PropertyExpr.OF.label",
    "target": "Model fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.DevicesView",
    "source": "net.nanopay.retail.ui.devices.DevicesView.TitleAll",
    "target": "All Device(s) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.DevicesView",
    "source": "net.nanopay.retail.ui.devices.DevicesView.TitleActive",
    "target": "Active Device(s) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.DevicesView",
    "source": "net.nanopay.retail.ui.devices.DevicesView.TitleDisabled",
    "target": "Disabled Device(s) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.DevicesView",
    "source": "net.nanopay.retail.ui.devices.DevicesView.ActionAdd",
    "target": "Add a new device fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.DevicesView",
    "source": "net.nanopay.retail.ui.devices.DevicesView.placeholderText",
    "target": "You don't have any devices right now. Click Add a new device to add a device. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.IntegrationView",
    "source": "net.nanopay.settings.IntegrationView.noBank",
    "target": "No bank accounts found fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.IntegrationView",
    "source": "net.nanopay.settings.IntegrationView.noSign",
    "target": "Not signed in fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.IntegrationView",
    "source": "net.nanopay.settings.IntegrationView.bank",
    "target": "Bank accounts found fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.BankSyncView",
    "source": "net.nanopay.accounting.BankSyncView.balanceTitle",
    "target": "Balance fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.BankSyncView",
    "source": "net.nanopay.accounting.BankSyncView.placeholderText",
    "target": "You don’t have any cash in or cash out transactions. Verify a bank account to proceed to cash in or cash out. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DUGRule",
    "source": "foam.nanos.dig.DUGRule.DAO_KEY.label",
    "target": "DAO fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DUGRule",
    "source": "foam.nanos.dig.DUGRule.URL.label",
    "target": "URL fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PersonalSettingsView",
    "source": "net.nanopay.sme.ui.PersonalSettingsView.TITLE",
    "target": "Personal Settings fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PersonalSettingsView",
    "source": "net.nanopay.sme.ui.PersonalSettingsView.TWO_FACTOR_SUBTITLE",
    "target": "Two-factor Authentication fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PersonalSettingsView",
    "source": "net.nanopay.sme.ui.PersonalSettingsView.TwoFactorInstr1",
    "target": "Download and use your Google Authenticator  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PersonalSettingsView",
    "source": "net.nanopay.sme.ui.PersonalSettingsView.TwoFactorInstr2",
    "target": " app on your mobile device to scan the QR code. If you can’t use the QR code, you can enter the provided key into the Google Authenticator app manually. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PersonalSettingsView",
    "source": "net.nanopay.sme.ui.PersonalSettingsView.IOSName",
    "target": "iOS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PersonalSettingsView",
    "source": "net.nanopay.sme.ui.PersonalSettingsView.AndroidName",
    "target": "Android fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PersonalSettingsView",
    "source": "net.nanopay.sme.ui.PersonalSettingsView.StepOne",
    "target": "Step 1 fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PersonalSettingsView",
    "source": "net.nanopay.sme.ui.PersonalSettingsView.StepTwo",
    "target": "Step 2 fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.transaction.TransactionDAOBrowserView",
    "source": "net.nanopay.liquidity.ui.transaction.TransactionDAOBrowserView.LABEL_ACCOUNT_TITLE",
    "target": "Select an account to see associated transactions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.transaction.TransactionDAOBrowserView",
    "source": "net.nanopay.liquidity.ui.transaction.TransactionDAOBrowserView.NO_TRANSACTIONS",
    "target": "Selected account has no transactions. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.INTEGRATIONS_TITLE",
    "target": "Integrations fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.BANK_MATCHING_TITLE",
    "target": "Bank account matching fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.CONNECT_LABEL",
    "target": "Connect fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.DISCONNECT_LABEL",
    "target": "Disconnect fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.CONNECTED_LABEL",
    "target": "Connected fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.NOT_CONNECTED_LABEL",
    "target": "Not connected fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.YOUR_BANKS_LABEL",
    "target": "Your Ablii bank accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.ACCOUNTING_BANKS_LABEL",
    "target": "Bank accounts in your accounting software fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.BANK_MATCHING_DESC_1",
    "target": "Please select which accounts you would like to match between Ablii and  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.BANK_MATCHING_DESC_2",
    "target": " from the drop downs. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.BANK_MATCHING_DESC_3",
    "target": "This will ensure that all transactions completed on Ablii are mapped and reconciled to the correct account in  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.IntegrationSettingsView",
    "source": "net.nanopay.sme.ui.IntegrationSettingsView.TOKEN_EXPIRED",
    "target": "Please sync again to your accounting software to fetch the latest information. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PrivacyView",
    "source": "net.nanopay.sme.ui.PrivacyView.TITLE",
    "target": "Account Privacy fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PrivacyView",
    "source": "net.nanopay.sme.ui.PrivacyView.PRIVACY_TEXT",
    "target": "Your account is currently set as  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PrivacyView",
    "source": "net.nanopay.sme.ui.PrivacyView.PUBLIC_TEXT",
    "target": "Private Accounts can only be found and added with the Payment Code. Your business will be hidden from \"Search by Business Name\". fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PrivacyView",
    "source": "net.nanopay.sme.ui.PrivacyView.PRIVATE_TEXT",
    "target": "Public accounts allow other businesses to find your account through the \"Search by Business Name\". fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PrivacyView",
    "source": "net.nanopay.sme.ui.PrivacyView.PUBLIC_BTN_LABEL",
    "target": "Switch to public fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PrivacyView",
    "source": "net.nanopay.sme.ui.PrivacyView.PRIVATE_BTN_LABEL",
    "target": "Switch to private fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PrivacyView",
    "source": "net.nanopay.sme.ui.PrivacyView.ERROR_MSG",
    "target": "There was an error updating your privacy settings fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts",
    "source": "net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts.CARD_HEADER",
    "target": "ACCOUNTS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts",
    "source": "net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts.BALANCE_NOTE",
    "target": "Total value shown in home currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.RequireActionView",
    "source": "net.nanopay.sme.ui.dashboard.RequireActionView.NO_ACTION_REQUIRED",
    "target": "You're all caught up! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.RequireActionView",
    "source": "net.nanopay.sme.ui.dashboard.RequireActionView.UPCOMING_PAYABLES",
    "target": "Overdue & Upcoming fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.RequireActionView",
    "source": "net.nanopay.sme.ui.dashboard.RequireActionView.DEPOSIT_PAYMENT",
    "target": "Deposit payment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.RequireActionView",
    "source": "net.nanopay.sme.ui.dashboard.RequireActionView.REQUIRES_APPROVAL",
    "target": "Requires approval fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.RequireActionView",
    "source": "net.nanopay.sme.ui.dashboard.RequireActionView.NO_ACTIONS",
    "target": "No actions required. You're completely up to date! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.BusinessRule",
    "source": "net.nanopay.liquidity.tx.BusinessRule.NAME.label",
    "target": "Rule Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.NO_INFORMATION",
    "target": "Please fill out all necessary fields before proceeding. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.INVALID_PHONE",
    "target": "Phone Number is invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.INVALID_MOBILE",
    "target": "Mobile Phone Number is invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.INFORMATION_UPDATED",
    "target": "Information has been successfully changed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.FORM_ERROR",
    "target": "Error while saving your changes. Please review your input and try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.JOB_TITLE_EMPTY_ERROR",
    "target": "Job title can't be empty fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.JOB_TITLE_LENGTH_ERROR",
    "target": "Job title is too long fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.EMAIL_ERROR",
    "target": "Invalid email address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.TWO_FACTOR_NO_TOKEN_ERROR",
    "target": "Please enter a verification token. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.TWO_FACTOR_ENABLE_SUCCESS",
    "target": "Two-factor authentication enabled. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.TWO_FACTOR_ENABLE_ERROR",
    "target": "Could not enable two-factor authentication. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.TWO_FACTOR_DISABLE_SUCCESS",
    "target": "Two-factor authentication disabled. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.TWO_FACTOR_DISABLE_ERROR",
    "target": "Could not disable two-factor authentication. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.IN_APP_NOTIFICATIONS_ENABLED.label",
    "target": "Enabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.EMAIL_NOTIFICATIONS_ENABLED.label",
    "target": "Enabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.PersonalProfileView",
    "source": "net.nanopay.settings.PersonalProfileView.SMS_NOTIFICATIONS_ENABLED.label",
    "target": "Enabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessProfileView",
    "source": "net.nanopay.settings.business.BusinessProfileView.MondayLabel",
    "target": "Mon. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessProfileView",
    "source": "net.nanopay.settings.business.BusinessProfileView.TuesdayLabel",
    "target": "Tue. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessProfileView",
    "source": "net.nanopay.settings.business.BusinessProfileView.WednesdayLabel",
    "target": "Wed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessProfileView",
    "source": "net.nanopay.settings.business.BusinessProfileView.ThursdayLabel",
    "target": "Thu. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessProfileView",
    "source": "net.nanopay.settings.business.BusinessProfileView.FridayLabel",
    "target": "Fri. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessProfileView",
    "source": "net.nanopay.settings.business.BusinessProfileView.ToLabel",
    "target": "To fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SwitchBusinessView",
    "source": "net.nanopay.sme.ui.SwitchBusinessView.BUSINESS_LOGIN_FAILED",
    "target": "Error trying to log into business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SwitchBusinessView",
    "source": "net.nanopay.sme.ui.SwitchBusinessView.CURRENTLY_SIGNED_IN",
    "target": "You are currently signed in as  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SwitchBusinessView",
    "source": "net.nanopay.sme.ui.SwitchBusinessView.GO_BACK",
    "target": "Go back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SwitchBusinessView",
    "source": "net.nanopay.sme.ui.SwitchBusinessView.SELECT_COMPANY",
    "target": "Select a company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SwitchBusinessView",
    "source": "net.nanopay.sme.ui.SwitchBusinessView.DISABLED_BUSINESS_MSG",
    "target": "This business has been disabled. You cannot switch to it at this time. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SwitchBusinessView",
    "source": "net.nanopay.sme.ui.SwitchBusinessView.ERROR_DISABLED",
    "target": "Please contact an administrator for this company to enable access. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.NO_LATEST_ACTIVITY",
    "target": "No latest activity to display fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.NO_RECENT_PAYABLES",
    "target": "No recent payables to display fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.NO_RECENT_RECEIVABLES",
    "target": "No recent receivables to display fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.TITLE",
    "target": "Dashboard fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.SUBTITLE1",
    "target": "Action Required fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.SUBTITLE2",
    "target": "Recent Payables fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.SUBTITLE3",
    "target": "Latest Activity fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.SUBTITLE4",
    "target": "Recent Receivables fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.VIEW_ALL",
    "target": "View all fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.Dashboard",
    "source": "net.nanopay.sme.ui.dashboard.Dashboard.UPPER_TXT",
    "target": "Your latest Ablii items fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.menu.DocumentFileMenu",
    "source": "foam.nanos.menu.DocumentFileMenu.DOC_KEY.label",
    "target": "Document fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.L2TransactionApprovalRule",
    "source": "net.nanopay.liquidity.tx.L2TransactionApprovalRule.USE_ACCOUNT_TEMPLATE.label",
    "target": "Use Account Group fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.L2TransactionApprovalRule",
    "source": "net.nanopay.liquidity.tx.L2TransactionApprovalRule.SOURCE_ACCOUNT.label",
    "target": "Apply To Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.L2TransactionApprovalRule",
    "source": "net.nanopay.liquidity.tx.L2TransactionApprovalRule.ACCOUNT_TEMPLATE.label",
    "target": "Apply To Account Group fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.L2TransactionApprovalRule",
    "source": "net.nanopay.liquidity.tx.L2TransactionApprovalRule.DENOMINATION.label",
    "target": "Apply To Denomination fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.L2TransactionApprovalRule",
    "source": "net.nanopay.liquidity.tx.L2TransactionApprovalRule.START_AMOUNT.label",
    "target": "Apply to Transactions Larger Than fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.RestrictAccountsRule",
    "source": "net.nanopay.liquidity.tx.RestrictAccountsRule.INCLUDE_SOURCE_CHILD_ACCOUNTS.label",
    "target": "Include Source Sub-Accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.RestrictAccountsRule",
    "source": "net.nanopay.liquidity.tx.RestrictAccountsRule.INCLUDE_DESTINATION_CHILD_ACCOUNTS.label",
    "target": "Include Destination Sub-Accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.GenericBusinessRule",
    "source": "net.nanopay.liquidity.tx.GenericBusinessRule.SOURCE_PREDICATE.label",
    "target": "Source Condition fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.GenericBusinessRule",
    "source": "net.nanopay.liquidity.tx.GenericBusinessRule.DESTINATION_PREDICATE.label",
    "target": "Destination Condition fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.GenericBusinessRule",
    "source": "net.nanopay.liquidity.tx.GenericBusinessRule.BUSINESS_RULE_ACTION.label",
    "target": "Action Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableDAOBrowser",
    "source": "net.nanopay.invoice.ui.PayableDAOBrowser.TITLE",
    "target": "Payables fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableDAOBrowser",
    "source": "net.nanopay.invoice.ui.PayableDAOBrowser.SUB_TITLE",
    "target": "Here's a list of payments that people have requested from you fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableDAOBrowser",
    "source": "net.nanopay.invoice.ui.PayableDAOBrowser.DELETE_DRAFT",
    "target": "Draft has been deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableDAOBrowser",
    "source": "net.nanopay.invoice.ui.PayableDAOBrowser.RECONCILED_SUCCESS",
    "target": "Invoice has been reconciled by payer. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableDAOBrowser",
    "source": "net.nanopay.invoice.ui.PayableDAOBrowser.RECONCILED_ERROR",
    "target": "There was an error reconciling the invoice. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableDAOBrowser",
    "source": "net.nanopay.invoice.ui.PayableDAOBrowser.INVOICE",
    "target": "invoice fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableDAOBrowser",
    "source": "net.nanopay.invoice.ui.ReceivableDAOBrowser.TITLE",
    "target": "Receivables fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableDAOBrowser",
    "source": "net.nanopay.invoice.ui.ReceivableDAOBrowser.SUB_TITLE",
    "target": "Here's a list of the funds you've requested from other people fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableDAOBrowser",
    "source": "net.nanopay.invoice.ui.ReceivableDAOBrowser.DELETE_DRAFT",
    "target": "Draft has been deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableDAOBrowser",
    "source": "net.nanopay.invoice.ui.ReceivableDAOBrowser.RECONCILED_SUCCESS",
    "target": "Invoice has been reconciled by payer. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableDAOBrowser",
    "source": "net.nanopay.invoice.ui.ReceivableDAOBrowser.RECONCILED_ERROR",
    "target": "There was an error reconciling the invoice. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableDAOBrowser",
    "source": "net.nanopay.invoice.ui.ReceivableDAOBrowser.INVOICE",
    "target": "invoice fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.planner.AbstractTransactionPlanner",
    "source": "net.nanopay.tx.planner.AbstractTransactionPlanner.MULTI_PLAN_.label",
    "target": "Multi Planner fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.planner.AbstractTransactionPlanner",
    "source": "net.nanopay.tx.planner.AbstractTransactionPlanner.WILL_PLAN.label",
    "target": "Planner will Plan fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.planner.AbstractTransactionPlanner",
    "source": "net.nanopay.tx.planner.AbstractTransactionPlanner.BEST_PLAN.label",
    "target": "Force Best Plan fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.TxLimitRule",
    "source": "net.nanopay.liquidity.tx.TxLimitRule.APPLY_LIMIT_TO.label",
    "target": "Applies To fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.TxLimitRule",
    "source": "net.nanopay.liquidity.tx.TxLimitRule.SEND.label",
    "target": "Apply Limit When fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.TxLimitRule",
    "source": "net.nanopay.liquidity.tx.TxLimitRule.LIMIT.label",
    "target": "With Transaction Value More Than fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.tx.TxLimitRule",
    "source": "net.nanopay.liquidity.tx.TxLimitRule.PERIOD.label",
    "target": "Frequency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.AxiomId",
    "source": "foam.doc.AxiomId.NAME.label",
    "target": "Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.AxiomId",
    "source": "foam.doc.AxiomId.PARENT_ID.label",
    "target": "Parent Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.fileDropZone.FileDropZone",
    "source": "net.nanopay.sme.ui.fileDropZone.FileDropZone.LABEL_DEFAULT_TITLE",
    "target": "DRAG & DROP YOUR FILE HERE fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.fileDropZone.FileDropZone",
    "source": "net.nanopay.sme.ui.fileDropZone.FileDropZone.LABEL_OR",
    "target": "or fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.fileDropZone.FileDropZone",
    "source": "net.nanopay.sme.ui.fileDropZone.FileDropZone.LABEL_BROWSE",
    "target": "browse fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.fileDropZone.FileDropZone",
    "source": "net.nanopay.sme.ui.fileDropZone.FileDropZone.LABEL_SUPPORTED",
    "target": "Supported file types: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.fileDropZone.FileDropZone",
    "source": "net.nanopay.sme.ui.fileDropZone.FileDropZone.LABEL_MAX_SIZE",
    "target": "Max Size: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.fileDropZone.FileDropZone",
    "source": "net.nanopay.sme.ui.fileDropZone.FileDropZone.ERROR_FILE_TYPE",
    "target": "Invalid file type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.fileDropZone.FileDropZone",
    "source": "net.nanopay.sme.ui.fileDropZone.FileDropZone.ERROR_FILE_SIZE",
    "target": "File size exceeds 15MB fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.MethodAxiom",
    "source": "foam.doc.MethodAxiom.NAME.label",
    "target": "Method and Description fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.gs.GSFileUploadScreen",
    "source": "net.nanopay.tx.gs.GSFileUploadScreen.TITLE",
    "target": "Settlement CSV File Upload fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.gs.GSFileUploadScreen",
    "source": "net.nanopay.tx.gs.GSFileUploadScreen.OLD_HEADING",
    "target": "Review Previously Ingested Files fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.gs.GSFileUploadScreen",
    "source": "net.nanopay.tx.gs.GSFileUploadScreen.IN_PROGRESS_HEADING",
    "target": "Ingestion In Progress fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.gs.GSFileUploadScreen",
    "source": "net.nanopay.tx.gs.GSFileUploadScreen.LOADING_MSG",
    "target": "Loading... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dashboard.model.Visualization",
    "source": "foam.dashboard.model.Visualization.DAO_NAME.label",
    "target": "DAO fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.UserManagementView",
    "source": "net.nanopay.settings.business.UserManagementView.PLACEHOLDER_TEXT",
    "target": "You don't have any users part of your business. Click the Add\n        a user button to add a new user to your business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.UserManagementView",
    "source": "net.nanopay.settings.business.UserManagementView.DISABLED_SUCCESS",
    "target": " successfully disabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.UserManagementView",
    "source": "net.nanopay.settings.business.UserManagementView.DISABLED_FAILURE",
    "target": "Failed to disable  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.UserManagementView",
    "source": "net.nanopay.settings.business.UserManagementView.ACTIVE_SUCCESS",
    "target": " successfully enabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.UserManagementView",
    "source": "net.nanopay.settings.business.UserManagementView.ACTIVE_FAILURE",
    "target": "Failed to enable  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.UserManagementView",
    "source": "net.nanopay.settings.business.UserManagementView.DELETE_FAILURE",
    "target": "Failed to delete  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.UserManagementView",
    "source": "net.nanopay.settings.business.UserManagementView.INVITE",
    "target": "invite fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.clearing.ClearingTimesTrait",
    "source": "net.nanopay.meter.clearing.ClearingTimesTrait.CLEARING_TIMES.label",
    "target": "Custom Clearing Times fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.AbliiTransaction",
    "source": "net.nanopay.tx.AbliiTransaction.PROHIBITED_MESSAGE",
    "target": "You do not have permission to pay invoices. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessSettingsView",
    "source": "net.nanopay.sme.ui.BusinessSettingsView.TITLE",
    "target": "Business Settings fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessSettingsView",
    "source": "net.nanopay.sme.ui.BusinessSettingsView.COMPANY_TAB",
    "target": "Company Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessSettingsView",
    "source": "net.nanopay.sme.ui.BusinessSettingsView.USER_MANAGEMENT_TAB",
    "target": "User Management fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessSettingsView",
    "source": "net.nanopay.sme.ui.BusinessSettingsView.INTEGRATION_TAB",
    "target": "Integrations fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessSettingsView",
    "source": "net.nanopay.sme.ui.BusinessSettingsView.PRIVACY_TAB",
    "target": "Privacy fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessSettingsView",
    "source": "net.nanopay.sme.ui.BusinessSettingsView.GENERIC_ERROR",
    "target": "There was an unexpected error. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.SAVE_DRAFT_ERROR",
    "target": "An error occurred while saving the draft  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.INVOICE_ERROR",
    "target": "Invoice Error: An error occurred while saving the  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.TRANSACTION_ERROR",
    "target": "Transaction Error: An error occurred while saving the  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.BANK_ACCOUNT_REQUIRED",
    "target": "Please select a bank account that has been verified. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.QUOTE_ERROR",
    "target": "An unexpected error occurred while fetching the exchange rate. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.CONTACT_ERROR",
    "target": "Need to choose a contact. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.AMOUNT_ERROR",
    "target": "Invalid Amount. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.DUE_DATE_ERROR",
    "target": "Invalid Due Date. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.ISSUE_DATE_ERROR",
    "target": "Invalid Issue Date. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.DRAFT_SUCCESS",
    "target": "Draft saved successfully. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.COMPLIANCE_ERROR",
    "target": "Business must pass compliance to make a payment. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.CONTACT_NOT_FOUND",
    "target": "Contact not found. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.INVOICE_AMOUNT_ERROR",
    "target": "This amount exceeds your sending limit. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.WAITING_FOR_RATE",
    "target": "Waiting for FX quote. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.RATE_REFRESH",
    "target": "The exchange rate expired, please  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.RATE_REFRESH_SUBMIT",
    "target": " submit again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.RATE_REFRESH_APPROVE",
    "target": " approve again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.PROCESSING_NOTICE",
    "target": "Processing your transaction, this can take up to 30 seconds. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.TWO_FACTOR_REQUIRED",
    "target": "You require two-factor authentication to continue this payment.\n          Please go to the Personal Settings page to set up two-factor authentication. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoney",
    "source": "net.nanopay.sme.ui.SendRequestMoney.INR_RATE_LIMIT",
    "target": "This transaction exceeds your total daily limit for payments to India. For help, contact support at support@ablii.com fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar.ACCOUNT",
    "target": "Account: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar.SEARCHFOR",
    "target": "Search For: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar.BY",
    "target": "by  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar.BYEND",
    "target": ":  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar.ACCOUNT",
    "target": "Account: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar.SEARCHBY",
    "target": "Search By: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar.SEARCHBYCHOICEUSER",
    "target": "User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar.SEARCHBYCHOICEROLE",
    "target": "Role fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.UserOrRoleSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.UserOrRoleSearchBar.SEARCHBY",
    "target": "Search By: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.UserOrRoleSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.UserOrRoleSearchBar.SEARCHBYCHOICEUSER",
    "target": "User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ucjQuery.ui.UserOrRoleSearchBar",
    "source": "net.nanopay.liquidity.ucjQuery.ui.UserOrRoleSearchBar.SEARCHBYCHOICEROLE",
    "target": "Role fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure",
    "source": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure.CARD_HEADER",
    "target": "CURRENCY EXPOSURE fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure",
    "source": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure.TOOLTIP_EXPOSURE",
    "target": "Exposure fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure",
    "source": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure.TOOLTIP_VALUE",
    "target": "Value in fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure",
    "source": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure.LABEL_NO_DATA",
    "target": "Not enough data to graph fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure",
    "source": "net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure.LABEL_LOADING",
    "target": "Loading Data... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidityChart",
    "source": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidityChart.LABEL_NO_DATA",
    "target": "Not enough data to graph fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidityChart",
    "source": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidityChart.LABEL_LOADING",
    "target": "Loading Data... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadowChart",
    "source": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadowChart.LABEL_NO_DATA",
    "target": "Not enough data to graph fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadowChart",
    "source": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadowChart.LABEL_LOADING",
    "target": "Loading Data... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity",
    "source": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity.LABEL_HIGH_THRESHOLD",
    "target": "High Threshold fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity",
    "source": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity.LABEL_LOW_THRESHOLD",
    "target": "Low Threshold fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity",
    "source": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity.CARD_HEADER",
    "target": "LIQUIDITY fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity",
    "source": "net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity.LABEL_DISCLAIMER",
    "target": "A future date will not be reflected on the graph fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow",
    "source": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow.CARD_HEADER",
    "target": "CASH IN / OUT OF SHADOW ACCOUNTS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow",
    "source": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow.TOOLTIP_TOTAL_CI",
    "target": "+ fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow",
    "source": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow.TOOLTIP_TOTAL_CO",
    "target": "− fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow",
    "source": "net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow.LABEL_DISCLAIMER",
    "target": "A future date will not be reflected on the graph fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.ui.dashboard.Dashboard",
    "source": "net.nanopay.liquidity.ui.dashboard.Dashboard.UPDATED",
    "target": "Last updated at fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.heroes.CitationView",
    "source": "com.google.foam.demos.heroes.CitationView.DATA.label",
    "target": "Data fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.AllViews",
    "source": "com.google.foam.demos.u2.AllViews.DAO.label",
    "target": "DAO fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.AllViews",
    "source": "com.google.foam.demos.u2.AllViews.DEFAULT_BOOLEAN.label",
    "target": "CheckBox fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.AllViews",
    "source": "com.google.foam.demos.u2.AllViews.MD_CHECKBOX_BOOLEAN.label",
    "target": "MD CheckBox fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.AllViews",
    "source": "com.google.foam.demos.u2.AllViews.F_OBJECT_VIEW.label",
    "target": "FObjectView fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.AllViews",
    "source": "com.google.foam.demos.u2.AllViews.F_OBJECT_VIEW_WITH_CHOICES.label",
    "target": "FObjectView With Choices fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.AllViews",
    "source": "com.google.foam.demos.u2.AllViews.F_OBJECT_VIEW_WITH_CHOICES_VALUE_SET.label",
    "target": "FObjectView With Choices (Value Set) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "com.google.foam.demos.u2.AllViews",
    "source": "com.google.foam.demos.u2.AllViews.F_OBJECT_VIEW_WITH_CHOICES_AND_CUSTOM_CLASSES.label",
    "target": "FObjectView With Choices and Custom Classes fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dashboard.model.GroupByGroupBy",
    "source": "foam.dashboard.model.GroupByGroupBy.ARG1.label",
    "target": "Arg1 fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dashboard.model.GroupByGroupBy",
    "source": "foam.dashboard.model.GroupByGroupBy.ARG2.label",
    "target": "Arg2 fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dashboard.model.GroupByGroupBy",
    "source": "foam.dashboard.model.GroupByGroupBy.VIEWS.label",
    "target": "Views fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dashboard.model.GroupByGroupBy",
    "source": "foam.dashboard.model.GroupByGroupBy.SINK.label",
    "target": "Sink fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dashboard.view.Dashboard",
    "source": "foam.dashboard.view.Dashboard.NODE_NAME.label",
    "target": "Node Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.property.PropertyFilterView",
    "source": "foam.u2.filter.property.PropertyFilterView.LABEL_PROPERTY_ALL",
    "target": "All fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.property.PropertyFilterView",
    "source": "foam.u2.filter.property.PropertyFilterView.LABEL_PROPERTY_FILTER",
    "target": "Filtering fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.comics.v2.DAOUpdateView",
    "source": "foam.comics.v2.DAOUpdateView.BACK",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.BusinessNameSearch",
    "source": "net.nanopay.contacts.ui.modal.BusinessNameSearch.FILTER.label",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.BusinessNameSearch",
    "source": "net.nanopay.contacts.ui.modal.BusinessNameSearch.SECTION_SEARCH.title",
    "target": "Search by Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.BusinessNameSearch",
    "source": "net.nanopay.contacts.ui.modal.BusinessNameSearch.SECTION_SEARCH.subTitle",
    "target": "Search a business on Ablii to add them to your\n      contacts.  For better results, search using their registered\n      business name and location. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.CONNECTING",
    "target": "Connecting... This may take a few minutes. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.INVALID_FORM",
    "target": "Please complete the form before proceeding. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.SUCCESS",
    "target": "Your bank account was successfully added. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.INSTRUCTIONS",
    "target": "Connect to your account without signing in to online banking. Please ensure your details are entered properly. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.ERROR_FIRST",
    "target": "First name cannot be empty. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.ERROR_LAST",
    "target": "Last name cannot be empty. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.ERROR_FLENGTH",
    "target": "First name cannot exceed 70 characters. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.ERROR_LLENGTH",
    "target": "Last name cannot exceed 70 characters. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.ERROR_STREET_NAME",
    "target": "Invalid street number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.ERROR_STREET_NUMBER",
    "target": "Invalid street name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.ERROR_CITY",
    "target": "Invalid city name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalPAD",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalPAD.ERROR_POSTAL",
    "target": "Invalid postal code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.DeleteModal",
    "source": "foam.u2.DeleteModal.TITLE",
    "target": "Delete  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.DeleteModal",
    "source": "foam.u2.DeleteModal.CONFIRM_DELETE_1",
    "target": "Are you sure you want to delete fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.DeleteModal",
    "source": "foam.u2.DeleteModal.SUCCESS_MSG",
    "target": " deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.DeleteModal",
    "source": "foam.u2.DeleteModal.FAIL_MSG",
    "target": "Failed to delete fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.MemoModal",
    "source": "foam.u2.MemoModal.CONFIRM_DELETE_1",
    "target": "Are you sure you want to delete fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.MemoModal",
    "source": "foam.u2.MemoModal.SUCCESS_MSG",
    "target": " deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.MemoModal",
    "source": "foam.u2.MemoModal.FAIL_MSG",
    "target": "Failed to delete fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.LocalStorageDAO",
    "source": "foam.dao.LocalStorageDAO.NAME.label",
    "target": "Store Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignIn",
    "source": "foam.nanos.u2.navigation.SignIn.TITLE",
    "target": "Welcome! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignIn",
    "source": "foam.nanos.u2.navigation.SignIn.FOOTER_TXT",
    "target": "Not a user yet? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignIn",
    "source": "foam.nanos.u2.navigation.SignIn.FOOTER_LINK",
    "target": "Create an account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignIn",
    "source": "foam.nanos.u2.navigation.SignIn.SUB_FOOTER_LINK",
    "target": "Forgot password? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignIn",
    "source": "foam.nanos.u2.navigation.SignIn.ERROR_MSG",
    "target": "There was an issue with logging in. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignIn",
    "source": "foam.nanos.u2.navigation.SignIn.ERROR_MSG2",
    "target": "Please enter email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.u2.navigation.SignIn",
    "source": "foam.nanos.u2.navigation.SignIn.IDENTIFIER.label",
    "target": "Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.dao.IDBDAO",
    "source": "foam.dao.IDBDAO.NAME.label",
    "target": "Store Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.advanced.AdvancedFilterView",
    "source": "foam.u2.filter.advanced.AdvancedFilterView.TITLE_HEADER",
    "target": "Advanced Filters fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.advanced.AdvancedFilterView",
    "source": "foam.u2.filter.advanced.AdvancedFilterView.LABEL_CRITERIA",
    "target": "Criteria fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.advanced.AdvancedFilterView",
    "source": "foam.u2.filter.advanced.AdvancedFilterView.LABEL_REMOVE",
    "target": "Remove fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.advanced.AdvancedFilterView",
    "source": "foam.u2.filter.advanced.AdvancedFilterView.LABEL_RESULTS",
    "target": "Filter Results Preview:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.advanced.AdvancedFilterView",
    "source": "foam.u2.filter.advanced.AdvancedFilterView.LABEL_INSTRUCTION",
    "target": "In Advanced Mode, the results are an accumulation of each criteria. Within each criteria, the results will be a reflection that fully matches your selection. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.StringFilterView",
    "source": "foam.u2.filter.properties.StringFilterView.LABEL_PLACEHOLDER",
    "target": "Search fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.StringFilterView",
    "source": "foam.u2.filter.properties.StringFilterView.LABEL_LIMIT_REACHED",
    "target": "Please refine your search to view more options fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.StringFilterView",
    "source": "foam.u2.filter.properties.StringFilterView.LABEL_LOADING",
    "target": "- LOADING OPTIONS - fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.StringFilterView",
    "source": "foam.u2.filter.properties.StringFilterView.LABEL_NO_OPTIONS",
    "target": "- NO OPTIONS AVAILABLE - fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.StringFilterView",
    "source": "foam.u2.filter.properties.StringFilterView.LABEL_SELECTED",
    "target": "SELECTED OPTIONS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.StringFilterView",
    "source": "foam.u2.filter.properties.StringFilterView.LABEL_FILTERED",
    "target": "OPTIONS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.StringFilterView",
    "source": "foam.u2.filter.properties.StringFilterView.LABEL_EMPTY",
    "target": "- Not Defined - fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.BooleanFilterView",
    "source": "foam.u2.filter.properties.BooleanFilterView.BOOL_T.label",
    "target": "True fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.BooleanFilterView",
    "source": "foam.u2.filter.properties.BooleanFilterView.BOOL_F.label",
    "target": "False fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.EnumFilterView",
    "source": "foam.u2.filter.properties.EnumFilterView.LABEL_PLACEHOLDER",
    "target": "Search fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.EnumFilterView",
    "source": "foam.u2.filter.properties.EnumFilterView.LABEL_SELECTED",
    "target": "SELECTED OPTIONS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.EnumFilterView",
    "source": "foam.u2.filter.properties.EnumFilterView.LABEL_FILTERED",
    "target": "OPTIONS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.ReferenceFilterView",
    "source": "foam.u2.filter.properties.ReferenceFilterView.LABEL_PLACEHOLDER",
    "target": "Search fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.ReferenceFilterView",
    "source": "foam.u2.filter.properties.ReferenceFilterView.LABEL_LIMIT_REACHED",
    "target": "Please refine your search to view more options fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.ReferenceFilterView",
    "source": "foam.u2.filter.properties.ReferenceFilterView.LABEL_LOADING",
    "target": "- LOADING OPTIONS - fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.ReferenceFilterView",
    "source": "foam.u2.filter.properties.ReferenceFilterView.LABEL_NO_OPTIONS",
    "target": "- NO OPTIONS AVAILABLE - fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.ReferenceFilterView",
    "source": "foam.u2.filter.properties.ReferenceFilterView.LABEL_SELECTED",
    "target": "SELECTED OPTIONS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.filter.properties.ReferenceFilterView",
    "source": "foam.u2.filter.properties.ReferenceFilterView.LABEL_FILTERED",
    "target": "OPTIONS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.search.FilterController",
    "source": "foam.u2.search.FilterController.FILTER_CHOICE.label",
    "target": "New Filter fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.search.GroupAutocompleteSearchView",
    "source": "foam.u2.search.GroupAutocompleteSearchView.DAO.label",
    "target": "DAO fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.search.Toolbar",
    "source": "foam.u2.search.Toolbar.SEARCH.label",
    "target": "Search fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.AxiomInfo",
    "source": "foam.doc.AxiomInfo.CLS.label",
    "target": "Source fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.StepWizardletView",
    "source": "foam.u2.wizard.StepWizardletView.ACTION_LABEL",
    "target": "Submit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.StepWizardletView",
    "source": "foam.u2.wizard.StepWizardletView.CANCEL_LABEL",
    "target": "Cancel fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.StepWizardletView",
    "source": "foam.u2.wizard.StepWizardletView.SAVE_IN_PROGRESS",
    "target": "Saving... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.StepWizardletView",
    "source": "foam.u2.wizard.StepWizardletView.ERROR_MSG",
    "target": "Information was not successfully submitted, please try again later fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.StepWizardletView",
    "source": "foam.u2.wizard.StepWizardletView.ERROR_MSG_DRAFT",
    "target": "An error occured while saving your progress. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.StepWizardletView",
    "source": "foam.u2.wizard.StepWizardletView.SUCCESS_MSG",
    "target": "Information successfully submitted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.StepWizardletView",
    "source": "foam.u2.wizard.StepWizardletView.SUCCESS_MSG_DRAFT",
    "target": "Your progress has been saved. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.ScrollWizardletView",
    "source": "foam.u2.wizard.ScrollWizardletView.ACTION_LABEL",
    "target": "Submit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.ScrollWizardletView",
    "source": "foam.u2.wizard.ScrollWizardletView.SAVE_IN_PROGRESS",
    "target": "Saving... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.ScrollWizardletView",
    "source": "foam.u2.wizard.ScrollWizardletView.ERROR_MSG",
    "target": "Information was not successfully submitted, please try again later fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.ScrollWizardletView",
    "source": "foam.u2.wizard.ScrollWizardletView.ERROR_MSG_DRAFT",
    "target": "An error occured while saving your progress. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.ScrollWizardletView",
    "source": "foam.u2.wizard.ScrollWizardletView.SUCCESS_MSG",
    "target": "Information successfully submitted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.u2.wizard.ScrollWizardletView",
    "source": "foam.u2.wizard.ScrollWizardletView.SUCCESS_MSG_DRAFT",
    "target": "Your progress has been saved. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.CheckPermissionsSink",
    "source": "foam.nanos.auth.CheckPermissionsSink.ERROR_MESSAGE",
    "target": "Permission denied. You cannot change the parent of a group if doing so grants that group permissions that you do not have. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ResendVerificationEmail",
    "source": "foam.nanos.auth.ResendVerificationEmail.Title",
    "target": "You're almost there... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ResendVerificationEmail",
    "source": "foam.nanos.auth.ResendVerificationEmail.Instructions1",
    "target": "We have sent you an email. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ResendVerificationEmail",
    "source": "foam.nanos.auth.ResendVerificationEmail.Instructions2",
    "target": "Please go to your inbox to confirm your email address. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ResendVerificationEmail",
    "source": "foam.nanos.auth.ResendVerificationEmail.Instructions3",
    "target": "Your email address needs to be verified before getting started. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.resetPassword.SuccessView",
    "source": "foam.nanos.auth.resetPassword.SuccessView.Instructions",
    "target": "Successfully reset password! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ResetPassword",
    "source": "foam.nanos.auth.ResetPassword.SUCCESS_MSG",
    "target": "Your password was successfully updated. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ResetPassword",
    "source": "foam.nanos.auth.ResetPassword.CONFIRMATION_PASSWORD.label",
    "target": "Confirm Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ResetPassword",
    "source": "foam.nanos.auth.ResetPassword.SECTION_RESET_PASSWORD_SECTION.title",
    "target": "Reset your password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.ResetPassword",
    "source": "foam.nanos.auth.ResetPassword.SECTION_RESET_PASSWORD_SECTION.subTitle",
    "target": "Create a new password for your account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.RetrievePassword",
    "source": "foam.nanos.auth.RetrievePassword.INSTRUC_ONE",
    "target": "Password reset instructions were sent to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.RetrievePassword",
    "source": "foam.nanos.auth.RetrievePassword.INSTRUC_TWO",
    "target": "Please check your inbox to continue. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.RetrievePassword",
    "source": "foam.nanos.auth.RetrievePassword.REDIRECTION_TO",
    "target": "Back to Sign in fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.RetrievePassword",
    "source": "foam.nanos.auth.RetrievePassword.SECTION_EMAIL_PASSWORD_SECTION.title",
    "target": "Forgot your password? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.RetrievePassword",
    "source": "foam.nanos.auth.RetrievePassword.SECTION_EMAIL_PASSWORD_SECTION.subTitle",
    "target": "Enter the email you signed up with and we'll send you a link to reset your password. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.UpdatePassword",
    "source": "foam.nanos.auth.UpdatePassword.SUCCESS_MSG",
    "target": "Your password was successfully updated. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.UpdatePassword",
    "source": "foam.nanos.auth.UpdatePassword.CONFIRMATION_PASSWORD.label",
    "target": "Confirm Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.UpdatePassword",
    "source": "foam.nanos.auth.UpdatePassword.SECTION_UPDATE_PASSWORD_SECTION.title",
    "target": "Update your password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.UpdatePassword",
    "source": "foam.nanos.auth.UpdatePassword.SECTION_UPDATE_PASSWORD_SECTION.subTitle",
    "target": "Create a new password for your account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.twofactor.TwoFactorSignInView",
    "source": "foam.nanos.auth.twofactor.TwoFactorSignInView.TWO_FACTOR_NO_TOKEN",
    "target": "Please enter a verification code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.twofactor.TwoFactorSignInView",
    "source": "foam.nanos.auth.twofactor.TwoFactorSignInView.TWO_FACTOR_LABEL",
    "target": "Enter verification code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.twofactor.TwoFactorSignInView",
    "source": "foam.nanos.auth.twofactor.TwoFactorSignInView.TWO_FACTOR_ERROR",
    "target": "Incorrect code. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.twofactor.TwoFactorSignInView",
    "source": "foam.nanos.auth.twofactor.TwoFactorSignInView.TWO_FACTOR_TITLE",
    "target": "Two-factor authentication fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.twofactor.TwoFactorSignInView",
    "source": "foam.nanos.auth.twofactor.TwoFactorSignInView.TWO_FACTOR_EXPLANATION",
    "target": "Open your Google Authenticator app on your mobile device to view the 6-digit code and verify your identity fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.twofactor.TwoFactorSignInView",
    "source": "foam.nanos.auth.twofactor.TwoFactorSignInView.TWO_FACTOR_NOTES_1",
    "target": "Need another way to authenticate? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.auth.twofactor.TwoFactorSignInView",
    "source": "foam.nanos.auth.twofactor.TwoFactorSignInView.TWO_FACTOR_NOTES_2",
    "target": "Contact us fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.notification.NotificationSettingsView",
    "source": "foam.nanos.notification.NotificationSettingsView.EmailPreferencesHeading",
    "target": "Email preferences fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.notification.NotificationSettingsView",
    "source": "foam.nanos.notification.NotificationSettingsView.NotificationPreferencesHeading",
    "target": "Notification preferences fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.TicketSummaryView",
    "source": "foam.nanos.ticket.TicketSummaryView.title",
    "target": "Tickets fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.TicketSummaryView",
    "source": "foam.nanos.ticket.TicketSummaryView.openLabel",
    "target": "Open fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.ticket.TicketSummaryView",
    "source": "foam.nanos.ticket.TicketSummaryView.closedLabel",
    "target": "Closed fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DigFileUploadView",
    "source": "foam.nanos.dig.DigFileUploadView.UploadFileLabel",
    "target": "Choose File fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DigFileUploadView",
    "source": "foam.nanos.dig.DigFileUploadView.RemoveImageLabel",
    "target": "Remove File fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DigFileUploadView",
    "source": "foam.nanos.dig.DigFileUploadView.FileError",
    "target": "File required fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DigFileUploadView",
    "source": "foam.nanos.dig.DigFileUploadView.FileTypeError",
    "target": "Wrong file format fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.dig.DigFileUploadView",
    "source": "foam.nanos.dig.DigFileUploadView.ErrorMessage",
    "target": "Please upload an image less than 2MB fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovableAwareDAO",
    "source": "foam.nanos.approval.ApprovableAwareDAO.APPROVER_MSG",
    "target": "No Approvers exist for the model:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovableAwareDAO",
    "source": "foam.nanos.approval.ApprovableAwareDAO.APPROVER_MSG2_PART_ONE",
    "target": "The only approver of  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovableAwareDAO",
    "source": "foam.nanos.approval.ApprovableAwareDAO.APPROVER_MSG2_PART_TWO",
    "target": " is the maker of this request! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovableAwareDAO",
    "source": "foam.nanos.approval.ApprovableAwareDAO.SYSTEM_UPDATE_MSG",
    "target": "SYSTEM UPDATE - Not automatically setting LifecycleState from PENDING to ACTIVE for  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovableAwareDAO",
    "source": "foam.nanos.approval.ApprovableAwareDAO.ERROR_MSG_MULTI",
    "target": "Something went wrong! There shouldnt be multiple approvables fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovableAwareDAO",
    "source": "foam.nanos.approval.ApprovableAwareDAO.ERROR_MSG2",
    "target": "Something went wrong cannot have multiple approved/rejected requests for the same request! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.nanos.approval.ApprovableAwareDAO",
    "source": "foam.nanos.approval.ApprovableAwareDAO.REQUEST_SEND_MSG",
    "target": "An approval request has been sent out. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.modal.NewEmailSupportModal",
    "source": "foam.support.modal.NewEmailSupportModal.title",
    "target": "New Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.modal.NewEmailSupportModal",
    "source": "foam.support.modal.NewEmailSupportModal.titlelabel",
    "target": "Input the email address you want to connect to the help desk. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.modal.NewEmailSupportModal",
    "source": "foam.support.modal.NewEmailSupportModal.emailInvalid",
    "target": "The email you have entered is invalid. Try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.modal.NewEmailSupportModal",
    "source": "foam.support.modal.NewEmailSupportModal.emailExists",
    "target": "The email you have entered already exists. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.modal.NewEmailSupportConfirmationModal",
    "source": "foam.support.modal.NewEmailSupportConfirmationModal.title",
    "target": "New Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.modal.NewEmailSupportConfirmationModal",
    "source": "foam.support.modal.NewEmailSupportConfirmationModal.titlelabel",
    "target": "Please go to the email box to validate the email address before you can connect to the help desk. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.modal.DeleteEmailSupportModal",
    "source": "foam.support.modal.DeleteEmailSupportModal.titlelabel",
    "target": "Do you want to delete the email xx@xx.com? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.view.SupportEmailView",
    "source": "foam.support.view.SupportEmailView.title",
    "target": "Support Emails Management fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.view.SupportEmailView",
    "source": "foam.support.view.SupportEmailView.noSupportEmail",
    "target": "No support email connected fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.model.TicketMessage",
    "source": "foam.support.model.TicketMessage.ID.label",
    "target": "Ticket Message Id fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.model.Ticket",
    "source": "foam.support.model.Ticket.ID.label",
    "target": "Ticket ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.model.Ticket",
    "source": "foam.support.model.Ticket.SUBJECT.label",
    "target": "Subject fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.model.Ticket",
    "source": "foam.support.model.Ticket.CREATED_AT.label",
    "target": "Time fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.model.Ticket",
    "source": "foam.support.model.Ticket.STATUS.label",
    "target": "Status fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.view.TicketSummaryView",
    "source": "foam.support.view.TicketSummaryView.title",
    "target": "Tickets fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.view.TicketSummaryView",
    "source": "foam.support.view.TicketSummaryView.newLabel",
    "target": "New fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.view.TicketSummaryView",
    "source": "foam.support.view.TicketSummaryView.updatedLabel",
    "target": "Updated fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.view.TicketSummaryView",
    "source": "foam.support.view.TicketSummaryView.openLabel",
    "target": "Open fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.view.TicketSummaryView",
    "source": "foam.support.view.TicketSummaryView.pendingLabel",
    "target": "Pending fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.support.view.TicketSummaryView",
    "source": "foam.support.view.TicketSummaryView.solvedLabel",
    "target": "Solved fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.SecurityTransaction",
    "source": "net.nanopay.tx.SecurityTransaction.AMOUNT.label",
    "target": "Source Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.SecurityTransaction",
    "source": "net.nanopay.tx.SecurityTransaction.DESTINATION_AMOUNT.label",
    "target": "Destination Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.AccountDAOCreateView",
    "source": "net.nanopay.account.AccountDAOCreateView.SUCCESS_MESSAGE",
    "target": "An approval request has been created. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.AccountDAOSummaryViewView",
    "source": "net.nanopay.account.AccountDAOSummaryViewView.TABLE_HEADER",
    "target": "TRANSACTIONS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.AccountDAOSummaryViewView",
    "source": "net.nanopay.account.AccountDAOSummaryViewView.OVERVIEW_HEADER",
    "target": "OVERVIEW fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.AccountDAOSummaryViewView",
    "source": "net.nanopay.account.AccountDAOSummaryViewView.THRESHOLD_HEADER",
    "target": "THRESHOLD RULES fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.AccountDAOSummaryViewView",
    "source": "net.nanopay.account.AccountDAOSummaryViewView.NO_LIQUIDITY_SETTINGS",
    "target": "No liquidity threshold rules have been set for this account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.AccountBalanceView",
    "source": "net.nanopay.account.AccountBalanceView.CARD_HEADER",
    "target": "BALANCE fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.AccountBalanceView",
    "source": "net.nanopay.account.AccountBalanceView.HOME_BALANCE_NOTE",
    "target": "Total value shown in home currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.AccountBalanceView",
    "source": "net.nanopay.account.AccountBalanceView.LOCAL_BALANCE_NOTE",
    "target": "Total value shown in local currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DuplicateEntryRule",
    "source": "net.nanopay.account.DuplicateEntryRule.ERROR_MESSAGE",
    "target": "An entry with the same details already exists fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DuplicateCABankAccountRule",
    "source": "net.nanopay.account.DuplicateCABankAccountRule.ERROR_MESSAGE",
    "target": "A bank account with the same details already exists fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DuplicateUSBankAccountRule",
    "source": "net.nanopay.account.DuplicateUSBankAccountRule.ERROR_MESSAGE",
    "target": "A bank account with the same details already exists fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.BankAccountWizard",
    "source": "net.nanopay.account.ui.BankAccountWizard.SUCCESS",
    "target": "Bank account successfully added. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.BankAccountWizard",
    "source": "net.nanopay.account.ui.BankAccountWizard.ERROR",
    "target": "Bank account error occured. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsModal",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsModal.TITLE",
    "target": "Add details to this account... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsRequirements",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsRequirements.IS_LIMIT_REQUIRED.label",
    "target": "Add transaction limits to this account? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsRequirements",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsRequirements.IS_LIQUIDITY_REQUIRED.label",
    "target": "Add liquidity threshold limits to this account? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddShadowAccount",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddShadowAccount.COUNTRY_PICKER.label",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddShadowAccount",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddShadowAccount.BANK_ACCOUNT_PICKER.label",
    "target": "Associated bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddShadowAccount",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddShadowAccount.CURRENCY_PICKER.label",
    "target": "Currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddVirtualAccount",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddVirtualAccount.COUNTRY_PICKER.label",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddVirtualAccount",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddVirtualAccount.PARENT_ACCOUNT_PICKER.label",
    "target": "Parent account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddVirtualAccount",
    "source": "net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddVirtualAccount.CURRENCY_PICKER.label",
    "target": "Currency fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.accountType.AccountTypeModal",
    "source": "net.nanopay.account.ui.addAccountModal.accountType.AccountTypeModal.TITLE",
    "target": "Select an account type to create... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAuto",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAuto.INCLUDE_CEILING_RULE.label",
    "target": "Include high liquidity threshold rules fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAuto",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAuto.INCLUDE_FLOOR_RULE.label",
    "target": "Include low liquidity threshold rules fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAuto",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAuto.IS_SAVED_AS_TEMPLATE.label",
    "target": "Save this threshold rule as a template fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoCeiling",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoCeiling.ACCOUNT_BALANCE_CEILING.label",
    "target": "If the balance of this account reaches fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoCeiling",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoCeiling.RESET_ACCOUNT_BALANCE_CEILING.label",
    "target": "Reset account balance to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoCeiling",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoCeiling.CEILING_MOVE_FUNDS_TO.label",
    "target": "by moving the excess funds into fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoFloor",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoFloor.ACCOUNT_BALANCE_FLOOR.label",
    "target": "If the balance of this account falls below fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoFloor",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoFloor.RESET_ACCOUNT_BALANCE_FLOOR.label",
    "target": "Reset account balance to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoFloor",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoFloor.FLOOR_MOVE_FUNDS_FROM.label",
    "target": "by adding new funds from fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnly",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnly.INCLUDE_CEILING_RULE.label",
    "target": "Include high liquidity threshold rules fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnly",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnly.INCLUDE_FLOOR_RULE.label",
    "target": "Include low liquidity threshold rules fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnly",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnly.IS_SAVED_AS_TEMPLATE.label",
    "target": "Save this threshold rule as a template fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnlyCeiling",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnlyCeiling.ACCOUNT_BALANCE_CEILING.label",
    "target": "If the balance of this account reaches fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnlyFloor",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnlyFloor.ACCOUNT_BALANCE_FLOOR.label",
    "target": "If the balance of this account falls below fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRule",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRule.IS_NEW_SELECTED.label",
    "target": "Create a new threshold rule for this account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRule",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRule.IS_EXISTING_SELECTED.label",
    "target": "Use an existing threshold rule for this account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleNew",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleNew.LIQUIDITY_THRESHOLD_RULES.label",
    "target": "I want this threshold to... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleNew",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleNew.WHO_RECEIVES_NOTIFICATION.label",
    "target": "Who should receive notifications about this threshold fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleExisting",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleExisting.EXISTING_THRESHOLD_RULE.label",
    "target": "Threshold rule name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleModal",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleModal.TITLE",
    "target": "Set the high & low liquidity threshold rules... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleSaveTemplate",
    "source": "net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleSaveTemplate.THRESHOLD_RULE_NAME.label",
    "target": "Threshold rule name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.transactionLimit.AccountTransactionLimitModal",
    "source": "net.nanopay.account.ui.addAccountModal.transactionLimit.AccountTransactionLimitModal.TITLE",
    "target": "Set the transaction limit for this account... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.transactionLimit.AccountTransactionLimit",
    "source": "net.nanopay.account.ui.addAccountModal.transactionLimit.AccountTransactionLimit.MAX_TRANSACTION_SIZE.label",
    "target": "The maximum transaction size allowed from this account is... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.AddAccountSubmissionModal",
    "source": "net.nanopay.account.ui.addAccountModal.AddAccountSubmissionModal.TITLE_1",
    "target": "Creating your account... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.ui.addAccountModal.AddAccountSubmissionModal",
    "source": "net.nanopay.account.ui.addAccountModal.AddAccountSubmissionModal.TITLE_2",
    "target": "Your new account has been successfully created! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DigitalAccountInfo",
    "source": "net.nanopay.account.DigitalAccountInfo.TRANSACTIONS_RECIEVED.label",
    "target": "Recieved # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DigitalAccountInfo",
    "source": "net.nanopay.account.DigitalAccountInfo.TRANSACTIONS_SENT.label",
    "target": "Sent # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DigitalAccountInfo",
    "source": "net.nanopay.account.DigitalAccountInfo.TRANSACTIONS_SUM_RECIEVED.label",
    "target": "Recieved Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.account.DigitalAccountInfo",
    "source": "net.nanopay.account.DigitalAccountInfo.TRANSACTIONS_SUM_SENT.label",
    "target": "Sent Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LABEL_LEGAL_NAME",
    "target": "Legal Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LABEL_BUSINESS_NAME",
    "target": "Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LABEL_FIRST_NAME",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LABEL_LAST_NAME",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.COMPANY_NAME_LABEL",
    "target": "Company Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LABEL_ACCOUNT",
    "target": "Account # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LABEL_INSTITUTION",
    "target": "Institution # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LABEL_TRANSIT",
    "target": "Transit # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LABEL_ROUTING",
    "target": "Routing # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.TC1",
    "target": "I authorize nanopay Corporation (for Canadian domestic transactions) or AFEX (for international transactions) to withdraw from my (debit) account with the financial institution listed above from time to time for the amount that I specify when processing a one-time (\"sporadic\") pre-authorized debit. I have agreed that we may reduce the standard period of pre-notification for variable amount PADs (Ablii Monthly Fee Invoice). We will send you notice of the amount of each Monthly Fee Invoice PAD five days before the PAD is due. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.TC2",
    "target": "I have certain recourse rights if any debit does not comply with this agreement. For example, I have right to receive reimbursement for any debit that is not authorized or is not consistent with the PAD agreement. To obtain more information on my recourse rights, I may contact my financial institution or visit  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.TC3",
    "target": "This Authorization may be cancelled at any time upon notice being provided by me, either in writing or orally, with proper authorization to verify my identity. I acknowledge that I can obtain a sample cancellation form or further information on my right to cancel this Agreement from nanopay Corporation (for Canadian domestic transactions) or AFEX (for international transactions) or by visiting  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LINK",
    "target": "www.payments.ca fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.ACCEPT",
    "target": "I Agree fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.BACK",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LEGAL_AUTH",
    "target": "Authorization fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LEGAL_RECOURSE",
    "target": "Recourse/Reimbursement fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.LEGAL_CANCEL",
    "target": "Cancellation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.US_TC_1",
    "target": "I/We authorize Associated Foreign Exchange Inc (AFEX) and the financial institution designated (or any other financial institution I/we may authorize at any time) to deduct regular and/or one-time payments as per my/our instructions for payment of all charges arising under my/our AFEX account(s) In accordance with this Authorization and the applicable rules of the National Automated Clearing House Association(ACH). AFEX will provide notice for each amount debited. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPADForm",
    "source": "net.nanopay.bank.ui.BankPADForm.US_TC_2",
    "target": "This authority is to remain in effect until AFEX has received written notification from me/us of its change or termination. The notification must be received at least 10 business days before the next debit Is scheduled at the address provided below. AFEX shall advise me/us of any dishonored fees, and I/we agree to pay them. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.INBankAccount",
    "source": "net.nanopay.bank.INBankAccount.IFSC_CODE.label",
    "target": "IFSC Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.INBankAccount",
    "source": "net.nanopay.bank.INBankAccount.BENE_ACCOUNT_TYPE.label",
    "target": "Account Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.INBankAccount",
    "source": "net.nanopay.bank.INBankAccount.ACCOUNT_NUMBER.label",
    "target": "Bank Account No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.INBankAccount",
    "source": "net.nanopay.bank.INBankAccount.ACCOUNT_RELATIONSHIP.label",
    "target": "Relationship with the contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.INBankAccount",
    "source": "net.nanopay.bank.INBankAccount.PURPOSE_CODE.label",
    "target": "Purpose of Transfer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.PKBankAccount",
    "source": "net.nanopay.bank.PKBankAccount.ACCOUNT_NUMBER.label",
    "target": "International Bank Account No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccountController",
    "source": "net.nanopay.bank.BankAccountController.DELETE_DEFAULT",
    "target": "Unable to delete default accounts. Please select a new default account if one exists. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccountController",
    "source": "net.nanopay.bank.BankAccountController.UNABLE_TO_DELETE",
    "target": "Error deleting account:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccountController",
    "source": "net.nanopay.bank.BankAccountController.SUCCESSFULLY_DELETED",
    "target": "Bank account deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccountController",
    "source": "net.nanopay.bank.BankAccountController.IS_DEFAULT",
    "target": "is now your default bank account. Funds will be automatically transferred to and from this account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccountController",
    "source": "net.nanopay.bank.BankAccountController.UNABLE_TO_DEFAULT",
    "target": "Unable to set non verified bank accounts as default. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccountController",
    "source": "net.nanopay.bank.BankAccountController.ALREADY_DEFAULT",
    "target": "is already a default bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankAccountController",
    "source": "net.nanopay.bank.BankAccountController.BANK_ACCOUNT_LABEL",
    "target": "Bank Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPickCurrencyView",
    "source": "net.nanopay.bank.ui.BankPickCurrencyView.TITLE",
    "target": "Add a new bank fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPickCurrencyView",
    "source": "net.nanopay.bank.ui.BankPickCurrencyView.SUB_TITLE",
    "target": "Connect through a banking partner below, or  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPickCurrencyView",
    "source": "net.nanopay.bank.ui.BankPickCurrencyView.CONNECT_LABEL",
    "target": "connect with a void check fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPickCurrencyView",
    "source": "net.nanopay.bank.ui.BankPickCurrencyView.BANK_ADDED",
    "target": "Your bank account was successfully added. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPickCurrencyView",
    "source": "net.nanopay.bank.ui.BankPickCurrencyView.CHOOSE_COUNTRY",
    "target": "Please select the originating country of the bank account you would like to add. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankPickCurrencyView",
    "source": "net.nanopay.bank.ui.BankPickCurrencyView.SELECTED_COUNTRY.label",
    "target": "Country of bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.BankAccountSelectionView",
    "source": "net.nanopay.bank.ui.BankAccountSelectionView.DEFAULT_LABEL",
    "target": "Choose from bank accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.AddINBankAccountView",
    "source": "net.nanopay.bank.ui.AddINBankAccountView.ACCOUNT_NAME.label",
    "target": "Bank Account Display Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.AddINBankAccountView",
    "source": "net.nanopay.bank.ui.AddINBankAccountView.ACCOUNT_NUMBER.label",
    "target": "Bank Account No fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.AddINBankAccountView",
    "source": "net.nanopay.bank.ui.AddINBankAccountView.INSTITUTION.label",
    "target": "Institution Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.AddPKBankAccountView",
    "source": "net.nanopay.bank.ui.AddPKBankAccountView.ACCOUNT_NAME.label",
    "target": "Bank Account Display Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.AddPKBankAccountView",
    "source": "net.nanopay.bank.ui.AddPKBankAccountView.ACCOUNT_NUMBER.label",
    "target": "Bank Account No fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.ui.AddPKBankAccountView",
    "source": "net.nanopay.bank.ui.AddPKBankAccountView.INSTITUTION.label",
    "target": "Institution Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.bank.BankWeekend",
    "source": "net.nanopay.bank.BankWeekend.REGION_ID.label",
    "target": "Region fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.UpdateUserInfoLabel",
    "target": "Update User Info fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.PersonalInformationLabel",
    "target": "Personal Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.FirstNameLabel",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.LastNameLabel",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.EmailLabel",
    "target": "Email * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.PhoneNumberLabel",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.BirthdayLabel",
    "target": "Birthday fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.HomeAddressLabel",
    "target": "Home Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.StNoLabel",
    "target": "St No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.StNameLabel",
    "target": "St Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.AddressLineLabel",
    "target": "Address Line fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.CityLabel",
    "target": "City fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.ProvinceLabel",
    "target": "Province fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.CountryLabel",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.PostalCodeLabel",
    "target": "Postal Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.PasswordLabel",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.NewPasswordLabel",
    "target": "New Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.ConfirmPasswordLabel",
    "target": "Confirm Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.GroupLabel",
    "target": "Group * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.OrganizationLabel",
    "target": "Organization fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.DepartmentLabel",
    "target": "Department fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.ui.UserDetailView",
    "source": "net.nanopay.auth.ui.UserDetailView.JobTitleLabel",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.auth.CheckCurrencyRule",
    "source": "net.nanopay.auth.CheckCurrencyRule.LACKS_PERMISSION",
    "target": "You do not have permission to work with this currency:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.BalanceView",
    "source": "net.nanopay.ui.BalanceView.title",
    "target": "Digital Cash Balance fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.TITLE",
    "target": "Verify your bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.INSTRUCTIONS_1",
    "target": "To verify that you own this account, we have made a micro-deposit (a small transaction between $0.01-$0.99).  This will appear in your account records in 2-3 business days. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.INSTRUCTIONS_2",
    "target": "When the micro-deposit appears, enter the amount of the transaction below to verify your bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.MICRO",
    "target": "Micro deposit amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.MICRO_PLACEHOLDER",
    "target": "Enter micro-deposit amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.CONNECTING",
    "target": "Connecting... This may take a few minutes. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.INVALID_FORM",
    "target": "You have entered an invalid amount. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.DEFAULT_ERROR",
    "target": "An error occurred while processing your request. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.SUCCESS_ONE",
    "target": "Your bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm",
    "source": "net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm.SUCCESS_TWO",
    "target": "is now verified. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.SaveSuccessfulMessage",
    "target": "Progress saved. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.SaveFailureMessage",
    "target": "Could not save your changes. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.SubmitSuccessMessage",
    "target": "Registration submitted successfully! You will receive a confirmation email in your mailbox fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.SubmitFailureMessage",
    "target": "Registration submission failed. Please try again later. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorMissingFields",
    "target": "Please fill out all necessary fields before proceeding. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorAdminJobTitleMessage",
    "target": "Job title required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorAdminNumberMessage",
    "target": "Invalid phone number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfileNameMessage",
    "target": "Business name required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfilePhoneMessage",
    "target": "Invalid business phone number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfileTypeMessage",
    "target": "Business type required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfileRegistrationNumberMessage",
    "target": "Business registration number required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfileRegistrationAuthorityMessage",
    "target": "Business registration authority required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfileRegistrationDateMessage",
    "target": "Invalid business registration date. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfileStreetNumberMessage",
    "target": "Invalid street number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfileStreetNameMessage",
    "target": "Invalid street name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfileCityMessage",
    "target": "Invalid city name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorBusinessProfilePostalCodeMessage",
    "target": "Invalid postal code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorQuestionnaireMessage",
    "target": "You must answer each question. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorFirstNameTooLong",
    "target": "First name cannot exceed 70 characters. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorFirstNameDigits",
    "target": "First name cannot contain numbers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorMiddleNameTooLong",
    "target": "Middle name cannot exceed 70 characters. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorMiddleNameDigits",
    "target": "Middle name cannot contain numbers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorLastNameTooLong",
    "target": "Last name cannot exceed 70 characters. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorLastNameDigits",
    "target": "Last name cannot contain numbers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard",
    "source": "net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard.ErrorTermsAndConditionsMessage",
    "target": "Please accept the terms and conditions. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.SaveAndLogOutModal",
    "source": "net.nanopay.onboarding.b2b.ui.SaveAndLogOutModal.Description",
    "target": "Are you sure you want to logout? Any unsaved data will be lost. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessInformationSubtitle",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessAddressSubtitle",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessNameLabel",
    "target": "Registered Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessPhoneLabel",
    "target": "Business Phone fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.CountryCodeLabel",
    "target": "Country Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.PhoneNumberLabel",
    "target": "Business Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.WebsiteLabel",
    "target": "Website (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessTypeLabel",
    "target": "Business Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessRegistrationNumberLabel",
    "target": "Business Registration Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.RegistrationAuthorityLabel",
    "target": "Registration Authority fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.RegistrationDateLabel",
    "target": "Registration Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessAddressLabel",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.CountryLabel",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.StreetNumberLabel",
    "target": "Street Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.StreetNameLabel",
    "target": "Street Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.Address2Label",
    "target": "Address 2 (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.Address2Hint",
    "target": "Apartment, suite, unit, building, floor, etc. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.ProvinceLabel",
    "target": "Province fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.CityLabel",
    "target": "City fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.PostalCodeLabel",
    "target": "Postal Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessProfilePictureSubtitle",
    "target": "Business Logo (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessTypeDescriptionSole",
    "target": "A sole proprietorship is an unincorporated business owned by an individual. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessTypeDescriptionPart",
    "target": "A partnership is an unincorporated business owned by two or more persons, carrying on business together, generally for profit. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessTypeDescriptionCorp",
    "target": "A private or public corporation is a legal entity that is separate and distinct from its owners, shareholders of the corporation, directors and officers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm",
    "source": "net.nanopay.onboarding.b2b.ui.BusinessProfileForm.BusinessTypeDescriptionNonP",
    "target": "An not-for-profit (organization) is a provincially or federally incorporated organization that provides products or services without making profit. They are generally dedicated to activities that improve or benefit a community. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.BasicInfoLabel",
    "target": "Basic Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.LegalNameLabel",
    "target": "Legal Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.FirstNameLabel",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.MiddleNameLabel",
    "target": "Middle Initials (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.LastNameLabel",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.JobTitleLabel",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.EmailAddressLabel",
    "target": "Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.CountryCodeLabel",
    "target": "Country Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.PhoneNumberLabel",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.DateOfBirthLabel",
    "target": "Date of Birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.ResidentialAddressLabel",
    "target": "Residential Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.CountryLabel",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.StreetNumberLabel",
    "target": "Street Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.StreetNameLabel",
    "target": "Street Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.Address2Label",
    "target": "Address 2 (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.Address2Hint",
    "target": "Apartment, suite, unit, building, floor, etc. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.ProvinceLabel",
    "target": "Province fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.CityLabel",
    "target": "City fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.PostalCodeLabel",
    "target": "Postal Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm",
    "source": "net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm.PrincipalOwnerError",
    "target": "A principal owner with that name already exists. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm",
    "source": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm.LegalNameLabel",
    "target": "Legal Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm",
    "source": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm.FirstNameLabel",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm",
    "source": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm.MiddleInitialsLabel",
    "target": "Middle Initials (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm",
    "source": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm.LastNameLabel",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm",
    "source": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm.JobTitleLabel",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm",
    "source": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm.EmailAddressLabel",
    "target": "Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm",
    "source": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm.CountryCodeLabel",
    "target": "Country Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm",
    "source": "net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm.PhoneNumberLabel",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.NextStepView",
    "source": "net.nanopay.onboarding.b2b.ui.NextStepView.Title",
    "target": "1. Next Step fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.NextStepView",
    "source": "net.nanopay.onboarding.b2b.ui.NextStepView.Description",
    "target": "Go to portal and start using the nanopay services. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.Title",
    "target": "Review and Submit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.Description",
    "target": "Please review your profile details before submitting. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BoxTitle1",
    "target": "1. Business Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BoxTitle2",
    "target": "2. Principal Owner(s) Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BoxTitle3",
    "target": "3. Questionaire fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BoxTitle4",
    "target": "4. Terms & Conditions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.EditLabel",
    "target": "Edit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiNameLabel",
    "target": "Registered Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiPhoneLabel",
    "target": "Business Phone fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiWebsiteLabel",
    "target": "Website (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiTypeLabel",
    "target": "Business Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiRegNumberLabel",
    "target": "Business Registration Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiRegAuthLabel",
    "target": "Registration Authority fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiRegDateLabel",
    "target": "Registration Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiAddressLabel",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm",
    "source": "net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm.BusiLogoLabel",
    "target": "Business Logo (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.UploadAdditionalDocumentsView",
    "source": "net.nanopay.onboarding.b2b.ui.UploadAdditionalDocumentsView.Title",
    "target": "1. Upload Additional Documents fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.UploadAdditionalDocumentsView",
    "source": "net.nanopay.onboarding.b2b.ui.UploadAdditionalDocumentsView.Description",
    "target": "Upload any additional documents upon request. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.Title",
    "target": "View Submitted Registration Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.Description",
    "target": "You can view the registration details, but please be aware that you can no longer edit the profile. If you want to make any changes, please contact support@yourcompany.com. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BoxTitle1",
    "target": "Previously Submitted Additional Documents fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BoxTitle2",
    "target": "1. Business Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BoxTitle3",
    "target": "2. Principal Owner's Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BoxTitle4",
    "target": "3. Questionnaire fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.CloseLabel",
    "target": "Close fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiNameLabel",
    "target": "Registered Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiPhoneLabel",
    "target": "Business Phone fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiWebsiteLabel",
    "target": "Website (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiTypeLabel",
    "target": "Business Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiRegNumberLabel",
    "target": "Business Registration Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiRegAuthLabel",
    "target": "Registration Authority fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiRegDateLabel",
    "target": "Registration Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiAddressLabel",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView.BusiLogoLabel",
    "target": "Business Logo (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedRegistrationView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedRegistrationView.Title",
    "target": "2. View Submitted Registration fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedRegistrationView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedRegistrationView.Description1",
    "target": "You can view the registration details, but please be aware that you can no longer edit the profile. If you want to make any changes, please contact  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.ViewSubmittedRegistrationView",
    "source": "net.nanopay.onboarding.b2b.ui.ViewSubmittedRegistrationView.Description2",
    "target": "You can view the registration details, but please be aware that you won’t be able to edit them here. If you want to make any changes, please go to portal and edit in the setting. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView",
    "source": "net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView.UploadSuccess",
    "target": "Documents uploaded successfully!\nYou may view them in your submitted registration section. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView",
    "source": "net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView.UploadFailure",
    "target": "Failed to upload documents.\nPlease try again later. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm",
    "source": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm.emptyOriginal",
    "target": "Please enter your original password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm",
    "source": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm.emptyPassword",
    "target": "Please enter your new password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm",
    "source": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm.emptyConfirmation",
    "target": "Please re-enter your new password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm",
    "source": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm.invalidPassword",
    "target": "Password must be at least 6 characters long. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm",
    "source": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm.passwordMismatch",
    "target": "Passwords do not match fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm",
    "source": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm.passwordSuccess",
    "target": "Password successfully updated fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm",
    "source": "net.nanopay.onboarding.b2b.ui.PasswordChangeForm.passwordDescription",
    "target": "Please change you password before you start using the nanopay platform. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.afex.AFEXCredentials",
    "source": "net.nanopay.fx.afex.AFEXCredentials.INTERNATIONAL_FEE.label",
    "target": "International fee fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.fx.afex.AFEXCredentials",
    "source": "net.nanopay.fx.afex.AFEXCredentials.DOMESTIC_FEE.label",
    "target": "Domestic fee fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.KotakPaymentPurposeLineItem",
    "source": "net.nanopay.tx.KotakPaymentPurposeLineItem.PURPOSE_CODE.label",
    "target": "Purpose of Transfer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.KotakAccountRelationshipLineItem",
    "source": "net.nanopay.tx.KotakAccountRelationshipLineItem.ACCOUNT_RELATIONSHIP.label",
    "target": "Relationship with the contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.InvoiceTransaction",
    "source": "net.nanopay.tx.InvoiceTransaction.TOTAL.label",
    "target": "Total Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.RefundTransaction",
    "source": "net.nanopay.tx.RefundTransaction.TOTAL.label",
    "target": "Total Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.RetailTransaction",
    "source": "net.nanopay.tx.RetailTransaction.TIP.label",
    "target": "Tip fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.RetailTransaction",
    "source": "net.nanopay.tx.RetailTransaction.TOTAL.label",
    "target": "Total Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.RetailTransaction",
    "source": "net.nanopay.tx.RetailTransaction.NOTES.label",
    "target": "Notes fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.DVPTransaction",
    "source": "net.nanopay.tx.DVPTransaction.DESTINATION_AMOUNT.label",
    "target": "Destination Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.exposure.ExposureOverview",
    "source": "net.nanopay.tx.ui.exposure.ExposureOverview.EXPOSURE_CURRENT",
    "target": "CURRENT EXPOSURE fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.exposure.ExposureOverview",
    "source": "net.nanopay.tx.ui.exposure.ExposureOverview.EXPOSURE_MAX",
    "target": "MAXIMUM EXPOSURE fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.exposure.ExposureOverview",
    "source": "net.nanopay.tx.ui.exposure.ExposureOverview.EXPOSURE_UTILIZATION",
    "target": "EXPOSURE UTILIZATION fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.exposure.ExposureOverview",
    "source": "net.nanopay.tx.ui.exposure.ExposureOverview.EXPOSURE_ALLOCATED",
    "target": "LIQUIDITY ALLOCATED fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.exposure.ExposureOverview",
    "source": "net.nanopay.tx.ui.exposure.ExposureOverview.EXPOSURE_UNALLOCATED",
    "target": "LIQUIDITY UNALLOCATED fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.exposure.ExposureOverview",
    "source": "net.nanopay.tx.ui.exposure.ExposureOverview.EXPOSURE_ALLOCATION_UTILIZATION",
    "target": "LIQUIDITY UTILIZATION fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.exposure.ExposureOverview",
    "source": "net.nanopay.tx.ui.exposure.ExposureOverview.RELATED_ACCOUNTS",
    "target": "RELATED ACCOUNTS fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.exposure.ExposureOverview",
    "source": "net.nanopay.tx.ui.exposure.ExposureOverview.CALCULATING",
    "target": "Calculating... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.TransactionsView",
    "source": "net.nanopay.tx.ui.TransactionsView.myAccounts",
    "target": "My Accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.TransactionsView",
    "source": "net.nanopay.tx.ui.TransactionsView.recentActivities",
    "target": "Recent Activities fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.TransactionsView",
    "source": "net.nanopay.tx.ui.TransactionsView.placeholderText",
    "target": "You don't have any recent transactions right now. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.ManageDeviceModal",
    "source": "net.nanopay.retail.ui.devices.ManageDeviceModal.Title",
    "target": "Manage Device fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.ManageDeviceModal",
    "source": "net.nanopay.retail.ui.devices.ManageDeviceModal.Description",
    "target": "Please select an option to manage your device. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceNameForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceNameForm.Step",
    "target": "Step 1: Name your device. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceNameForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceNameForm.Instructions",
    "target": "Please name your device to help distinguish it among other devices. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceNameForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceNameForm.NameLabel",
    "target": "Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceTypeForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceTypeForm.Step",
    "target": "Step 2: Select your device type. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceTypeForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceTypeForm.DeviceTypeLabel",
    "target": "Device Type * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceTypeForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceTypeForm.Instructions",
    "target": "Please navigate to the Merchant Web App (for iOS and Android tablets only). fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceTypeForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceTypeForm.Error",
    "target": "Device type required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceSerialForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceSerialForm.Step",
    "target": "Step 2: Input the device's serial number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceSerialForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceSerialForm.Instructions",
    "target": "Open the Merchant App on your device and enter the 16 alphanumeric serial code displayed on the screen of the device. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DeviceSerialForm",
    "source": "net.nanopay.retail.ui.devices.form.DeviceSerialForm.SerialLabel",
    "target": "Serial # * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DevicePasswordForm",
    "source": "net.nanopay.retail.ui.devices.form.DevicePasswordForm.Step",
    "target": "Step 3: Use the following code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.retail.ui.devices.form.DevicePasswordForm",
    "source": "net.nanopay.retail.ui.devices.form.DevicePasswordForm.Instructions",
    "target": "Please input the following code on the device you want to provision and follow the instructions on your device to finish the process. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.AboutView",
    "source": "net.nanopay.merchant.ui.AboutView.version",
    "target": "0.0.1 fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.AboutView",
    "source": "net.nanopay.merchant.ui.AboutView.rights",
    "target": "All rights reserved. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.ErrorView",
    "source": "net.nanopay.merchant.ui.ErrorView.paymentError",
    "target": "Payment failed. Please try again fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.ErrorView",
    "source": "net.nanopay.merchant.ui.ErrorView.refundError",
    "target": "Refund failed. Please try again fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.QRCodeView",
    "source": "net.nanopay.merchant.ui.QRCodeView.instruction1",
    "target": "1. Open MintChip App fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.QRCodeView",
    "source": "net.nanopay.merchant.ui.QRCodeView.instruction2",
    "target": "2. Tap Pay Merchant fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.QRCodeView",
    "source": "net.nanopay.merchant.ui.QRCodeView.instruction3",
    "target": "3. Scan QR Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.SuccessView",
    "source": "net.nanopay.merchant.ui.SuccessView.paymentSuccess",
    "target": "Money Collected Successfully fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.SuccessView",
    "source": "net.nanopay.merchant.ui.SuccessView.refundSuccess",
    "target": "Money Refunded Successfully fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.setup.SetupSuccessView",
    "source": "net.nanopay.merchant.ui.setup.SetupSuccessView.provisionSuccess",
    "target": "Your device has been successfully provisioned! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.setup.SetupSuccessView",
    "source": "net.nanopay.merchant.ui.setup.SetupSuccessView.provisionButton",
    "target": "Start accepting payments! >> fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.setup.SetupView",
    "source": "net.nanopay.merchant.ui.setup.SetupView.instructions",
    "target": "Input the serial number above in the retail portal and press next to provision this device. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.merchant.ui.transaction.EmptyTransactionListView",
    "source": "net.nanopay.merchant.ui.transaction.EmptyTransactionListView.noTransactions",
    "target": "You don’t have any transactions yet. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ActivateProfileModal",
    "source": "net.nanopay.admin.ui.ActivateProfileModal.Description",
    "target": "Are you sure you want to activate this profile? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.Title",
    "target": "Add Business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.Description",
    "target": "Fill in the details for the admin user of this business, the user will receive an email with login credentials after. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.LegalNameLabel",
    "target": "Legal Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.FirstNameLabel",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.MiddleNameLabel",
    "target": "Middle Initials (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.LastNameLabel",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.JobTitleLabel",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.EmailLabel",
    "target": "Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.ConfirmEmailLabel",
    "target": "Confirm Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.CountryCodeLabel",
    "target": "Country Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.AddBusinessView",
    "source": "net.nanopay.admin.ui.AddBusinessView.PhoneNumberLabel",
    "target": "Business Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.DisableProfileModal",
    "source": "net.nanopay.admin.ui.DisableProfileModal.Description",
    "target": "Are you sure you want to disable this profile? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.Title",
    "target": "Edit Business Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.Subtitle",
    "target": "Account ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.LegalNameLabel",
    "target": "Legal Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.FirstNameLabel",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.MiddleNameLabel",
    "target": "Middle Initials (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.LastNameLabel",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.JobTitleLabel",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.EmailLabel",
    "target": "Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.CountryCodeLabel",
    "target": "Country Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.EditBusinessView",
    "source": "net.nanopay.admin.ui.EditBusinessView.PhoneNumberLabel",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ResendInviteModal",
    "source": "net.nanopay.admin.ui.ResendInviteModal.Description",
    "target": "Are you sure you want to resend this invitation? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BoxTitle1",
    "target": "Previously Submitted Additional Documents fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BoxTitle2",
    "target": "1. Business Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BoxTitle3",
    "target": "2. Principal Owner's Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BoxTitle4",
    "target": "3. Questionnaire fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.CloseLabel",
    "target": "Close fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiNameLabel",
    "target": "Registered Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiPhoneLabel",
    "target": "Business Phone fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiWebsiteLabel",
    "target": "Website (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiTypeLabel",
    "target": "Business Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiRegNumberLabel",
    "target": "Business Registration Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiRegAuthLabel",
    "target": "Registration Authority fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiRegDateLabel",
    "target": "Registration Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiAddressLabel",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.ReviewProfileView",
    "source": "net.nanopay.admin.ui.ReviewProfileView.BusiLogoLabel",
    "target": "Business Logo (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.RevokeInviteModal",
    "source": "net.nanopay.admin.ui.RevokeInviteModal.Description",
    "target": "Are you sure you want to revoke this invitation? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.TransactionView",
    "source": "net.nanopay.admin.ui.TransactionView.noPendingTransactions",
    "target": "There is no transaction in your network yet. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.TransactionsAccountsView",
    "source": "net.nanopay.tx.ui.TransactionsAccountsView.balanceTitle",
    "target": "Balance fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ui.TransactionsAccountsView",
    "source": "net.nanopay.tx.ui.TransactionsAccountsView.placeholderText",
    "target": "You don’t have any cash in or cash out transactions. Verify a bank account to proceed to cash in or cash out. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.TransactionDetailView",
    "source": "net.nanopay.admin.ui.TransactionDetailView.transactionAmountTitle",
    "target": "Transaction Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.TransactionDetailView",
    "source": "net.nanopay.admin.ui.TransactionDetailView.totalFeeTitle",
    "target": "Total Cost fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.TransactionDetailView",
    "source": "net.nanopay.admin.ui.TransactionDetailView.etaTitle",
    "target": "ETA fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.UserView",
    "source": "net.nanopay.admin.ui.UserView.placeholderText",
    "target": "Looks like their aren't any users registered yet. Please add users by clicking the Add User button above. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.UserView",
    "source": "net.nanopay.admin.ui.UserView.AddShopper",
    "target": "Add Shopper fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ApiBrowser",
    "source": "foam.doc.ApiBrowser.Title",
    "target": "API Documentation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ServiceTypeDescription",
    "source": "foam.doc.ServiceTypeDescription.Title",
    "target": "Service Types fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ServiceTypeDescription",
    "source": "foam.doc.ServiceTypeDescription.TitleDescription",
    "target": "Services play multiple roles within the nanopay system. Available services can be categorized into 2 types, all of which are detailed below. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ServiceTypeDescription",
    "source": "foam.doc.ServiceTypeDescription.InterfaceTitle",
    "target": "Interface Services fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ServiceTypeDescription",
    "source": "foam.doc.ServiceTypeDescription.InterfaceDescription",
    "target": "Services labelled as Interface have methods that take in arguments which process calls accordingly. Example: The “exchangeRate” service has a method “getFromSource” which requires a targetCurrency (ex: ‘CAD’), sourceCurrency (ex: ‘INR), amount (ex: 1). As a response, the service will return an object containing fields correlating to the arguments provided and providing exchange rates retrieved from the DAOs and/or third party sources. (Currently Unsupported) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ServiceTypeDescription",
    "source": "foam.doc.ServiceTypeDescription.DAOTitle",
    "target": "DAO Services fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ServiceTypeDescription",
    "source": "foam.doc.ServiceTypeDescription.DAODescription",
    "target": "Services without any specified label are Data access objects (DAO) which store information on the system, whether it be in memory or in journal files. These DAOs are further extended with features using decorators. The service call is unable to dictate the functionality of the decorators unless the appropriate values contained within the dataobject exist. Most DAOs require authentication and appropriate permissions enabled on the user to access and utilize. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ServiceTypeDescription",
    "source": "foam.doc.ServiceTypeDescription.ServiceListTitle",
    "target": "nanopay Service List fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ServiceTypeDescription",
    "source": "foam.doc.ServiceTypeDescription.ServiceListDescription",
    "target": "The following list details the services within the nanopay system, listing each service name, providing a short description of its purpose, & providing examples detailing how to utilize them. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ExampleRequestView",
    "source": "foam.doc.ExampleRequestView.Title",
    "target": "Making Requests fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ExampleRequestView",
    "source": "foam.doc.ExampleRequestView.IntroMessage",
    "target": "Welcome to the nanopay API documentation. This API will give you the ability to connect your software to banking infrastructure to move money, store funds, and verify bank accounts.  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ExampleRequestView",
    "source": "foam.doc.ExampleRequestView.MakingRequests",
    "target": "Request and response bodies are JSON encoded. Requests must contain api credentials (email/password provided by nanopay) on the authorization tag. Data contained in the table views below encompass model details which are associated to the service. Properties or information required are added to the examples shown in the curl service call. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ExampleRequestView",
    "source": "foam.doc.ExampleRequestView.MakingRequests2nd",
    "target": "Queries follow the MQL Query Language, a generic google-like query-language. A link to the MQL documentation can be found below:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ExampleRequestView",
    "source": "foam.doc.ExampleRequestView.UserExampleGetLabel",
    "target": "Below is an example GET request to the publicUserDAO using curl. This will return all public user information: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ExampleRequestView",
    "source": "foam.doc.ExampleRequestView.UserExamplePostLabel",
    "target": "Below is an example POST request to the userDAO using curl. This will create a basic nanopay user. (POST requests can create and update objects): fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.ExampleRequestView",
    "source": "foam.doc.ExampleRequestView.QueryExampleGetLabel",
    "target": "Below is an example of a GET request with a query to the publicUserDAO using curl. This will return all public users with the first name \"John\" and last name \"Smith\": fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.GetRequestView",
    "source": "foam.doc.GetRequestView.Label",
    "target": "Get Request:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "foam.doc.PutRequestView",
    "source": "foam.doc.PutRequestView.Label",
    "target": "(Create & Update) POST Request:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.OverviewView",
    "source": "net.nanopay.admin.ui.OverviewView.Title",
    "target": "Nanopay Platform Overview (PDF) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.Title",
    "target": "Sample API Requests fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.Intro",
    "target": "The following are curl examples of the most common endpoints within the nanopay system. These examples will cover creating and retrieving Users, Accounts & Transactions. Authentication and permission access is based off username and password provided in the request.  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.UserCreateTitle",
    "target": "Create User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.UserCreateInfo",
    "target": "The following creates a user within the nanopay system as a basic user.This will allow you to make transactions within the system. A default account will be created in association to the user created. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.UserGetTitle",
    "target": "Get Public Users fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.UserGetInfo",
    "target": "The following request provides all users in the system that have marked themselves a public. These users will appear in various searches within the platform and will be available to send/receive payments. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.AccountGetTitle",
    "target": "Get Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.AccountGetInfo",
    "target": "The following request will provide the account associated to the owner ID (User ID) provided. User IDs correlate directly to account IDs. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.SendTransactionTitle",
    "target": "Send Transaction (User ID) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.SendTransactionInfo",
    "target": "The following request will send a payment to the payee' default account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.SendTransactionAccountTitle",
    "target": "Send Transaction (Account ID) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.SendTransactionAccountInfo",
    "target": "The following request will process a payment based on the provided account.The source account provides the payment and destination account will receive the payment. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.TransactionGetTitle",
    "target": "Get All Transactions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.TransactionGetInfo",
    "target": "The following request will provide all the transactions the user used for authenticationhas access to. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.TransactionAccountGetTitle",
    "target": "Get Transactions By Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.TransactionAccountGetInfo",
    "target": "The following request will provide all the transactions related to the provided account ID. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.TransactionUserGetTitle",
    "target": "Get Transactions By User fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.SampleRequestView",
    "source": "net.nanopay.admin.ui.SampleRequestView.TransactionUserGetInfo",
    "target": "The following request will provide all the transactions related to the provided user ID. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm.Step",
    "target": "Step 1: Fill in merchant's information and create a password. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm.MerchantInformationLabel",
    "target": "Merchant Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm.FirstNameLabel",
    "target": "First Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm.LastNameLabel",
    "target": "Last Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm.PhoneNumberLabel",
    "target": "Phone Number * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm.PasswordLabel",
    "target": "Password * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm.ConfirmPasswordLabel",
    "target": "Confirm Password * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.Step",
    "target": "Step 2: Fill in the merchant's business profile. scroll down to continue and hit next when finished fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.BusinessInformationLabel",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.BusinessNameLabel",
    "target": "Business Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.CountryLabel",
    "target": "Country * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.CompanyEmailLabel",
    "target": "Business Email * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.RegistrationNoLabel",
    "target": "Registration No. * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.CompanyTypeLabel",
    "target": "Business Type * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.BusinessSectorLabel",
    "target": "Business Sector * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.WebsiteLabel",
    "target": "Website fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.BusinessAddressLabel",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.StNoLabel",
    "target": "St No. * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.StNameLabel",
    "target": "St Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.AddressLineLabel",
    "target": "Address line fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.CityLabel",
    "target": "City * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.ProvinceLabel",
    "target": "Province * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm.PostalCodeLabel",
    "target": "Postal Code * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantSendMoneyForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantSendMoneyForm.Step",
    "target": "Step 4: Input the amount of money you want to send to the user or click next to skip. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantSendMoneyForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantSendMoneyForm.AmountLabel",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.Step",
    "target": "Step 3: Please scroll down and review all the details of the merchant. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.MerchantInfoLabel",
    "target": "Merchant Info fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.FirstNameLabel",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.LastNameLabel",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.EmailLabel",
    "target": "Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.PhoneLabel",
    "target": "Phone fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.PasswordLabel",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.BusinessProfileLabel",
    "target": "Business Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.CompanyEmailLabel",
    "target": "Business Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.CompanyTypeLabel",
    "target": "Business Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.RegistrationNumberLabel",
    "target": "Registration Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.BusinessSectorLabel",
    "target": "Business Sector fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.WebsiteLabel",
    "target": "Website fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.AddressLabel",
    "target": "Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.SendMoneyLabel",
    "target": "Send Money fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm",
    "source": "net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm.AmountLabel",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.Step",
    "target": "Step 1: Fill in shopper's information, scroll down to continue and hit next when finished. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.PersonalInformationLabel",
    "target": "Personal Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.FirstNameLabel",
    "target": "First Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.LastNameLabel",
    "target": "Last Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.EmailAddressLabel",
    "target": "Email Address * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.PhoneNumberLabel",
    "target": "Phone Number * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.BirthdayLabel",
    "target": "Birthday * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.HomeAddressLabel",
    "target": "Home Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.StNoLabel",
    "target": "St No. * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.StNameLabel",
    "target": "St Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.AddressLineLabel",
    "target": "Address Line fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.CityLabel",
    "target": "City * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.ProvinceLabel",
    "target": "Province * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.PostalCodeLabel",
    "target": "Postal Code * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.PasswordLabel",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.CreateAPasswordLabel",
    "target": "Create a Password * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperInfoForm.ConfirmPasswordLabel",
    "target": "Confirm Password * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperSendMoneyForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperSendMoneyForm.Step",
    "target": "Step 3: Input the amount of money you want to send to the user or click next to skip. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperSendMoneyForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperSendMoneyForm.AmountLabel",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.Step",
    "target": "Step 2: Please review all the information details of the user. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.ShopperInfoLabel",
    "target": "Shopper Info fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.EmailLabel",
    "target": "Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.PhoneNumberLabel",
    "target": "Phone No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.BirthdayLabel",
    "target": "Birthday fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.AddressLabel",
    "target": "Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.PasswordLabel",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.SendMoneyLabel",
    "target": "Send Money fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm",
    "source": "net.nanopay.admin.ui.form.shopper.AddShopperReviewForm.AmountLabel",
    "target": "Sending Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.Step",
    "target": "Step 2: Fill in the business's business profile. scroll down to continue and hit next when finished fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.BusinessInformationLabel",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.BusinessNameLabel",
    "target": "Business Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.CountryLabel",
    "target": "Country * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.CompanyEmailLabel",
    "target": "Business Email * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.RegistrationNoLabel",
    "target": "Registration No. * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.IssueAuthorityLabel",
    "target": "Issuing Authority  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.CompanyTypeLabel",
    "target": "Business Type * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.BusinessSectorLabel",
    "target": "Business Sector * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.WebsiteLabel",
    "target": "Website  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.BusinessAddressLabel",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.StNoLabel",
    "target": "St No. * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.StNameLabel",
    "target": "St Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.AddressLineLabel",
    "target": "Address line fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.CityLabel",
    "target": "City * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.ProvinceLabel",
    "target": "Province * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyProfileForm.PostalCodeLabel",
    "target": "Postal Code * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm.Step",
    "target": "Step 1: Fill in Admin's information and create account password. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm.FirstNameLabel",
    "target": "First Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm.LastNameLabel",
    "target": "Last Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm.JobTitleLabel",
    "target": "Job Title * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm.PhoneNumberLabel",
    "target": "Phone Number * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm.EmailLabel",
    "target": "Email * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm.PasswordLabel",
    "target": "Password * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyInfoForm.ConfirmPasswordLabel",
    "target": "Confirm Password * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.Step",
    "target": "Step 3: Please scroll down and review all the details of the business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.BusinessInfoLabel",
    "target": "Business Info fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.FirstNameLabel",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.LastNameLabel",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.JobTitleLabel",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.IssuingLabel",
    "target": "Issuing Authority fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.EmailLabel",
    "target": "Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.PhoneLabel",
    "target": "Phone fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.PasswordLabel",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.BusinessProfileLabel",
    "target": "Business Profile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.CompanyEmailLabel",
    "target": "Business Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.CompanyTypeLabel",
    "target": "Business Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.RegistrationNumberLabel",
    "target": "Registration Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.BusinessSectorLabel",
    "target": "Business Sector fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.WebsiteLabel",
    "target": "Website fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm",
    "source": "net.nanopay.admin.ui.form.company.AddCompanyReviewForm.AddressLabel",
    "target": "Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shared.AddUserDoneForm",
    "source": "net.nanopay.admin.ui.form.shared.AddUserDoneForm.Step",
    "target": "Step 4: Done! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shared.AddUserDoneForm",
    "source": "net.nanopay.admin.ui.form.shared.AddUserDoneForm.Description",
    "target": "An e-mail with the login information has been sent to this user. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.admin.ui.form.shared.AddUserDoneForm",
    "source": "net.nanopay.admin.ui.form.shared.AddUserDoneForm.ReferenceNumber",
    "target": "Reference No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.BankAccountsView",
    "source": "net.nanopay.cico.ui.bankAccount.BankAccountsView.TitleAll",
    "target": "Total Bank Accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.BankAccountsView",
    "source": "net.nanopay.cico.ui.bankAccount.BankAccountsView.TitleVerified",
    "target": "Verified Account(s) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.BankAccountsView",
    "source": "net.nanopay.cico.ui.bankAccount.BankAccountsView.TitleUnverified",
    "target": "Unverified Account(s) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.BankAccountsView",
    "source": "net.nanopay.cico.ui.bankAccount.BankAccountsView.TitleDisabled",
    "target": "Disabled Account(s) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.BankAccountsView",
    "source": "net.nanopay.cico.ui.bankAccount.BankAccountsView.ActionAdd",
    "target": "Add a new bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.BankAccountsView",
    "source": "net.nanopay.cico.ui.bankAccount.BankAccountsView.MyBlankAccounts",
    "target": "My Bank Accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.BankAccountsView",
    "source": "net.nanopay.cico.ui.bankAccount.BankAccountsView.placeholderText",
    "target": "You don't have any bank accounts right now. Click the Add a bank account button to add a new bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.Step",
    "target": "Step 3: Please select your cashout plan. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.Instructions",
    "target": "There are no contracts, sign up or cancellation fees.  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.More",
    "target": "Learn more about our cash out plans. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.AutoCashout",
    "target": "Auto cashout fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.Error",
    "target": "Must select one cashout option. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.AutoError",
    "target": "Auto cashout option not selected. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.Option1",
    "target": "Pay-as-you-Go fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.Option2",
    "target": "Unlimited fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.Pricing1",
    "target": "$1/Cashout fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.Pricing2",
    "target": "$5/Month fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankCashoutForm.PromoCode",
    "target": "Enter promo code: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankDoneForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankDoneForm.Step",
    "target": "Step 4: Done! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankDoneForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankDoneForm.SuccessMessage",
    "target": "You have successfully added and verified this bank account! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankDoneForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankDoneForm.Back",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankDoneForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankDoneForm.Done",
    "target": "Done fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankForm.Accept",
    "target": "I Agree fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankForm.Next",
    "target": "Next fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankForm.Later",
    "target": "Come back later fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankForm.Verify",
    "target": "Verify fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankForm.Back",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankForm.Done",
    "target": "Done fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.Guide",
    "target": "Don't know where to find these numbers? Check your cheque or contact your bank representative. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.Instructions",
    "target": "Give your bank account a name to manage multiple accounts. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.LabelAccount",
    "target": "Account No. * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.LabelInstitute",
    "target": "Institution No. * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.LabelName",
    "target": "Name * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.LabelTransit",
    "target": "Transit No. * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.Step",
    "target": "Step 1: Please provide your bank account information below. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.TC1",
    "target": "I authorize nanopay Corporation to withdraw from my (debit)account with the financial institution listed above from time to time for the amount that I specify when processing a one-time (\"sporadic\") pre-authorized debit. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.TC2",
    "target": "I have certain recourse rights if any debit does not comply with this agreement. For example, I have right to receive reimbursement for any debit that is not authorized or is not consistent with the PAD Agreement. To obtain more information on my recourse rights, I may contact my financial institution or visit www.cdnpay.ca. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.TC3",
    "target": "This Authorization may be cancelled at any time upon notice being provided by me, either in writing or orally, with proper authorization to verify my identity. I acknowledge that I can obtain a sample cancellation form or further information on my right to cancel this Agreement from nanopay Corporation or by visiting www.cdnpay.ca. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.Next",
    "target": "Next fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankInfoForm.Back",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm.Step",
    "target": "Step 2: Please verify your bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm.Instructions1",
    "target": "We have debited and credited an amount between $0.01 - $0.99 to the account you have provided. The amount will appear in your account 2-3 business days from the account creation date. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm.Instructions2",
    "target": "Please input the amount below to verify your account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm.Later",
    "target": "Come back later fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm",
    "source": "net.nanopay.cico.ui.bankAccount.form.BankVerificationForm.Verify",
    "target": "Verify fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.ManageAccountModal",
    "source": "net.nanopay.cico.ui.bankAccount.ManageAccountModal.Title",
    "target": "Manage Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.bankAccount.ManageAccountModal",
    "source": "net.nanopay.cico.ui.bankAccount.ManageAccountModal.Description",
    "target": "Please select an option to manage your bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.CicoView",
    "source": "net.nanopay.cico.ui.CicoView.balanceTitle",
    "target": "Balance fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.CicoView",
    "source": "net.nanopay.cico.ui.CicoView.placeholderText",
    "target": "You don’t have any cash in or cash out transactions. Verify a bank account to proceed to cash in or cash out. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ExpiryLineItem",
    "source": "net.nanopay.tx.ExpiryLineItem.EXPIRY.label",
    "target": "Expires fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.tx.ExpenseLineItem",
    "source": "net.nanopay.tx.ExpenseLineItem.REVERSABLE.label",
    "target": "Refundable fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.CicoBorder",
    "source": "net.nanopay.cico.ui.CicoBorder.balanceTitle",
    "target": "Balance fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.RecurringInvoice",
    "source": "net.nanopay.invoice.model.RecurringInvoice.ENDS_AFTER.label",
    "target": "Occurrences fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.RecurringInvoice",
    "source": "net.nanopay.invoice.model.RecurringInvoice.AMOUNT.label",
    "target": "Amount Per Invoice fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.RecurringInvoice",
    "source": "net.nanopay.invoice.model.RecurringInvoice.PAYEE_NAME.label",
    "target": "Vendor fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.RecurringInvoice",
    "source": "net.nanopay.invoice.model.RecurringInvoice.PAYER_NAME.label",
    "target": "Customer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.RecurringInvoice",
    "source": "net.nanopay.invoice.model.RecurringInvoice.INVOICE_NUMBER.label",
    "target": "Invoice # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.RecurringInvoice",
    "source": "net.nanopay.invoice.model.RecurringInvoice.PURCHASE_ORDER.label",
    "target": "PO # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.model.RecurringInvoice",
    "source": "net.nanopay.invoice.model.RecurringInvoice.DUE_DATE.label",
    "target": "Date Due fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ExpensesView",
    "source": "net.nanopay.invoice.ui.ExpensesView.placeholderText",
    "target": "You don’t have any bills to pay now. When you receive an invoice from your partners, it will show up here. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.SalesView",
    "source": "net.nanopay.invoice.ui.SalesView.placeholderText",
    "target": "You haven’t sent any invoices yet. After you send an invoice to your partners, it will show up here. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceSummaryView",
    "source": "net.nanopay.invoice.ui.InvoiceSummaryView.UNPAID_LABEL",
    "target": "Unpaid fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceSummaryView",
    "source": "net.nanopay.invoice.ui.InvoiceSummaryView.OVERDUE_LABEL",
    "target": "Overdue fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceSummaryView",
    "source": "net.nanopay.invoice.ui.InvoiceSummaryView.NEW_LABEL",
    "target": "New fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceSummaryView",
    "source": "net.nanopay.invoice.ui.InvoiceSummaryView.SCHEDULED_LABEL",
    "target": "Scheduled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceSummaryView",
    "source": "net.nanopay.invoice.ui.InvoiceSummaryView.PAID_LABEL",
    "target": "Paid fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceSummaryView",
    "source": "net.nanopay.invoice.ui.InvoiceSummaryView.PROCESSING_LABEL",
    "target": "Processing fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.MentionsView",
    "source": "net.nanopay.invoice.ui.MentionsView.title",
    "target": "Mentions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.MentionsView",
    "source": "net.nanopay.invoice.ui.MentionsView.disputeLabel",
    "target": "Disputed fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.MentionsView",
    "source": "net.nanopay.invoice.ui.MentionsView.pendingLabel",
    "target": "Pending Approval fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.MentionsView",
    "source": "net.nanopay.invoice.ui.MentionsView.draftLabel",
    "target": "Draft fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.SalesDetailView",
    "source": "net.nanopay.invoice.ui.SalesDetailView.name",
    "target": "Note:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.TITLE",
    "target": "Payment details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.REVIEW_TITLE",
    "target": "Review this payment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.REVIEW_RECEIVABLE_TITLE",
    "target": "Review this receivable fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.ACCOUNT_WITHDRAW_LABEL",
    "target": "Withdraw from fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.ACCOUNT_DEPOSIT_LABEL",
    "target": "Deposit to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.AMOUNT_DUE_LABEL",
    "target": "Amount Due fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.EXCHANGE_RATE_LABEL",
    "target": "Exchange Rate fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.CONVERTED_AMOUNT_LABEL",
    "target": "Converted Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.TRANSACTION_FEE_LABEL",
    "target": "Transaction fee of  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.TRANSACTION_FEE_LABEL_2",
    "target": " will be charged at the end of the monthly billing cycle. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.AMOUNT_PAID_LABEL",
    "target": "Amount To Be Paid fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.AMOUNT_PAID_TO_LABEL",
    "target": "Amount Paid To You fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.CROSS_BORDER_PAYMENT_LABEL",
    "target": "Cross-border Payment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.FETCHING_RATES",
    "target": "Fetching Rates... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.LOADING",
    "target": "Getting quote... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.TO",
    "target": " to  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.ACCOUNT_FIND_ERROR",
    "target": "Error: Could not find account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.CURRENCY_FIND_ERROR",
    "target": "Error: Could not find currency. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.RATE_FETCH_FAILURE",
    "target": "Error fetching rates:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.NOTICE_TITLE",
    "target": "*NOTICE: EXCHANGE RATE SUBJECT TO CHANGE. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.NOTICE_WARNING",
    "target": "The final exchange rate and resulting amount to be paid will be displayed to the approver. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.AFEX_RATE_NOTICE",
    "target": "Rates provided are indicative until the payment is submitted. The rate displayed is held for 30 seconds at a time. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.UNABLE_TO_PAY_TITLE",
    "target": "*NOTICE: CANNOT PAY TO THIS CURRENCY. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.CANNOT_PAY_TO_CURRENCY",
    "target": "Sorry, you cannot pay to this currency. You require enabling FX on our platform to complete the payment. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.InvoiceRateView",
    "source": "net.nanopay.invoice.ui.InvoiceRateView.ADDITIONAL_INFORMATION",
    "target": "Additional information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableController",
    "source": "net.nanopay.invoice.ui.PayableController.VOID_SUCCESS",
    "target": "Invoice successfully voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableController",
    "source": "net.nanopay.invoice.ui.PayableController.VOID_ERROR",
    "target": "Invoice could not be voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.PayableController",
    "source": "net.nanopay.invoice.ui.PayableController.DELETE_DRAFT",
    "target": "Draft has been deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableController",
    "source": "net.nanopay.invoice.ui.ReceivableController.VOID_SUCCESS",
    "target": "Invoice successfully voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableController",
    "source": "net.nanopay.invoice.ui.ReceivableController.VOID_ERROR",
    "target": "Invoice could not be voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.ReceivableController",
    "source": "net.nanopay.invoice.ui.ReceivableController.DELETE_DRAFT",
    "target": "Draft has been deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.Title",
    "target": "Cash Out fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.Instructions1",
    "target": "Please select your new plan. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.Instructions2",
    "target": "All changes will take effect on your next cash out. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.TitlePayAsYouGo",
    "target": "Pay-as-you-Go fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.PricePayAsYouGo",
    "target": "$1/Cash out fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.TitleMonthly",
    "target": "Monthly fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.PriceMonthly",
    "target": "$5/Month fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.LabelPromo",
    "target": "Enter promo code: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.MinCashOut",
    "target": "* Minimum cashout is $5. To cash out less than the minimum, contact us at support@mintchip.ca fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView",
    "source": "net.nanopay.settings.autoCashout.AutoCashoutSettingsView.LearnMore",
    "target": "Learn more about our cash out plans. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.Title",
    "target": "Business Hours fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.MondayLabel",
    "target": "Mon. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.TuesdayLabel",
    "target": "Tue. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.WednesdayLabel",
    "target": "Wed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.ThursdayLabel",
    "target": "Thu. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.FridayLabel",
    "target": "Fri. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.SaturdayLabel",
    "target": "Sat. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.SundayLabel",
    "target": "Sun. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.BusinessHoursView",
    "source": "net.nanopay.settings.business.BusinessHoursView.ToLabel",
    "target": "To fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.BasicInfoLabel",
    "target": "Basic Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.LegalNameLabel",
    "target": "Legal Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.FirstNameLabel",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.MiddleNameLabel",
    "target": "Middle Initials (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.LastNameLabel",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.JobTitleLabel",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.EmailAddressLabel",
    "target": "Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.CountryCodeLabel",
    "target": "Country Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.PhoneNumberLabel",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.DateOfBirthLabel",
    "target": "Date of Birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.ResidentialAddressLabel",
    "target": "Residential Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.CountryLabel",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.StreetNumberLabel",
    "target": "Street Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.StreetNameLabel",
    "target": "Street Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.Address2Label",
    "target": "Address 2 (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.Address2Hint",
    "target": "Apartment, suite, unit, building, floor, etc. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.ProvinceLabel",
    "target": "Province fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.CityLabel",
    "target": "City fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditPrincipalOwnersView",
    "source": "net.nanopay.settings.business.EditPrincipalOwnersView.PostalCodeLabel",
    "target": "Postal Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessView",
    "source": "net.nanopay.settings.business.EditBusinessView.noInformation",
    "target": "Please fill out all necessary fields before proceeding. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessView",
    "source": "net.nanopay.settings.business.EditBusinessView.invalidPostal",
    "target": "Invalid postal code entry. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessView",
    "source": "net.nanopay.settings.business.EditBusinessView.structAddress",
    "target": "Enter street number and name for structured address. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessView",
    "source": "net.nanopay.settings.business.EditBusinessView.nonStructAddress",
    "target": "Enter an address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessInformationSubtitle",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessAddressSubtitle",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessNameLabel",
    "target": "Registered Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessPhoneLabel",
    "target": "Business Phone fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.CountryCodeLabel",
    "target": "Country Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.PhoneNumberLabel",
    "target": "Business Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.WebsiteLabel",
    "target": "Website (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessTypeLabel",
    "target": "Business Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessRegistrationNumberLabel",
    "target": "Business Registration Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.RegistrationAuthorityLabel",
    "target": "Registration Authority fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.RegistrationDateLabel",
    "target": "Registration Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessAddressLabel",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.CountryLabel",
    "target": "Country fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.StreetNumberLabel",
    "target": "Street Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.StreetNameLabel",
    "target": "Street Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.Address2Label",
    "target": "Address 2 (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.Address2Hint",
    "target": "Apartment, suite, unit, building, floor, etc. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.ProvinceLabel",
    "target": "Province fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.CityLabel",
    "target": "City fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.PostalCodeLabel",
    "target": "Postal Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessProfilePictureSubtitle",
    "target": "Business Logo (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessTypeDescriptionSole",
    "target": "A sole proprietorship is an unincorporated business owned by an individual. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessTypeDescriptionPart",
    "target": "A partnership is an unincorporated business owned by two or more persons, carrying on business together, generally for profit. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessTypeDescriptionCorp",
    "target": "A private or public corporation is a legal entity that is separate and distinct from its owners, shareholders of the corporation, directors and officers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.EditBusinessProfileView",
    "source": "net.nanopay.settings.business.EditBusinessProfileView.BusinessTypeDescriptionNonP",
    "target": "An not-for-profit (organization) is a provincially or federally incorporated organization that provides products or services without making profit. They are generally dedicated to activities that improve or benefit a community. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.TITLE_DOMESTIC",
    "target": "Unlock domestic payments fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.TITLE_US_DOMESTIC",
    "target": "Unlock US and Canadian Payments fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.TITLE_INTERNATIONAL",
    "target": "Unlock international payments fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.TITLE_INTERNATIONAL_CAD",
    "target": "Unlock International payments fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.DESCRIPTION_DOMESTIC",
    "target": "Complete the requirements and unlock domestic payments fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.DESCRIPTION_US_DOMESTIC",
    "target": "Complete the requirements and unlock domestic and Canadian Payments fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.DESCRIPTION_INTERNATIONAL",
    "target": "We are adding the ability to make FX payments around the world using Ablii.  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.DESCRIPTION_CAD_INTERNATIONAL",
    "target": "Complete the requirements to unlock payments to the US and India! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.COMPLETE",
    "target": "Completed fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.PENDING",
    "target": "pending domestic completion! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.PENDING_TWO",
    "target": "pending! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.COMING_SOON",
    "target": "Coming soon! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard.DESCRIPTION_ONBOARDING_INCOMPLETION",
    "target": "Your on boarding is incomplete. We are waiting for a signing officer to review and submit the requirements. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.SigningOfficerSentEmailCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.SigningOfficerSentEmailCard.TITLE",
    "target": "We’ve sent an email to a signing officer at your company! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.SigningOfficerSentEmailCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.SigningOfficerSentEmailCard.DESCRIPTION",
    "target": "For security reasons, we required that a signing officer complete your businesses verification.\n\n      Once the signing officer completes it, your business can start using Ablii. \n\n      In the meantime, you’re more than welcome to have a look around the app! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard.TITLE",
    "target": "Bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard.SUBTITLE_LOADING",
    "target": "Loading... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard.SUBTITLE_ERROR",
    "target": "Could not load account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard.SUBTITLE_EMPTY",
    "target": "No account added yet fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard.SUBTITLE_LINKED",
    "target": "Connected to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard.SUBTITLE_VERIFING",
    "target": "We are reviewing your bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard.SUBTITLE_VERIF",
    "target": "Bank account is added. Please verify. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard.TITLE",
    "target": "Accounting software fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard.SUBTITLE_EMPTY",
    "target": "Not connected fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard",
    "source": "net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard.SUBTITLE_LINKED",
    "target": "Connected to QBO fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.DisputeModal",
    "source": "net.nanopay.invoice.ui.modal.DisputeModal.VoidSuccess",
    "target": "Invoice voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.TITLE",
    "target": "Mark as Complete? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.MSG_1",
    "target": "Once this invoice is marked as complete, it cannot be edited. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.MSG_INVALID_DATE",
    "target": "Please enter a valid paid date. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.MSG_RECEIVE_DATE",
    "target": "Please enter the date you received payment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.SUCCESS_MESSAGE",
    "target": "Invoice has been marked completed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.PLACEHOLDER_TEXT",
    "target": "(i.e. What method of payment was it paid in?) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.DATE_LABEL",
    "target": "Date Paid fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.AMOUNT_LABEL",
    "target": "Amount Paid fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.NOTE_LABEL",
    "target": "Notes fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.CHEQUE_AMOUNT.label",
    "target": "Cheque Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.PAYMENT_DATE.label",
    "target": "Received fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.RecordPaymentModal",
    "source": "net.nanopay.invoice.ui.modal.RecordPaymentModal.NOTE.label",
    "target": "Note fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.MarkAsVoidModal",
    "source": "net.nanopay.invoice.ui.modal.MarkAsVoidModal.TITLE",
    "target": "Mark as void? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.MarkAsVoidModal",
    "source": "net.nanopay.invoice.ui.modal.MarkAsVoidModal.MSG1",
    "target": "Are you sure you want to void this invoice? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.MarkAsVoidModal",
    "source": "net.nanopay.invoice.ui.modal.MarkAsVoidModal.MSG2",
    "target": "Once this invoice is voided, it cannot be edited. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.MarkAsVoidModal",
    "source": "net.nanopay.invoice.ui.modal.MarkAsVoidModal.SUCCESS_MESSAGE",
    "target": "Invoice has been marked as voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.MarkAsVoidModal",
    "source": "net.nanopay.invoice.ui.modal.MarkAsVoidModal.NOTE_LABEL",
    "target": "Notes fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.MarkAsVoidModal",
    "source": "net.nanopay.invoice.ui.modal.MarkAsVoidModal.NOTE_HINT",
    "target": "i.e. Why is it voided? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.MarkAsVoidModal",
    "source": "net.nanopay.invoice.ui.modal.MarkAsVoidModal.VOID_SUCCESS",
    "target": "Invoice successfully voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.invoice.ui.modal.MarkAsVoidModal",
    "source": "net.nanopay.invoice.ui.modal.MarkAsVoidModal.VOID_ERROR",
    "target": "Invoice could not be voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.modal.UploadModal",
    "source": "net.nanopay.ui.modal.UploadModal.BoxText",
    "target": "Choose files to upload or Drag and Drop them here fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.modal.UploadModal",
    "source": "net.nanopay.ui.modal.UploadModal.FileRestrictText",
    "target": "*jpg, jpeg, png, pdf, doc, docx, ppt, pptx, pps, ppsx, odt, xls, xlsx only, 10MB maximum fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.modal.UploadModal",
    "source": "net.nanopay.ui.modal.UploadModal.FileTypeError",
    "target": "Wrong file format fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.modal.UploadModal",
    "source": "net.nanopay.ui.modal.UploadModal.FileSizeError",
    "target": "File size exceeds 10MB fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.ConfirmCashInModal",
    "source": "net.nanopay.cico.ui.ci.ConfirmCashInModal.Title",
    "target": "Cash In fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.ConfirmCashInModal",
    "source": "net.nanopay.cico.ui.ci.ConfirmCashInModal.bankLabel",
    "target": "Bank Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.ConfirmCashInModal",
    "source": "net.nanopay.cico.ui.ci.ConfirmCashInModal.amountLabel",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.ConfirmCashInModal",
    "source": "net.nanopay.cico.ui.ci.ConfirmCashInModal.backBtnTitle",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.ConfirmCashOutModal",
    "source": "net.nanopay.cico.ui.co.ConfirmCashOutModal.Title",
    "target": "Cash Out fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.ConfirmCashOutModal",
    "source": "net.nanopay.cico.ui.co.ConfirmCashOutModal.bankLabel",
    "target": "Bank Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.ConfirmCashOutModal",
    "source": "net.nanopay.cico.ui.co.ConfirmCashOutModal.amountLabel",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.ConfirmCashOutModal",
    "source": "net.nanopay.cico.ui.co.ConfirmCashOutModal.backBtnTitle",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.CashInModal",
    "source": "net.nanopay.cico.ui.ci.CashInModal.Title",
    "target": "Cash In fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.CashInModal",
    "source": "net.nanopay.cico.ui.ci.CashInModal.bankLabel",
    "target": "Bank Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.CashInModal",
    "source": "net.nanopay.cico.ui.ci.CashInModal.amountLabel",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.CashOutModal",
    "source": "net.nanopay.cico.ui.co.CashOutModal.Title",
    "target": "Cash Out fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.CashOutModal",
    "source": "net.nanopay.cico.ui.co.CashOutModal.bankLabel",
    "target": "Bank Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.CashOutModal",
    "source": "net.nanopay.cico.ui.co.CashOutModal.amountLabel",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.CashInSuccessModal",
    "source": "net.nanopay.cico.ui.ci.CashInSuccessModal.Title",
    "target": "Cash In fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.CashInSuccessModal",
    "source": "net.nanopay.cico.ui.ci.CashInSuccessModal.CashInSuccessDesc",
    "target": "You have successfully cashed in  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.ci.CashInSuccessModal",
    "source": "net.nanopay.cico.ui.ci.CashInSuccessModal.CashInResultDesc",
    "target": "Please be advised that it will take around 2 business days for you to see the balance in the portal. If you don't see your balance after 5 business days please contact our advisor at support@nanopay.net. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.CashOutSuccessModal",
    "source": "net.nanopay.cico.ui.co.CashOutSuccessModal.Title",
    "target": "Cash Out fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.CashOutSuccessModal",
    "source": "net.nanopay.cico.ui.co.CashOutSuccessModal.CashOutSuccessDesc",
    "target": "You have successfully cashed out  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.cico.ui.co.CashOutSuccessModal",
    "source": "net.nanopay.cico.ui.co.CashOutSuccessModal.CashOutResultDesc",
    "target": "Please be advised that it will take around 2 business days for the balance to arrive in your bank account. If you don't see your balance after 5 business days please contact our advisor at support@nanopay.net. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.modal.PartnerInviteModal",
    "source": "net.nanopay.partners.ui.modal.PartnerInviteModal.InviteSendSuccess",
    "target": "Invitation sent! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.modal.PartnerInviteModal",
    "source": "net.nanopay.partners.ui.modal.PartnerInviteModal.InviteSendError",
    "target": "There was a problem sending the invitation. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.modal.PartnerInviteModal",
    "source": "net.nanopay.partners.ui.modal.PartnerInviteModal.ModalTitle",
    "target": "New Invite fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.ConfirmDisable2FAModal",
    "source": "net.nanopay.sme.ui.ConfirmDisable2FAModal.TITLE",
    "target": "Disable two-factor authentication? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.ConfirmDisable2FAModal",
    "source": "net.nanopay.sme.ui.ConfirmDisable2FAModal.INSTRUCTIONS_1",
    "target": "Two-factor authentication provides an added layer of security to your account by decreasing the probability that an attacker can impersonate you or gain access to your sensitve account information. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.ConfirmDisable2FAModal",
    "source": "net.nanopay.sme.ui.ConfirmDisable2FAModal.INSTRUCTIONS_2",
    "target": "We strongly recommend keeping it enabled. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.ConfirmDisable2FAModal",
    "source": "net.nanopay.sme.ui.ConfirmDisable2FAModal.FIELD_LABEL",
    "target": "Enter verification code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.ConfirmDisable2FAModal",
    "source": "net.nanopay.sme.ui.ConfirmDisable2FAModal.FIELD_PLACEHOLDER",
    "target": "Enter code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.ConfirmDisable2FAModal",
    "source": "net.nanopay.sme.ui.ConfirmDisable2FAModal.ERROR_NO_TOKEN",
    "target": "Please enter a verification token. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.ConfirmDisable2FAModal",
    "source": "net.nanopay.sme.ui.ConfirmDisable2FAModal.ERROR_DISABLE",
    "target": "Could not disable two-factor authentication. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.ConfirmDisable2FAModal",
    "source": "net.nanopay.sme.ui.ConfirmDisable2FAModal.SUCCESS",
    "target": "Two-factor authentication disabled. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferWizard",
    "source": "net.nanopay.ui.transfer.TransferWizard.TimerText",
    "target": "before exchange rate expires. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.ToLabel",
    "target": "To fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.FromLabel",
    "target": "From fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.AmountLabel",
    "target": "Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.SendingFeeLabel",
    "target": "Sending Fee: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.ReceivingFeeLabel",
    "target": "Receiving Fee: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.TotalLabel",
    "target": "Total Amount: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.EstimatedDeliveryLabel",
    "target": "Estimated Delivery Date: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.PurposeLabel",
    "target": "Purpose of Transfer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.InvoiceNoLabel",
    "target": "Invoice No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.PONoLabel",
    "target": "PO No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferReview",
    "source": "net.nanopay.ui.transfer.TransferReview.PDFLabel",
    "target": "View Invoice PDF fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.TransferFromLabel",
    "target": "Transfer from fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.AccountLabel",
    "target": "Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.ToLabel",
    "target": "To fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.FromLabel",
    "target": "From fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.PayeeLabel",
    "target": "Payee fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.PurposeLabel",
    "target": "Purpose of Transfer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.NoteLabel",
    "target": "Notes (Optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.NotThirdParty",
    "target": "Sending money on behalf of myself and not on behalf of a third party fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.InvoiceNoLabel",
    "target": "Invoice No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.PONoLabel",
    "target": "PO No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferDetails",
    "source": "net.nanopay.ui.transfer.TransferDetails.PDFLabel",
    "target": "View Invoice PDF fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.AmountError",
    "target": "Amount needs to be greater than $0.00 fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.SendingFeeLabel",
    "target": "Sending Fee: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.ReceivingFeeLabel",
    "target": "Receiving Fee: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.TotalLabel",
    "target": "Total Amount: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.EstimatedDeliveryLabel",
    "target": "Estimated Delivery Date: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.FromLabel",
    "target": "From fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.ToLabel",
    "target": "To fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.InvoiceNoLabel",
    "target": "Invoice No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.PONoLabel",
    "target": "PO No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.transfer.TransferAmount",
    "source": "net.nanopay.ui.transfer.TransferAmount.PDFLabel",
    "target": "View Invoice PDF fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.PayInvoice",
    "target": "Pay Another Invoice fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.NewTransfer",
    "target": "Make New Transfer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.Back",
    "target": "Back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.Next",
    "target": "Next fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.NoPartners",
    "target": "No partners found. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.NoContacts",
    "target": "No contacts found. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.NoAccount",
    "target": "Please select an account to pay. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.ZeroAmount",
    "target": "Transfer amount must be greater than 0. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.VerifyBank",
    "target": "Bank Account should be verified for making this transfer. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.CannotContinue",
    "target": "Could not continue. Please contact customer support. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.InsuffientDigitalBalance",
    "target": "Unable to process payment: insufficient digital balance. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferView",
    "source": "net.nanopay.ui.TransferView.CannotProcess",
    "target": "Unable to process payment:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferFrom",
    "source": "net.nanopay.ui.TransferFrom.TransferFromLabel",
    "target": "Transfer from fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferFrom",
    "source": "net.nanopay.ui.TransferFrom.TypeLabel",
    "target": "Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferFrom",
    "source": "net.nanopay.ui.TransferFrom.DenominationLabel",
    "target": "Denomination fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferFrom",
    "source": "net.nanopay.ui.TransferFrom.AccountLabel",
    "target": "Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferFrom",
    "source": "net.nanopay.ui.TransferFrom.FromLabel",
    "target": "From fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferFrom",
    "source": "net.nanopay.ui.TransferFrom.AmountLabel",
    "target": "Transfer Amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferFrom",
    "source": "net.nanopay.ui.TransferFrom.InvoiceNoLabel",
    "target": "Invoice No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferFrom",
    "source": "net.nanopay.ui.TransferFrom.PONoLabel",
    "target": "PO No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferTo",
    "source": "net.nanopay.ui.TransferTo.TransferToLabel",
    "target": "Transfer to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferTo",
    "source": "net.nanopay.ui.TransferTo.PayeeLabel",
    "target": "Payee fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferTo",
    "source": "net.nanopay.ui.TransferTo.TypeLabel",
    "target": "Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferTo",
    "source": "net.nanopay.ui.TransferTo.DenominationLabel",
    "target": "Denomination fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferTo",
    "source": "net.nanopay.ui.TransferTo.AccountLabel",
    "target": "Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferTo",
    "source": "net.nanopay.ui.TransferTo.ToLabel",
    "target": "To fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferTo",
    "source": "net.nanopay.ui.TransferTo.InvoiceNoLabel",
    "target": "Invoice No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.TransferTo",
    "source": "net.nanopay.ui.TransferTo.PONoLabel",
    "target": "PO No. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.AccountSelectionView",
    "source": "net.nanopay.ui.AccountSelectionView.DEFAULT_LABEL",
    "target": "Select an Account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.DetailedActionBooleanView",
    "source": "net.nanopay.ui.DetailedActionBooleanView.BOOLEAN_ERROR",
    "target": "There was an issue updating fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.ui.DetailedActionBooleanView",
    "source": "net.nanopay.ui.DetailedActionBooleanView.BOOLEAN_SUCCESS",
    "target": "was successfully updated. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.LiquiditySettingsSelectionView",
    "source": "net.nanopay.liquidity.LiquiditySettingsSelectionView.DEFAULT_LABEL",
    "target": "Choose LiquiditySetting fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.ApproverLevel",
    "source": "net.nanopay.liquidity.crunch.ApproverLevel.approverLevelRangeError",
    "target": "Approver level must be a value between 1 and 2. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountData",
    "source": "net.nanopay.liquidity.crunch.AccountData.IS_INCLUDED.label",
    "target": "Include in Account Group fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.AccountData",
    "source": "net.nanopay.liquidity.crunch.AccountData.IS_CASCADING.label",
    "target": "Apply to Sub-Accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.liquidity.crunch.CapabilityAccountData",
    "source": "net.nanopay.liquidity.crunch.CapabilityAccountData.APPROVER_LEVEL.label",
    "target": "Authorization Level fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.ContactCard",
    "source": "net.nanopay.partners.ui.ContactCard.InviteSendSuccess",
    "target": "Invitation sent! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.ContactCard",
    "source": "net.nanopay.partners.ui.ContactCard.InviteSendError",
    "target": "There was a problem sending the invitation. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.ContactCard",
    "source": "net.nanopay.partners.ui.ContactCard.DisconnectSuccess",
    "target": "You have successfully disconnected. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.ContactCard",
    "source": "net.nanopay.partners.ui.ContactCard.DisconnectError",
    "target": "An unexpected error occurred. The partnership was not removed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.ContactCard",
    "source": "net.nanopay.partners.ui.ContactCard.CreateNewInvoice",
    "target": "Create New Invoice fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.ContactCard",
    "source": "net.nanopay.partners.ui.ContactCard.CreateNewBill",
    "target": "Create New Bill fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.ContactCard",
    "source": "net.nanopay.partners.ui.ContactCard.RemovePartnership",
    "target": "Remove partnership fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.ContactCard",
    "source": "net.nanopay.partners.ui.ContactCard.Connect",
    "target": "Connect fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView",
    "source": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView.InviteNotFound",
    "target": "No invitation found fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView",
    "source": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView.Connected",
    "target": "You are now connected! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView",
    "source": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView.ErrorFromBackend",
    "target": "There was a problem connecting you. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView",
    "source": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView.ErrorMultipleInvites",
    "target": "There were multiple invites fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView",
    "source": "net.nanopay.partners.ui.PartnerInvitationNotificationCitationViewNotificationView.AlreadyAccepted",
    "target": "You've already accepted this request fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ContactMigrationRule",
    "source": "net.nanopay.contacts.ContactMigrationRule.DESCRIBE_TEXT",
    "target": "Migrates contacts and invoices to a newly onboarded Business with a bank account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ContactMigrationRule",
    "source": "net.nanopay.contacts.ContactMigrationRule.BUSINESS_NOT_FOUND",
    "target": "Business not found. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.DeleteContactView",
    "source": "net.nanopay.contacts.ui.modal.DeleteContactView.TITLE",
    "target": "Delete contact? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.DeleteContactView",
    "source": "net.nanopay.contacts.ui.modal.DeleteContactView.CONFIRM_DELETE_1",
    "target": "Are you sure you want to delete  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.DeleteContactView",
    "source": "net.nanopay.contacts.ui.modal.DeleteContactView.CONFIRM_DELETE_2",
    "target": " from your contacts list? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.DeleteContactView",
    "source": "net.nanopay.contacts.ui.modal.DeleteContactView.SUCCESS_MSG",
    "target": "Contact deleted fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.DeleteContactView",
    "source": "net.nanopay.contacts.ui.modal.DeleteContactView.FAIL_MSG",
    "target": "Failed to delete contact. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.EditContactView",
    "source": "net.nanopay.contacts.ui.modal.EditContactView.TITLE_ON_CREATE",
    "target": "Add Contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.EditContactView",
    "source": "net.nanopay.contacts.ui.modal.EditContactView.TITLE_ON_EDIT",
    "target": "Edit Contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.EditContactView",
    "source": "net.nanopay.contacts.ui.modal.EditContactView.QUESTION",
    "target": "Would you like to add a bank account to this contact? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.InvitationWizardView",
    "source": "net.nanopay.contacts.ui.InvitationWizardView.INVITE_SUCCESS",
    "target": "Sent a request to connect. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.InvitationWizardView",
    "source": "net.nanopay.contacts.ui.InvitationWizardView.INVITE_FAILURE",
    "target": "There was a problem sending the invitation. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.ContactWizardView",
    "source": "net.nanopay.contacts.ui.ContactWizardView.EDIT_STEP_ONE_TITLE",
    "target": "Edit contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.ContactWizardView",
    "source": "net.nanopay.contacts.ui.ContactWizardView.EDIT_STEP_TWO_TITLE",
    "target": "Edit banking information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.ContactWizardView",
    "source": "net.nanopay.contacts.ui.ContactWizardView.EDIT_STEP_THREE_TITLE",
    "target": "Edit business address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.ContactWizardView",
    "source": "net.nanopay.contacts.ui.ContactWizardView.CONTACT_ADDED",
    "target": "Personal contact added. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.ContactWizardView",
    "source": "net.nanopay.contacts.ui.ContactWizardView.CONTACT_EDITED",
    "target": "Personal contact edited. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.ContactWizardView",
    "source": "net.nanopay.contacts.ui.ContactWizardView.INVITE_SUCCESS",
    "target": "Sent a request to connect. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.ContactWizardView",
    "source": "net.nanopay.contacts.ui.ContactWizardView.CONTACT_ADDED_INVITE_SUCCESS",
    "target": "Personal contact added. An email invitation was sent. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.ContactWizardView",
    "source": "net.nanopay.contacts.ui.ContactWizardView.CONTACT_ADDED_INVITE_FAILURE",
    "target": "Personal contact added. An email invitation could not be sent. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.PaymentCodeSearchWizardView",
    "source": "net.nanopay.contacts.ui.PaymentCodeSearchWizardView.CONTACT_ADDED",
    "target": "Personal contact added. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.PaymentCodeSearchWizardView",
    "source": "net.nanopay.contacts.ui.PaymentCodeSearchWizardView.CONTACT_EXISTS_ERROR",
    "target": "Contact with this payment code already exists. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.BusinessNameSearchWizardView",
    "source": "net.nanopay.contacts.ui.BusinessNameSearchWizardView.CONTACT_ADDED",
    "target": "Personal contact added. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.ContactConfirmationView",
    "source": "net.nanopay.contacts.ui.modal.ContactConfirmationView.BUSINESS_NAME_LABEL",
    "target": "Legal Company Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.ContactConfirmationView",
    "source": "net.nanopay.contacts.ui.modal.ContactConfirmationView.BUSINESS_TYPE_LABEL",
    "target": "Business type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.ContactConfirmationView",
    "source": "net.nanopay.contacts.ui.modal.ContactConfirmationView.PAYMENT_CODE_LABEL",
    "target": "Payment Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.ContactConfirmationView",
    "source": "net.nanopay.contacts.ui.modal.ContactConfirmationView.ADDRESS_LABEL",
    "target": "Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.PaymentCodeSearch",
    "source": "net.nanopay.contacts.ui.modal.PaymentCodeSearch.USER_PAYMENT_CODE_LABEL",
    "target": "My Payment Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.PaymentCodeSearch",
    "source": "net.nanopay.contacts.ui.modal.PaymentCodeSearch.PAYMENT_CODE_VALUE.label",
    "target": "Payment Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.PaymentCodeSearch",
    "source": "net.nanopay.contacts.ui.modal.PaymentCodeSearch.SECTION_SEARCH.title",
    "target": "Search by Payment Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.PaymentCodeSearch",
    "source": "net.nanopay.contacts.ui.modal.PaymentCodeSearch.SECTION_SEARCH.subTitle",
    "target": "\n      Search a business on Ablii to add them to your contacts. You can ask your\n      contact for their Payment Code.\n       fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.BusinessListView",
    "source": "net.nanopay.contacts.ui.modal.BusinessListView.DEFAULT_RESULT_MSG",
    "target": "Matching businesses will appear here fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.contacts.ui.modal.BusinessListView",
    "source": "net.nanopay.contacts.ui.modal.BusinessListView.FAILED_RESULT_MSG",
    "target": "We couldn’t find a business with that name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.TITLE_SEND1",
    "target": "Sent fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.TITLE_SEND2",
    "target": "to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.TITLE_REC1",
    "target": "Requested fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.TITLE_REC2",
    "target": "from fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.TITLE_PENDING",
    "target": "Payment has been submitted for approval fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.BODY_SEND",
    "target": "You will see the debit from your bank account in 1-2 business days. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.BODY_REC",
    "target": "Your request has been sent to your contact and is now pending payment. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.BODY_PENDING",
    "target": "This payable requires approval before it can be processed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.REF",
    "target": "Your reference ID  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.V_PAY",
    "target": "View this payable fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.V_REC",
    "target": "View this receivable fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowSuccessView",
    "source": "net.nanopay.sme.ui.MoneyFlowSuccessView.TXN_CONFIRMATION_LINK_TEXT",
    "target": "View AscendantFX Transaction Confirmation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowRejectView",
    "source": "net.nanopay.sme.ui.MoneyFlowRejectView.TITLE",
    "target": "This invoice has been voided fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowRejectView",
    "source": "net.nanopay.sme.ui.MoneyFlowRejectView.V_PAY",
    "target": "View this payable fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.MoneyFlowRejectView",
    "source": "net.nanopay.sme.ui.MoneyFlowRejectView.V_REC",
    "target": "View this receivable fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.dashboard.TopCardsOnDashboard",
    "source": "net.nanopay.sme.ui.dashboard.TopCardsOnDashboard.LOWER_LINE_TXT",
    "target": "Welcome back  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.DeleteBankAccountModal",
    "source": "net.nanopay.sme.ui.DeleteBankAccountModal.TITLE",
    "target": "Delete bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.DeleteBankAccountModal",
    "source": "net.nanopay.sme.ui.DeleteBankAccountModal.BODY_COPY",
    "target": "Are you sure you want to delete this banking option? You will still be able to view payables and receivables related to this account. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.DeleteBankAccountModal",
    "source": "net.nanopay.sme.ui.DeleteBankAccountModal.DEFAULT_ERROR_MESSAGE",
    "target": "There was a problem deleting your account. Try again later. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.DeleteBankAccountModal",
    "source": "net.nanopay.sme.ui.DeleteBankAccountModal.SUCCESS_MESSAGE",
    "target": "Bank account deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.BACK",
    "target": "Go back fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.PAYMENT_DETAILS",
    "target": "Payment details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.EXCHANGE_RATE",
    "target": "Exchange rate fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.PAYMENT_FEE",
    "target": "Fee fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.AMOUNT_DUE",
    "target": "Amount due fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.AMOUNT_PAID",
    "target": "Amount paid fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.DATE_CREDITED",
    "target": "Date credited fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.ESTIMATED_CREDIT_DATE",
    "target": "Estimated credit date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.INVOICE_HISTORY",
    "target": "History fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.MARK_AS_COMP_MESSAGE",
    "target": "Mark as complete fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.VOID_MESSAGE",
    "target": "Mark as void fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.EMAIL_MSG_ERROR",
    "target": "An error occurred while sending a reminder, please try again later. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.EMAIL_MSG",
    "target": "Invitation sent! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.PART_ONE_SAVE",
    "target": "Invoice # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.PART_TWO_SAVE_SUCCESS",
    "target": "has successfully been voided. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.PART_TWO_SAVE_ERROR",
    "target": "could not be voided at this time. Please try again later. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.TXN_CONFIRMATION_LINK_TEXT",
    "target": "View AscendantFX Transaction Confirmation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.ANNOTATION",
    "target": "* The dates above are estimates and are subject to change. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.RECONCILED_MESSAGE",
    "target": "Reconcile fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.RECONCILED_SUCCESS",
    "target": "Invoice successfully reconciled. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceOverview",
    "source": "net.nanopay.sme.ui.InvoiceOverview.REECONCILED_ERROR",
    "target": "An error occurred reconciling invoice. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceRowView",
    "source": "net.nanopay.sme.ui.InvoiceRowView.REMINDER_SENT_SUCCESSFULLY",
    "target": "Reminder was successfully sent to ${0}. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceRowView",
    "source": "net.nanopay.sme.ui.InvoiceRowView.REMINDER_ERROR_MESSAGE",
    "target": "An error occurred while sending a reminder to ${0} fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoneyDetails",
    "source": "net.nanopay.sme.ui.SendRequestMoneyDetails.DETAILS_SUBTITLE",
    "target": "Create new or choose from existing fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoneyDetails",
    "source": "net.nanopay.sme.ui.SendRequestMoneyDetails.EXISTING_HEADER",
    "target": "Choose an existing  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoneyDetails",
    "source": "net.nanopay.sme.ui.SendRequestMoneyDetails.DETAILS_HEADER",
    "target": "Details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoneyDetails",
    "source": "net.nanopay.sme.ui.SendRequestMoneyDetails.BACK",
    "target": "Back to selection fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoneyReview",
    "source": "net.nanopay.sme.ui.SendRequestMoneyReview.APPROVE_INVOICE_LABEL",
    "target": "Approve fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.SendRequestMoneyReview",
    "source": "net.nanopay.sme.ui.SendRequestMoneyReview.SUBMIT_LABEL",
    "target": "Submit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.UploadFileModal",
    "source": "net.nanopay.sme.ui.UploadFileModal.DRAG_LABEL",
    "target": "Drag & drop your files here fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.UploadFileModal",
    "source": "net.nanopay.sme.ui.UploadFileModal.OR_LABEL",
    "target": "or  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.UploadFileModal",
    "source": "net.nanopay.sme.ui.UploadFileModal.BROWSE_LABEL",
    "target": "browse fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.UploadFileModal",
    "source": "net.nanopay.sme.ui.UploadFileModal.SUPPORTED_DATA_LABEL",
    "target": "Supported file types: JPG, JPEG, PNG, PDF, DOC, DOCX Max Size: 8MB fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.UploadFileModal",
    "source": "net.nanopay.sme.ui.UploadFileModal.FILE_TYPE_ERROR",
    "target": "jpg, jpeg, png, pdf, doc, docx only, 8MB maximum fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.UploadFileModal",
    "source": "net.nanopay.sme.ui.UploadFileModal.FILE_SIZE_ERROR",
    "target": "File size exceeds 8MB fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.PAYABLE_ERROR_MSG",
    "target": "Banking information for this contact must be provided fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.RECEIVABLE_ERROR_MSG",
    "target": "You do not have the ability to receive funds in this currency. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.INVOICE_NUMBER_PLACEHOLDER",
    "target": "Enter an invoice number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.PO_PLACEHOLDER",
    "target": "Optional fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.NOTE_PLACEHOLDER",
    "target": "Add a note to this fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.ADD_NOTE",
    "target": "Note fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.ADD_BANK",
    "target": "Add Banking Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.UNSUPPORTED_CURRENCY1",
    "target": "Sorry, we don't support  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.UNSUPPORTED_CURRENCY2",
    "target": " for this contact fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.TOOLTIP_TITLE",
    "target": "This field can't be edited. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.TOOLTIP_BODY",
    "target": "Please edit this invoice in your accounting software and sync again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.EXTERNAL_USER_MESSAGE",
    "target": "The contact you’ve selected needs to sign up to the platform in order to pay you.\n          The contact will receive an email notification only. If the contact chooses to pay\n          you in another way, you can mark the invoice as complete. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.NewInvoiceForm",
    "source": "net.nanopay.sme.ui.NewInvoiceForm.EXTERNAL_TITLE",
    "target": "Attention to Payment fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.ATTACHMENT_LABEL",
    "target": "Attachments fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.AMOUNT_LABEL",
    "target": "Amount due fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.REFERENCE_LABEL",
    "target": "Reference ID fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.DUE_DATE_LABEL",
    "target": "Date due fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.INVOICE_NUMBER_LABEL",
    "target": "Invoice # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.BILLING_INVOICE_NUMBER_LABEL",
    "target": "Billing Invoice # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.ISSUE_DATE_LABEL",
    "target": "Date issued fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.LINE_ITEMS",
    "target": "Items fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.NOTE_LABEL",
    "target": "Notes fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.PAYEE_LABEL",
    "target": "Payment to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.PAYER_LABEL",
    "target": "Payment from fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.PO_NO_LABEL",
    "target": "P.O. No.  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.CYCLE_LABEL",
    "target": "Billing Cycle:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.InvoiceDetails",
    "source": "net.nanopay.sme.ui.InvoiceDetails.SAVE_AS_PDF_FAIL",
    "target": "There was an unexpected error when creating the PDF. Please contact support. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessJunctionRowView",
    "source": "net.nanopay.sme.ui.BusinessJunctionRowView.DISABLED",
    "target": "Disabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessRowView",
    "source": "net.nanopay.sme.ui.BusinessRowView.CONNECTED",
    "target": "Connected fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessInformationView",
    "source": "net.nanopay.sme.ui.BusinessInformationView.TITLE",
    "target": "Company information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessInformationView",
    "source": "net.nanopay.sme.ui.BusinessInformationView.BUSINESS_NAME_LABEL",
    "target": "Registered business name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessInformationView",
    "source": "net.nanopay.sme.ui.BusinessInformationView.PHONE_LABEL",
    "target": "Business phone # fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessInformationView",
    "source": "net.nanopay.sme.ui.BusinessInformationView.ADDRESS_LABEL",
    "target": "Business address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BusinessInformationView",
    "source": "net.nanopay.sme.ui.BusinessInformationView.WEBSITE_LABEL",
    "target": "Website fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PaymentCodeView",
    "source": "net.nanopay.sme.ui.PaymentCodeView.TITLE",
    "target": "Payment code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.PaymentCodeView",
    "source": "net.nanopay.sme.ui.PaymentCodeView.PAYMENT_CODE_LABEL",
    "target": "This is your personalised code to receive payments from other businesses. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitView",
    "source": "net.nanopay.sme.ui.TransactionLimitView.TITLE",
    "target": "Transaction limits fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitView",
    "source": "net.nanopay.sme.ui.TransactionLimitView.LIMIT_LABEL",
    "target": "Limit amount fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitView",
    "source": "net.nanopay.sme.ui.TransactionLimitView.TRANSACTION_LIMIT",
    "target": "$100,000.00 fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.TITLE",
    "target": "Transaction limit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.SOURCE_BUSINESS_PLACE_HOLDER",
    "target": "Please select a business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.SOURCE_ACCOUNT_PLACE_HOLDER",
    "target": "Please select a bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.SEND.label",
    "target": "Sending or Receiving fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.APPLY_TO.label",
    "target": "Limit apply to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.LIMIT_FREQUENCY.label",
    "target": "Transaction limit period fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.TRANSACTION_TYPE.label",
    "target": "type of Transaction fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.REMAIN_LIMIT.label",
    "target": "Remaining Limit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TransactionLimitSearchView",
    "source": "net.nanopay.sme.ui.TransactionLimitSearchView.SECTION_RESULT.title",
    "target": "Your transaction limit details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BeneficialOwnerView",
    "source": "net.nanopay.sme.ui.BeneficialOwnerView.TITLE",
    "target": "Beneficial owners fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BeneficialOwnerView",
    "source": "net.nanopay.sme.ui.BeneficialOwnerView.LEGAL_NAME_LABEL",
    "target": "Legal name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BeneficialOwnerView",
    "source": "net.nanopay.sme.ui.BeneficialOwnerView.JOB_TITLE_LABEL",
    "target": "Job title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BeneficialOwnerView",
    "source": "net.nanopay.sme.ui.BeneficialOwnerView.ADDRESS_LABEL",
    "target": "Residential address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BeneficialOwnerView",
    "source": "net.nanopay.sme.ui.BeneficialOwnerView.DATE_OF_BIRTH_LABEL",
    "target": "Date of birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.BeneficialOwnerView",
    "source": "net.nanopay.sme.ui.BeneficialOwnerView.OWNER_COUNT_LABEL",
    "target": "Beneficial owner fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmail",
    "source": "net.nanopay.sme.ui.VerifyEmail.TITLE",
    "target": "Verify your email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmail",
    "source": "net.nanopay.sme.ui.VerifyEmail.INSTRUCTIONS1",
    "target": "We've sent a verification link to your email. Click on the link to get started! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.VerifyEmail",
    "source": "net.nanopay.sme.ui.VerifyEmail.INSTRUCTIONS2",
    "target": "If the email doesn’t arrive soon, check your spam folder or have us fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TopBarBackToAblii",
    "source": "net.nanopay.sme.ui.TopBarBackToAblii.GO_BACK",
    "target": "Back to ablii.com fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddUserToBusinessModal",
    "source": "net.nanopay.sme.ui.AddUserToBusinessModal.TITLE",
    "target": "Invite to  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddUserToBusinessModal",
    "source": "net.nanopay.sme.ui.AddUserToBusinessModal.EMAIL_LABEL",
    "target": "Email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddUserToBusinessModal",
    "source": "net.nanopay.sme.ui.AddUserToBusinessModal.ROLE_LABEL",
    "target": "Role fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddUserToBusinessModal",
    "source": "net.nanopay.sme.ui.AddUserToBusinessModal.INVITATION_SUCCESS",
    "target": "Invitation sent fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddUserToBusinessModal",
    "source": "net.nanopay.sme.ui.AddUserToBusinessModal.INVITATION_ERROR",
    "target": "Something went wrong with adding the user. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddUserToBusinessModal",
    "source": "net.nanopay.sme.ui.AddUserToBusinessModal.INVALID_EMAIL",
    "target": "Invalid email address. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AddUserToBusinessModal",
    "source": "net.nanopay.sme.ui.AddUserToBusinessModal.INVALID_EMAIL2",
    "target": "Sorry but the email you are trying to add is already a user within your business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.CreateBusinessModal",
    "source": "net.nanopay.sme.ui.CreateBusinessModal.DESCRIPTION",
    "target": "\n        Fill out information about your business. You'll be able to access\n        this business on the switch business menu. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.CreateBusinessModal",
    "source": "net.nanopay.sme.ui.CreateBusinessModal.TITLE",
    "target": "Create a Business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.CreateBusinessModal",
    "source": "net.nanopay.sme.ui.CreateBusinessModal.SUCCESS_MESSAGE",
    "target": "Business successfully created! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.CreateBusinessModal",
    "source": "net.nanopay.sme.ui.CreateBusinessModal.ERROR_MESSAGE",
    "target": "Sorry, there was an error creating this business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.CreateBusinessModal",
    "source": "net.nanopay.sme.ui.CreateBusinessModal.COUNTRY_ID.label",
    "target": "Country of operation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.TwoFactorNoTokenError",
    "target": "Please enter a verification token. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.TwoFactorEnableSuccess",
    "target": "Two-factor authentication enabled. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.TwoFactorEnableError",
    "target": "Could not enable two-factor authentication. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.TWO_FACTOR_BENEFIT",
    "target": "Two-factor authentication provides an extra layer of security to your account. Two-factor authentication is enabled at all time to prevent potential unauthorized access to your business and financial information. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.TWO_FACTOR_LABEL",
    "target": "Enter verification code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.EnterCode",
    "target": "Enter code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.Status",
    "target": "Status fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.Enabled",
    "target": "• Enabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.TwoFactorAuthView",
    "source": "net.nanopay.sme.ui.TwoFactorAuthView.Disabled",
    "target": "• Disabled fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessSectorSelectionView",
    "source": "net.nanopay.sme.onboarding.ui.BusinessSectorSelectionView.DEFAULT_LABEL",
    "target": "Select industry... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ruler.InvitationAntiSpamCheckRule",
    "source": "net.nanopay.sme.ruler.InvitationAntiSpamCheckRule.TIMEOUT_ERROR",
    "target": "You have recently invited this user. Please try again at a later time. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.settings.business.DeleteInvitedUserView",
    "source": "net.nanopay.settings.business.DeleteInvitedUserView.SUCCESS_MSG",
    "target": "Successfully deleted. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.ui.AccountProfileView",
    "source": "net.nanopay.sme.ui.AccountProfileView.ONE_BUSINESS_MSG",
    "target": "You're part of only one business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.SAVE_SUCCESSFUL_MESSAGE",
    "target": "Progress saved. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.SAVE_FAILURE_MESSAGE",
    "target": "Could not save your changes. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.SUBMIT_SUCCESS_MESSAGE",
    "target": "Registration submitted successfully! You will receive a confirmation email in your mailbox. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.SUBMIT_FAILURE_MESSAGE",
    "target": "Registration submission failed. Please try again later. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_MISSING_FIELDS",
    "target": "Please fill out all necessary fields before proceeding. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ADMIN_JOB_TITLE_MESSAGE",
    "target": "Job title required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ADMIN_NUMBER_MESSAGE",
    "target": "Invalid phone number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_NAME_MESSAGE",
    "target": "Business name required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_PHONE_MESSAGE",
    "target": "Invalid business phone number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_TYPE_MESSAGE",
    "target": "Business type required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_REGISTRATION_NUMBER_MESSAGE",
    "target": "Business registration number required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_REGISTRATION_AUTHORITY_MESSAGE_ERROR",
    "target": "Business registration authority required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_REGISTRATION_DATE_MESSAGE",
    "target": "Invalid business registration date. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_STREET_NUMBER_MESSAGE",
    "target": "Invalid street number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_STREET_NAME_MESSAGE",
    "target": "Invalid street name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_STREET_2_NAME_MESSAGE",
    "target": "Address line 2 is invalid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_CITY_MESSAGE",
    "target": "Invalid city name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BUSINESS_PROFILE_POSTAL_CODE_MESSAGE",
    "target": "Invalid postal code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_QUESTIONNAIRE_MESSAGE",
    "target": "You must answer each question. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_FIRST_NAME_TOO_LONG",
    "target": "First name cannot exceed 70 characters. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_FIRST_NAME_DIGITS",
    "target": "First name cannot contain numbers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_MIDDLE_NAME_TOO_LONG",
    "target": "Middle name cannot exceed 70 characters. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_MIDDLE_NAME_DIGITS",
    "target": "Middle name cannot contain numbers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_LAST_NAME_TOO_LONG",
    "target": "Last name cannot exceed 70 characters. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_LAST_NAME_DIGITS",
    "target": "Last name cannot contain numbers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_TERMS_AND_CONDITIONS_MESSAGE",
    "target": "Please accept the terms and conditions. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_BASE_CURRENCY_MESSAGE",
    "target": "Base currency required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ANNUAL_REVENUE_MESSAGE",
    "target": "Domestic Annual Gross Sales required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_INTERNATIONAL_PAYMENTS_MESSAGE",
    "target": "International payments required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_TRANSACTION_PURPOSE_MESSAGE",
    "target": "Transaction purpose required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_OTHER_TRANSACTION_PURPOSE_MESSAGE",
    "target": "Please provide additional information for your transaction purpose. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ANNUAL_TRANSACTION_MESSAGE",
    "target": "Annual Number of Transactions is required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ANNUAL_VOLUME_MESSAGE",
    "target": "Domestic Estimated Annual Volume required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ANNUAL_VOLUME_CAD",
    "target": "Domestic Estimated Annual Volume required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_TAX_ID_REQUIRED",
    "target": "Tax Identification Number is required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_TAX_ID_INVALID",
    "target": "Tax Identification Number should be 9 digits. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ID_EXPIRED",
    "target": "Identification expiry date indicates that the ID is expired. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ADD_BUSINESS_DOCS",
    "target": "Please upload at least one proof of registration file for your business type. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_ADD_SIGNING_DOCS",
    "target": "Please upload at least one identification file for the signing officer. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_NO_BENEFICIAL_OWNERS",
    "target": "Please add a beneficial owner to continue, if you have none then please select either of the checkboxes at the top of the page. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_TERMS_NOT_CHECKED_1",
    "target": "Please agree to the Tri-Party Agreement for Ablii Payment Services - Canada by clicking on the checkbox. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_TERMS_NOT_CHECKED_2",
    "target": "Please agree to the Dual Party Agreement for Ablii Payment Services by clicking on the checkbox. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_TERMS_NOT_CHECKED_3",
    "target": "Please agree to the Tri-Party Agreement for Ablii Payment Services - United States by clicking on the checkbox. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_MISSING_BUSINESS_TYPE",
    "target": "Type of Business is required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_MISSING_NATURE_OF_BUSINESS",
    "target": "Nature of Business is required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_MISSING_TARGET_CUSTOMERS",
    "target": "You must specify who you market your services and products to. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_MISSING_SOURCE_OF_FUNDS",
    "target": "You must specify your source of funds. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_MISSING_FIRST_PAYMENT_DATE",
    "target": "Anticipated First Payment Date is required. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_PHONE_LENGTH",
    "target": "Phone number cannot exceed 10 digits in length fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ERROR_NO_ADDITIONAL_BENEFICIAL_OWNERS",
    "target": "You must acknowledge that the profile contains details of all beneficial owners of the business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.FIRST_NAME_ERROR",
    "target": "First and last name fields must be populated. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.JOB_TITLE_ERROR",
    "target": "Job title field must be populated. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.BIRTHDAY_ERROR",
    "target": "Please Enter Valid Birthday yyyy-mm-dd. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.BIRTHDAY_ERROR_2",
    "target": "Beneficial owner must be at least 16 years of age. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ADDRESS_STREET_NUMBER_ERROR",
    "target": "Invalid street number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ADDRESS_STREET_NAME_ERROR",
    "target": "Invalid street name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ADDRESS_LINE_ERROR",
    "target": "Invalid address line. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ADDRESS_CITY_ERROR",
    "target": "Invalid city name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.ADDRESS_POSTAL_CODE_ERROR",
    "target": "Invalid postal code. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.OWNER_PERCENT_ERROR",
    "target": "Please enter a valid percentage of ownership for the adding Owner. (Must be between 1-100%) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.NON_SUCCESS_REGISTRATION_MESSAGE",
    "target": "Your finished with the registration process. A signing officer\n          of your company must complete the rest of the registration. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard",
    "source": "net.nanopay.sme.onboarding.ui.BusinessRegistrationWizard.SUCCESS_REGISTRATION_MESSAGE",
    "target": "Business profile completed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.GETTING_STARTED",
    "target": "Before you get started fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.GUIDE_MESSAGE",
    "target": "It will take about 10 minutes to complete the whole profile. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.GUIDE_MESSAGE_REQUIREMENTS",
    "target": "Here are some things you need to get this done: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.BUSINESS_ADDRESS",
    "target": "Business Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.BUSINESS_REGISTRATION_INFO",
    "target": "Business Registration Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.PROOF_OF_REGISTRATION",
    "target": "Business Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.SIGNING_OFFICER",
    "target": "Signing Officer Information & Identification fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.COMPANY_OWNERSHIP",
    "target": "Company Ownership Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.WHY_ASK",
    "target": "Why do we need this? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.WHY_ASK_EXPLANATION",
    "target": "Collecting this info helps us to ensure that Ablii is safe to use for both senders \n          and receivers of payments.\n       fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.IntroductionView",
    "source": "net.nanopay.sme.onboarding.ui.IntroductionView.WHY_ASK_EXPLANATION2",
    "target": "Once your profile is complete, we will conduct a review to enable payments! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.TITLE",
    "target": "Tell us about your business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.BUSINESS_TYPE_LABEL",
    "target": "Type of Business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.INDUSTRY_LABEL",
    "target": "Nature of Business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.BUSINESS_NAME_LABEL",
    "target": "Registered Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.OPERATING_QUESTION",
    "target": "My business operates under a different name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.OPERATING_BUSINESS_NAME_LABEL",
    "target": "Operating Business Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.PRODUCTS_AND_SERVICES_LABEL",
    "target": "Who do you market your products and services to? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.PRODUCTS_TIP",
    "target": "* For example what type of customers do you have (corporate/individual/financial institutions/other); what are the industry sectors of your customers; what are your customers main geographic locations? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.SOURCE_OF_FUNDS_LABEL",
    "target": "Source of Funds (what is your primary source of revenue?) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.SOURCE_OF_FUNDS_OTHER_LABEL",
    "target": "Source of Funds (Other) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.TAX_ID_LABEL",
    "target": "Tax Identification Number (US Only) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.HOLDING_QUESTION",
    "target": "Is this a holding company? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.THIRD_PARTY_QUESTION",
    "target": "Are you taking instruction from and/or conducting transactions on behalf of a third party? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.SECOND_TITLE",
    "target": "Business contact information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.PRIMARY_RESIDENCE_LABEL",
    "target": "Do you operate this business from your residence? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.PHONE_NUMBER_LABEL",
    "target": "Business Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.WEBSITE_LABEL",
    "target": "Website (Optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.THIRD_TITLE",
    "target": "Add supporting files fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.UPLOAD_DESCRIPTION",
    "target": "Please upload one of the following: fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.NO_PO_BOXES",
    "target": "No PO Boxes Allowed fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BusinessForm",
    "source": "net.nanopay.sme.onboarding.ui.BusinessForm.QUEBEC_DISCLAIMER",
    "target": "Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.TITLE",
    "target": "Signing officer information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.SIGNING_OFFICER_QUESTION",
    "target": "Are you a signing officer of your company? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.INFO_MESSAGE",
    "target": "A signing officer must complete the rest of your business profile. You're all done! fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.INVITE_TITLE",
    "target": "Invite users to your business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.FIRST_NAME_LABEL",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.LAST_NAME_LABEL",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.JOB_LABEL",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.PHONE_NUMBER_LABEL",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.EMAIL_LABEL",
    "target": "Email Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.BIRTHDAY_LABEL",
    "target": "Date of birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.ADDRESS_HEADING",
    "target": "Signing officer contact information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.IDENTIFICATION_TITLE",
    "target": "Identification fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.SUPPORTING_TITLE",
    "target": "Add supporting files fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.DOMESTIC_QUESTION",
    "target": "Are you a domestic or foreign Politically Exposed Person (PEP),\n          Head of an International Organization (HIO), or a close associate or\n          family member of any such person? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.SIGNING_INFORMATION",
    "target": "A signing officer is a person legally authorized to act\n          on behalf of the business. (e.g. CEO, COO, board director) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.ADD_USERS_LABEL",
    "target": "+ Add Users fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.INVITE_USERS_HEADING",
    "target": "Invite users to your business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.INVITE_USERS_EXP",
    "target": "Invite a signing officer to your business.\n          Recipients will receive a link to join your business on Ablii fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.SIGNING_OFFICER_UPLOAD_DESC",
    "target": "Please provide a copy of your government issued drivers license or passport. \n          The image must be clear, or will require resubmission. If your name differs from what \n          the ID shows, please provide sufficient documentation (marriage certificate, name change documentation, etc) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.SigningOfficerForm",
    "source": "net.nanopay.sme.onboarding.ui.SigningOfficerForm.QUEBEC_DISCLAIMER",
    "target": "Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.TITLE",
    "target": "Beneficial Ownership fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.OWNER_LABEL",
    "target": "Owner fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.LEGAL_NAME_LABEL",
    "target": "Legal Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.FIRST_NAME_LABEL",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.MIDDLE_NAME_LABEL",
    "target": "Middle Initials (optional) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.LAST_NAME_LABEL",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.JOB_TITLE_LABEL",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.COUNTRY_CODE_LABEL",
    "target": "Country Code fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.DATE_OF_BIRTH_LABEL",
    "target": "Date of Birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.RESIDENTIAL_ADDRESS_LABEL",
    "target": "Residential Address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.BENEFICIAL_OWNER_LABEL",
    "target": "A beneficial owner with that name already exists. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.DELETE_LABEL",
    "target": "Delete fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.EDIT_LABEL",
    "target": "Edit fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.SAME_AS_SIGNING",
    "target": "Same as Signing Officer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.NO_BENEFICIAL_OWNERS",
    "target": "No individuals own 25% or more fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.PUBLICLY_TRADED_ENTITY",
    "target": "Owned by a publicly traded entity fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.SUPPORTING_TITLE",
    "target": "Add supporting files fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.ADDITIVE_TITLE",
    "target": "List of Added Owners fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.OWNER_PERCENT_LABEL",
    "target": "% - Percentage of business ownership (current owner) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.UPLOAD_INFORMATION",
    "target": "Please upload a document containing proof of the beneficial ownership\n     information you have entered above. If the document you uploaded in step 1 contains such proof, you can skip this. Acceptable documents (only if beneficial ownership information is contained therein):\n\n\n     Corporations: Securities Register, T2-Schedule 50, Shareholder Agreement, Annual Return\n\n     Partnerships: Partnership Agreement, Articles of Constitution\n\n     Trust: Full Trust Deed (including names and addresses of all trustees, beneficiaries, and settlers of the trust)\n      fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.ADVISORY_NOTE",
    "target": "If your business has beneficial owners who, directly or indirectly, own 25% or more of the business, please provide the information below for each owner. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.BENEFICIAL_OWNER_ERROR",
    "target": "This user is already assigned as a beneficial owner. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.NO_ADDITIONAL_OWNERS",
    "target": "I certify that all beneficial owners with 25% or more ownership have been listed and the information included about them is accurate. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.BENEFICIAL_OWNER_SUCCESS",
    "target": "Beneficial owner added successfully. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.BENEFICIAL_OWNER_FAILURE",
    "target": "Unexpected error when adding beneficial owner. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.SECUREFACT_DISCLOSURE_1",
    "target": "We have engaged Securefact Transaction Services Inc. (\"Securefact\") to provide this verification for us. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.SECUREFACT_DISCLOSURE_2",
    "target": "To verify your identity, your personal information will be matched with the information contained in your Credit File Report and other third party sources. This is a soft inquiry and will not affect your credit score or be visible to other financial institutions. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.SECUREFACT_DISCLOSURE_3",
    "target": "You also consent to your personal information being compared to records maintained by third parties, including telecom and other service providers, and you consent to those third parties providing personal information to us and our third-party suppliers for the purpose of identity verification. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm",
    "source": "net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm.SECUREFACT_DISCLOSURE_4",
    "target": "By clicking “Complete” and submitting the information above, you confirm your consent to Securefact collecting, using, disclosing, and storing your personal information for the purpose of this verification. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.TITLE",
    "target": "Details about your transactions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.REVENUE_ESTIMATE_LABEL_CA",
    "target": "Annual Gross Sales in CAD fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.REVENUE_ESTIMATE_LABEL_US",
    "target": "Annual Gross Sales in USD fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.PURPOSE_LABEL",
    "target": "Please provide us with the purpose of your transactions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.INTERNATIONAL_PAYMENTS_LABEL",
    "target": "Are you sending or receiving international payments? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.ANTICIPATED_TRADE_LABEL",
    "target": "Anticipated First Payment Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.SECOND_TITLE",
    "target": "International transfers fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.THIRD_TITLE",
    "target": "Domestic transfers fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.CURRENCY_TYPE",
    "target": "U.S. Dollars fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.ANNUAL_LABEL",
    "target": "Annual Number of Transactions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.CA_DOLLAR_LABEL",
    "target": "Canadian Dollar fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.CA_VOLUME_LABEL",
    "target": "Estimated Annual Volume in CAD fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.US_DOLLAR_LABEL",
    "target": "U.S. Dollar fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.US_VOLUME_LABEL",
    "target": "Estimated Annual Volume in USD fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm",
    "source": "net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm.OTHER_PURPOSE_LABEL",
    "target": "Please indicate below fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.sme.onboarding.ui.WizardView",
    "source": "net.nanopay.sme.onboarding.ui.WizardView.SUCCESS_SUBMIT_MESSAGE",
    "target": "Business profile submitted successfully. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.xero.model.XeroContact",
    "source": "net.nanopay.accounting.xero.model.XeroContact.LAST_DATE_UPDATED.label",
    "target": "Xero Last Updated fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
    "source": "net.nanopay.accounting.quickbooks.model.QuickbooksContact.LAST_DATE_UPDATED.label",
    "target": "Quickbooks Last Updated fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.IntegrationPopUpView",
    "source": "net.nanopay.accounting.ui.IntegrationPopUpView.YourBanksLabel",
    "target": "Your Ablii bank accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.IntegrationPopUpView",
    "source": "net.nanopay.accounting.ui.IntegrationPopUpView.AccountingBanksLabel",
    "target": "Bank accounts in your accounting software fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.IntegrationPopUpView",
    "source": "net.nanopay.accounting.ui.IntegrationPopUpView.BankMatchingDesc1",
    "target": "Please select which accounts you would like to match between Ablii and  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.IntegrationPopUpView",
    "source": "net.nanopay.accounting.ui.IntegrationPopUpView.BankMatchingDesc2",
    "target": " from the drop downs. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.IntegrationPopUpView",
    "source": "net.nanopay.accounting.ui.IntegrationPopUpView.BankMatchingDesc3",
    "target": "This will ensure that all transactions completed on Ablii are mapped and reconciled to the correct account in  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.IntegrationPopUpView",
    "source": "net.nanopay.accounting.ui.IntegrationPopUpView.BankMatchingTitle",
    "target": "Bank account matching fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.IntegrationPopUpView",
    "source": "net.nanopay.accounting.ui.IntegrationPopUpView.TokenExpired",
    "target": "Your connection to the accounting software has expired. Please sync again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingBankMatching",
    "source": "net.nanopay.accounting.ui.AccountingBankMatching.YourBanksLabel",
    "target": "Your Ablii bank accounts fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingBankMatching",
    "source": "net.nanopay.accounting.ui.AccountingBankMatching.AccountingBanksLabel",
    "target": "Bank accounts in your accounting software fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingBankMatching",
    "source": "net.nanopay.accounting.ui.AccountingBankMatching.BankMatchingDesc1",
    "target": "Please select which accounts you would like to match between Ablii and  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingBankMatching",
    "source": "net.nanopay.accounting.ui.AccountingBankMatching.BankMatchingDesc2",
    "target": " from the drop downs. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingBankMatching",
    "source": "net.nanopay.accounting.ui.AccountingBankMatching.BankMatchingDesc3",
    "target": "This will ensure that all transactions completed on Ablii are mapped and reconciled to the correct account in  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingBankMatching",
    "source": "net.nanopay.accounting.ui.AccountingBankMatching.BankMatchingTitle",
    "target": "Bank account matching fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingBankMatching",
    "source": "net.nanopay.accounting.ui.AccountingBankMatching.TokenExpired",
    "target": "Your connection to the accounting software has expired. Please sync again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage1",
    "source": "net.nanopay.accounting.ui.AccountingReportPage1.SUCCESS_MESSAGE",
    "target": "Successfully synced contacts and invoices fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage1",
    "source": "net.nanopay.accounting.ui.AccountingReportPage1.ADDRESS_WARNING",
    "target": "The following contacts are missing a business address. You'll need to add an address before sending them a payment. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.TITLE",
    "target": "Some invoices and contacts failed to sync fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.TEXT",
    "target": " Fix these errors in  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.TEXT2",
    "target": " and sync again. Download the report for you convenience. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.CONTACT_TEXT",
    "target": "The following contacts failed to sync due to missing information. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.INVOICE_TEXT",
    "target": "The following invoices failed to sync due to missing information. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.MISMATCH_TEXT",
    "target": "The following contacts failed to sync due to technical difficulties. We apologize for your inconvenience. Please contact our support team for more details. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.MISMATCH",
    "target": "Contacts and Invoices that currently can't be synced fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.INVOICES_FAILED",
    "target": "Invoices failed to sync fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.AccountingReportPage2",
    "source": "net.nanopay.accounting.ui.AccountingReportPage2.CONTACTS_FAILED",
    "target": "Contacts failed to sync  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.accounting.ui.ErrorTable",
    "source": "net.nanopay.accounting.ui.ErrorTable.SuccessMessage",
    "target": "Successfully synced contacts and invoices fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.clearing.ruler.TransactionTypeClearingTimeRule",
    "source": "net.nanopay.meter.clearing.ruler.TransactionTypeClearingTimeRule.OF.label",
    "target": "Transaction Type fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.ruler.CreateRemoveComplianceItemRule",
    "source": "net.nanopay.meter.compliance.ruler.CreateRemoveComplianceItemRule.DESCRIBE_TEXT",
    "target": "Creates or removes ComplianceItem based on creation or removal of compliance response. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.ruler.CreateRemoveComplianceItemRule",
    "source": "net.nanopay.meter.compliance.ruler.CreateRemoveComplianceItemRule.ILLEGAL_ACTION",
    "target": "Modification or other illegal action is occuring on compliance item. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.secureFact.SecurefactService",
    "source": "net.nanopay.meter.compliance.secureFact.SecurefactService.SIDNI_URL.label",
    "target": "SIDni URL fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.secureFact.SecurefactService",
    "source": "net.nanopay.meter.compliance.secureFact.SecurefactService.SIDNI_API_KEY.label",
    "target": "SIDni API Key fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.secureFact.SecurefactService",
    "source": "net.nanopay.meter.compliance.secureFact.SecurefactService.LEV_URL.label",
    "target": "LEV URL fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.meter.compliance.secureFact.SecurefactService",
    "source": "net.nanopay.meter.compliance.secureFact.SecurefactService.LEV_API_KEY.label",
    "target": "LEV API Key fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerInformationData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerInformationData.INVALID_SO_DATA",
    "target": "One or more fields of the Signing Officer Data is not valid. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerInformationData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerInformationData.SO_PERSONAL_DATA.label",
    "target": "Signing Officer Personal Information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.CANNOT_SELECT_QUEBEC_ERROR",
    "target": "This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.INVALID_ADDRESS_ERROR",
    "target": "Invalid address. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.UNGER_AGE_LIMIT_ERROR",
    "target": "Must be at least 18 years old. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.OVER_AGE_LIMIT_ERROR",
    "target": "Must be under the age of 125 years old. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.BIRTHDAY.label",
    "target": "Date of birth fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.PEPHIORELATED.label",
    "target": "I am a politically exposed person or head of an international organization (PEP/HIO) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.SECTION_SIGNING_OFFICER_PERSONAL_INFORMATION_SECTION.title",
    "target": "Enter the signing officer's personal information fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.SECTION_SIGNING_OFFICER_ADDRESS_SECTION.title",
    "target": "Enter the signing officer's address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.SECTION_SIGNING_OFFICER_IDENTIFICATION_SECTION.title",
    "target": "Enter the signing officer's personal identification fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.SIGNING_OFFICER_EMAIL_ERROR",
    "target": "Please provide an email for the signing officer. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_FIRST_NAME_ERROR",
    "target": "Please enter first name with least 1 character. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_LAST_NAME_ERROR",
    "target": "Please enter last name with least 1 character. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.NO_JOB_TITLE_ERROR",
    "target": "Please select job title. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.INVALID_PHONE_NUMBER_ERROR",
    "target": "Invalid phone number. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.SIGNING_OFFICER_EMAIL.label",
    "target": "Enter your signing officer's email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_FIRST_NAME.label",
    "target": "First Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_LAST_NAME.label",
    "target": "Last Name fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_JOB_TITLE.label",
    "target": "Job Title fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.ADMIN_PHONE.label",
    "target": "Phone Number fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.SECTION_SIGNING_OFFICER_QUESTION_SECTION.title",
    "target": "Are you considered a signing officer at the company? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion",
    "source": "net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.SECTION_SIGNING_OFFICER_EMAIL_SECTION.title",
    "target": "Enter the signing officer's email fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.PLACE_HOLDER",
    "target": "Please select... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.BUSINESS_TYPE_ERROR",
    "target": "Please select type of business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.NATURE_OF_BUSINESS_ERROR",
    "target": "Please select nature of business. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.SOURCE_OF_FUNDS_ERROR",
    "target": "Please provide primary source of funds. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.OPERATING_NAME_ERROR",
    "target": "Please enter business name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.BUSINESS_TYPE_ID.label",
    "target": "Type of business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.BUSINESS_SECTOR_ID.label",
    "target": "Nature of business fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.SOURCE_OF_FUNDS.label",
    "target": "Primary source of funds fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.OPERATING_UNDER_DIFFERENT_NAME.label",
    "target": "Does your business operate under a different name? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.OPERATING_BUSINESS_NAME.label",
    "target": "Company fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessInformationData.SECTION_BUSINESS_DETAILS_SECTION.title",
    "target": "Enter the business details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessAddressData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessAddressData.COUNTRY_MISMATCH_ERROR",
    "target": "Country of business address must match the country of business registration. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessAddressData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessAddressData.QUEBEC_NOT_SUPPORTED_ERROR",
    "target": "This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessAddressData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessAddressData.INVALID_ADDRESS_ERROR",
    "target": "Invalid address. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.BusinessAddressData",
    "source": "net.nanopay.crunch.onboardingModels.BusinessAddressData.SECTION_BUSINESS_ADDRESS_SECTION.title",
    "target": "Enter the business address fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.TransactionDetailsData",
    "source": "net.nanopay.crunch.onboardingModels.TransactionDetailsData.NO_TARGET_CUSTOMERS_ERROR",
    "target": "Please enter target customers. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.TransactionDetailsData",
    "source": "net.nanopay.crunch.onboardingModels.TransactionDetailsData.NO_SUGGESTED_USER_TXN_INFO_ERROR",
    "target": "Please enter suggested user transaction info. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.TransactionDetailsData",
    "source": "net.nanopay.crunch.onboardingModels.TransactionDetailsData.TARGET_CUSTOMERS.label",
    "target": "Who do you market the products and services to? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.TransactionDetailsData",
    "source": "net.nanopay.crunch.onboardingModels.TransactionDetailsData.SECTION_TRANSACTION_SECTION.title",
    "target": "Enter the transaction details fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.TransactionDetailsData",
    "source": "net.nanopay.crunch.onboardingModels.TransactionDetailsData.SECTION_PURPOSE_SECTION.title",
    "target": "  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.TransactionDetailsData",
    "source": "net.nanopay.crunch.onboardingModels.TransactionDetailsData.SECTION_REVIEW_SECTION.title",
    "target": "  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.BUSINESS_REGISTRATION_DATE_ERROR",
    "target": "Cannot be future dated. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.COUNTRY_OF_REGISTRATION_ERROR",
    "target": "This application does not currently support businesses outside of Canada and the USA. We are working hard to change this! If you are based outside of Canada and the USA, check back for updates. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.TAX_ID_NUMBER_ERROR",
    "target": "Please enter valid Federal Tax ID Number (EIN). fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.BUSINESS_REGISTRATION_DATE.label",
    "target": "businessFormationDate fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.COUNTRY_OF_BUSINESS_REGISTRATION.label",
    "target": "countryOfBusinessFormation fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData",
    "source": "net.nanopay.crunch.onboardingModels.InternationalBusinessInformationData.TAX_IDENTIFICATION_NUMBER.label",
    "target": "Federal Tax ID Number (EIN) fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions.ACKNOWLEDGE_ABLII_TC",
    "target": "Must acknowledge the Terms and Conditions. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy.ACKNOWLEDGE_PRIVACY_POLICY",
    "target": "Must acknowledge the Privacy Policy. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.CADAFEXTerms",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.CADAFEXTerms.ACKNOWLEDGE_AGREEMENT",
    "target": "Must acknowledge the agreement. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.USDAFEXTerms",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.USDAFEXTerms.ACKNOWLEDGE_AFEX_AGREEMENT",
    "target": "Must acknowledge the AFEX agreement. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.NanopayInternationalPaymentsCustomerAgreement",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.NanopayInternationalPaymentsCustomerAgreement.ACKNOWLEDGE_AGREEMENT",
    "target": "Must acknowledge the agreement above. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyOwnersPercent",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyOwnersPercent.CERTIFY_OWNER_PERCENTAGE",
    "target": "You must certify that all beneficial owners with 25% or more ownership have been listed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyBankAccountOwnership",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyBankAccountOwnership.ACKNOWLEDGE_STATEMENT",
    "target": "Must acknowledge the statement above. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.TriPartyAgreementCAD",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.TriPartyAgreementCAD.ACKNOWLEDGE_AGREEMENT",
    "target": "Must acknowledge the agreement above. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.TriPartyAgreementUSD",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.TriPartyAgreementUSD.ACKNOWLEDGE_AFEX_AGREEMENT",
    "target": "Must acknowledge the AFEX agreement. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.DualPartyAgreementCAD",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.DualPartyAgreementCAD.ACKNOWLEDGE_AGREEMENT",
    "target": "Must acknowledge the agreement above. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXArizonaDisclosure",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXArizonaDisclosure.ACKNOWLEDGE_DISCLOSURE",
    "target": "Must acknowledge the Disclosure. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXCaliforniaDisclosure",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXCaliforniaDisclosure.ACKNOWLEDGE_DISCLOSURE",
    "target": "Must acknowledge the Disclosure. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXColoradoDisclosure",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXColoradoDisclosure.ACKNOWLEDGE_DISCLOSURE",
    "target": "Must acknowledge the Disclosure. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXMassachusettsDisclosure",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXMassachusettsDisclosure.ACKNOWLEDGE_DISCLOSURE",
    "target": "Must acknowledge the Disclosure. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXNewYorkDisclosure",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXNewYorkDisclosure.ACKNOWLEDGE_DISCLOSURE",
    "target": "Must acknowledge the Disclosure. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXWashingtonDisclosure",
    "source": "net.nanopay.crunch.acceptanceDocuments.capabilities.AFXWashingtonDisclosure.ACKNOWLEDGE_DISCLOSURE",
    "target": "Must acknowledge the Disclosure. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability",
    "source": "net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability.ISSUED_DATE.label",
    "target": "Effective Date fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.FlinksView",
    "source": "net.nanopay.flinks.view.FlinksView.title",
    "target": "Connect a new bank account fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksInstitutionForm",
    "source": "net.nanopay.flinks.view.form.FlinksInstitutionForm.Step",
    "target": "Step 1: Please choose your institution below. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksInstitutionForm",
    "source": "net.nanopay.flinks.view.form.FlinksInstitutionForm.Error",
    "target": "Invalid Institution fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksInstitutionForm",
    "source": "net.nanopay.flinks.view.form.FlinksInstitutionForm.NameLabel",
    "target": "Institution * fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksInstitutionForm",
    "source": "net.nanopay.flinks.view.form.FlinksInstitutionForm.OTHER_ACC",
    "target": "Don't see your bank?  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksInstitutionForm",
    "source": "net.nanopay.flinks.view.form.FlinksInstitutionForm.LINK",
    "target": "Click here fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksAccountForm",
    "source": "net.nanopay.flinks.view.form.FlinksAccountForm.Step",
    "target": "Step 4: Please choose the account you want to connect with nanopay. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksConnectForm",
    "source": "net.nanopay.flinks.view.form.FlinksConnectForm.Step",
    "target": "Step 2: Login to your bank account and securely connect with nanopay. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksConnectForm",
    "source": "net.nanopay.flinks.view.form.FlinksConnectForm.LoginName",
    "target": "Access Card No. / Username fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksConnectForm",
    "source": "net.nanopay.flinks.view.form.FlinksConnectForm.LoginPassword",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksConnectForm",
    "source": "net.nanopay.flinks.view.form.FlinksConnectForm.errorUsername",
    "target": "Invalid Username fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksConnectForm",
    "source": "net.nanopay.flinks.view.form.FlinksConnectForm.errorPassword",
    "target": "Invalid Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksConnectForm",
    "source": "net.nanopay.flinks.view.form.FlinksConnectForm.TERMS_AGREEMENT_DOCUMENT_NAME",
    "target": "NanopayTermsAndConditions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksMFAForm",
    "source": "net.nanopay.flinks.view.form.FlinksMFAForm.Step",
    "target": "Step 4: Please answer below security question fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksMFAForm",
    "source": "net.nanopay.flinks.view.form.FlinksMFAForm.header1",
    "target": "Please answer the security question:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksMFAForm",
    "source": "net.nanopay.flinks.view.form.FlinksMFAForm.answerError",
    "target": "Invalid answer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksDoneForm",
    "source": "net.nanopay.flinks.view.form.FlinksDoneForm.Step",
    "target": "Step 6: You're all set! Connection is successful. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksThreeQA",
    "source": "net.nanopay.flinks.view.form.FlinksThreeQA.Step",
    "target": "Step3: Please response below security challenges fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksThreeQA",
    "source": "net.nanopay.flinks.view.form.FlinksThreeQA.header1",
    "target": "Please answer the security question:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksThreeQA",
    "source": "net.nanopay.flinks.view.form.FlinksThreeQA.answerError",
    "target": "Invalid answer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksThreeOptionForm",
    "source": "net.nanopay.flinks.view.form.FlinksThreeOptionForm.Step",
    "target": "Step3: Please response below security challenges fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksThreeOptionForm",
    "source": "net.nanopay.flinks.view.form.FlinksThreeOptionForm.header1",
    "target": "Please reset the security questions:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksThreeOptionForm",
    "source": "net.nanopay.flinks.view.form.FlinksThreeOptionForm.answerError",
    "target": "Invalid answer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksMultipleChoiceForm",
    "source": "net.nanopay.flinks.view.form.FlinksMultipleChoiceForm.Step",
    "target": "Step3: Please response below security challenges fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksMultipleChoiceForm",
    "source": "net.nanopay.flinks.view.form.FlinksMultipleChoiceForm.header1",
    "target": "Please answer below multiple choices(may have multiple answers):  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksMultipleChoiceForm",
    "source": "net.nanopay.flinks.view.form.FlinksMultipleChoiceForm.answerError",
    "target": "Invalid answer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm",
    "source": "net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm.Step",
    "target": "Step 3: Please respond to the security challenges below. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm",
    "source": "net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm.header1",
    "target": "Please answer the security question:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm",
    "source": "net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm.answerError",
    "target": "Invalid answer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm",
    "source": "net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm.Step",
    "target": "Step3: Please response below security challenges fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm",
    "source": "net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm.header1",
    "target": "Please reset the security question:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm",
    "source": "net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm.answerError",
    "target": "Invalid answer fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksFailForm",
    "source": "net.nanopay.flinks.view.form.FlinksFailForm.Step",
    "target": "Error: Please try again later fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksImageForm",
    "source": "net.nanopay.flinks.view.form.FlinksImageForm.Step",
    "target": "Step3: Please response below security challenges fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.form.FlinksImageForm",
    "source": "net.nanopay.flinks.view.form.FlinksImageForm.header1",
    "target": "Please select below images:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.FlinksInstitutionsView",
    "source": "net.nanopay.flinks.view.FlinksInstitutionsView.NO_MATCH_FOUND",
    "target": "We could not find any banks with that name. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.FlinksInstitutionsView",
    "source": "net.nanopay.flinks.view.FlinksInstitutionsView.OTHER_BANK",
    "target": "Don't see your bank here? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.FlinksInstitutionsView",
    "source": "net.nanopay.flinks.view.FlinksInstitutionsView.CLICK_HERE",
    "target": "Connect with a void check fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.element.FlinksModalHeader",
    "source": "net.nanopay.flinks.view.element.FlinksModalHeader.ConnectTo",
    "target": "Connect to fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.CONNECTING",
    "target": "Securely connecting you to your institution. Please do not close this window. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.ERROR",
    "target": "An unknown error has occurred. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.INVALID_FORM",
    "target": "Please complete the form before proceeding. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.ACCEPT_CONDITIONS",
    "target": "Please accept the terms and conditions before proceeding. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.LABEL_USERNAME",
    "target": "Access Card # / Username fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.LABEL_PASSWORD",
    "target": "Password fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.LEGAL_1",
    "target": "I agree to the  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.LEGAL_2",
    "target": "terms and conditions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.LEGAL_3",
    "target": " and authorize the release of my Bank information to nanopay. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalConnect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalConnect.TERMS_AGREEMENT_DOCUMENT_NAME",
    "target": "NanopayTermsAndConditions fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurity",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurity.UNKNOWN_SECURITY_TYPE",
    "target": "An unknown error occurred. Please try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurity",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurity.CONNECTING_SECURITY",
    "target": "Securely connecting to your account. This may take up to 10 minutes. Please do not close this window. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurity",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurity.CONNECTING_POLLING_1",
    "target": "Still connecting to your account. Thank you for your patience. Please do not close this window. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityReset",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityReset.ERROR_1",
    "target": "For security reasons, we cannot continue this process. Please log into your bank portal and rectify any security issues and try again. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityReset",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityReset.ERROR_2",
    "target": "We apologize for the inconvenience. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer.INVALID_FORM",
    "target": "Please answer all questions. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer.INSTRUCTIONS",
    "target": "To verify that you own this account, please answer the following question(s). fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer.TWO_FACTOR_METHOD",
    "target": "How would you like to receive your one-time security code? fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer.CALL_METHOD",
    "target": "Call fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer.TEXT_METHOD",
    "target": "Text fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityImage",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityImage.INSTRUCTIONS",
    "target": "Please select your personal image below:  fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityImage",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalSecurityImage.INVALID_FORM",
    "target": "Please select your personal image to proceed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalAccountSelect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalAccountSelect.Connecting",
    "target": "Almost there ... fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalAccountSelect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalAccountSelect.INVALID_FORM",
    "target": "Please select an account to proceed. fr"
  }),
this.XLIFFTranslationValue.create(
  {
    "id": "net.nanopay.flinks.view.modalForm.FlinksModalAccountSelect",
    "source": "net.nanopay.flinks.view.modalForm.FlinksModalAccountSelect.INSTRUCTIONS",
    "target": "Please select the account you wish to connect. fr"
  }),

//+++++++++++++++++++++++++++++++++++++++++
                ]
              }
          });
        }
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      // done to start using SectionedDetailViews instead of DetailViews
      this.__subContext__.register(foam.u2.detail.SectionedDetailView, 'foam.u2.DetailView');

      var self = this;

      window.onpopstate = async function(event) {
        var hid = location.hash.substr(1);
        if ( hid ) {
          if ( self.client ) {
            var menu = await self.client.menuDAO.find(hid);
            menu && menu.launch(this);
          } else {
            self.clientPromise.then(async () => {
              var menu = await self.client.menuDAO.find(hid);
              menu && menu.launch(this);
            });
          }
        }
      };

      this.clientPromise.then(async function(client) {
        self.setPrivate_('__subContext__', client.__subContext__);

        await self.fetchSubject();
//        await self.fetchLanguage();

        // add user and agent for backward compatibility
        Object.defineProperty(self, 'user', {
          get: function() {
            console.info("Deprecated use of user. Use Subject to retrieve user");
            return this.subject.user;
          },
          set: function(newValue) {
            console.warn("Deprecated use of user setter");
            this.subject.user = newValue;
          }
        });
        Object.defineProperty(self, 'agent', {
          get: function() {
            console.warn("Deprecated use of agent");
            return this.subject.realUser;
          }
        });

        // Fetch the group only once the user has logged in. That's why we await
        // the line above before executing this one.
        await self.fetchGroup();
        await self.fetchTheme();
        self.onUserAgentAndGroupLoaded();
      });
    },

    function initE() {
      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();

      this.clientPromise.then(() => {
        this.fetchTheme().then(() => {
          this
            .addClass(this.myClass())
            .start()
              .add(this.slot(function (topNavigation_) {
                return this.E().tag(topNavigation_);
              }))
            .end()
            .start()
              .addClass('stack-wrapper')
              .tag({
                class: 'foam.u2.stack.StackView',
                data: this.stack,
                showActions: false
              })
            .end()
            .start()
              .add(this.slot(function (footerView_) {
                return this.E().tag(footerView_);
              }))
            .end();
          });
      });
    },

    async function fetchGroup() {
      try {
        var group = await this.client.auth.getCurrentGroup();
        if ( group == null ) throw new Error(this.GROUP_NULL_ERR);
        this.group = group;
      } catch (err) {
        this.notify(this.GROUP_FETCH_ERR, 'error');
        console.error(err.message || this.GROUP_FETCH_ERR);
      }
    },

    async function fetchSubject() {
      /** Get current user, else show login. */
      try {
        var result = await this.client.auth.getCurrentSubject(null);
        this.loginSuccess = !! result && !! result.user;

        if ( ! this.loginSuccess ) throw new Error();

        this.subject = result;
      } catch (err) {
        await this.requestLogin();
        return await this.fetchSubject();
      }
    },

    function expandShortFormMacro(css, m) {
      /* A short-form macros is of the form %PRIMARY_COLOR%. */
      var M = m.toUpperCase();

      // NOTE: We add a negative lookahead for */, which is used to close a
      // comment in CSS. We do this because if we don't, then when a developer
      // chooses to include a long form CSS macro directly in their CSS such as
      //
      //                       /*%EXAMPLE%*/ #abc123
      //
      // then we don't want this method to expand the commented portion of that
      // CSS because it's already in long form. By checking if */ follows the
      // macro, we can tell if it's already in long form and skip it.
      return css.replace(
        new RegExp('%' + M + '%(?!\\*/)', 'g'),
        '/*%' + M + '%*/ ' + this.theme[m]);
    },

    function expandLongFormMacro(css, m) {
      // A long-form macros is of the form "/*%PRIMARY_COLOR%*/ blue".
      var M = m.toUpperCase();

      return css.replace(
        new RegExp('/\\*%' + M + '%\\*/[^;]*', 'g'),
        '/*%' + M + '%*/ ' + this.theme[m]);
    },

    function wrapCSS(text, id) {
      /** CSS preprocessor, works on classes instantiated in subContext. */
      if ( text ) {
        var eid = foam.u2.Element.NEXT_ID();

        for ( var i = 0 ; i < this.MACROS.length ; i++ ) {
          let m     = this.MACROS[i];
          var text2 = this.expandShortFormMacro(this.expandLongFormMacro(text, m), m);

            // If the macro was found, then listen for changes to the property
            // and update the CSS if it changes.
            if ( text != text2 ) {
              text = text2;
              this.onDetach(this.theme$.dot(m).sub(() => {
                var el = this.getElementById(eid);
                el.innerText = this.expandLongFormMacro(el.innerText, m);
              }));
            }
        }

        this.installCSS(text, id, eid);
      }
    },

    function pushMenu(menu) {
      if ( menu.id ) {
        menu.launch(this);
        menu = menu.id;
      }

      /** Use to load a specific menu. **/
      if ( window.location.hash.substr(1) != menu ) {
        window.location.hash = menu;
      }
    },

    function requestLogin() {
      var self = this;

      // don't go to log in screen if going to reset password screen
      if ( location.hash && location.hash === '#reset' ) {
        return new Promise(function(resolve, reject) {
          self.stack.push({
            class: 'foam.nanos.auth.ChangePasswordView',
            modelOf: 'foam.nanos.auth.ResetPassword'
           });
          self.loginSuccess$.sub(resolve);
        });
      }

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, self);
        self.loginSuccess$.sub(resolve);
      });
    },

    function requestCapability(capabilityInfo) {
      var self = this;

      capabilityInfo.capabilityOptions.forEach((c) => {
        self.capabilityCache.set(c, false);
      });

      let intercept = self.CapabilityIntercept.create({
        capabilityOptions: capabilityInfo.capabilityOptions
      });

      return self.crunchController.maybeLaunchInterceptView(intercept);
    },

    function notify(data, type, description) {
      /** Convenience method to create toast notifications. */
      this.add(this.NotificationMessage.create({
        message: data,
        type: type,
        description: description
      }));
    }
  ],

  listeners: [
    function onUserAgentAndGroupLoaded() {
      /**
       * Called whenever the group updates.
       *   - Updates the portal view based on the group
       *   - Update the look and feel of the app based on the group or user
       *   - Go to a menu based on either the hash or the group
       */
      this.fetchTheme();

      var hash = this.window.location.hash;
      if ( hash ) hash = hash.substring(1);

      if ( hash ) {
        window.onpopstate();
      } else if ( this.theme ) {
        this.window.location.hash = this.theme.defaultMenu;
      }
    },

    function menuListener(m) {
      /**
       * This listener should be called when a Menu item has been launched
       * by some Menu View. Is exported.
       */
      this.currentMenu = m;
    },

    function lastMenuLaunchedListener(m) {
      /**
       * This listener should be called when a Menu has been launched but does
       * not navigate to a new screen. Typically for SubMenus.
       */
      this.lastMenuLaunched = m;
    },

    async function fetchTheme() {
      /**
       * Get the most appropriate Theme object from the server and use it to
       * customize the look and feel of the application.
       */
      var lastTheme = this.theme;
      try {
        this.theme = await this.Themes.create().findTheme(this);
      } catch (err) {
        this.notify(this.LOOK_AND_FEEL_NOT_FOUND, 'error');
        console.error(err);
        return;
      }

      if ( ! lastTheme || lastTheme.id != this.theme.id ) this.useCustomElements();
    },

    //TODO add the option to the user to select a language
//    async function fetchLanguage() {
//      /**
//       * Get the language
//       */
//      foam.language = 'fr';
//    },

    function useCustomElements() {
      /** Use custom elements if supplied by the Theme. */
      if ( ! this.theme ) throw new Error(this.LOOK_AND_FEEL_NOT_FOUND);

      if ( this.theme.topNavigation ) {
        this.topNavigation_ = this.theme.topNavigation;
      }

      if ( this.theme.footerView ) {
        this.footerView_ = this.theme.footerView;
      }
    },
    {
      name: 'updateDisplayWidth',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        this.displayWidth = foam.u2.layout.DisplayWidth.VALUES
          .concat()
          .sort((a, b) => b.minWidth - a.minWidth)
          .find(o => o.minWidth <= window.innerWidth);
      }
    }
  ]
});