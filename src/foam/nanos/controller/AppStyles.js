
foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'AppStyles',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS that can be included into the top level controller of foam app. Implement to foam class to use.',

  css: `
    body {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: #373a3c;
      background: #edf0f5;
      margin: 0;
    }
    table {
      border-collapse: collapse;
      margin: auto;
      width: 962px;
    }
    thead > tr > th {
      font-family: 'Roboto';
      font-size: 14px;
      background-color: rgba(110, 174, 195, 0.2);
      color: #093649;
      line-height: 1.14;
      letter-spacing: 0.3px;
      border-spacing: 0;
      text-align: left;
      padding-left: 15px;
      height: 40px;
    }
    tbody > tr > th > td {
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      padding-left: 15px;
      height: 60px;
    }
    .foam-u2-view-TableView th {
      font-family: 'Roboto';
      padding-left: 15px;
      font-size: 14px;
      line-height: 1;
      letter-spacing: 0.4px;
      color: #093649;
    }
    .foam-u2-view-TableView td {
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      padding-left: 15px;
      font-size: 12px;
      color: #093649;
    }
    .foam-u2-view-TableView tbody > tr {
      height: 60px;
      background: white;
    }
    .foam-u2-view-TableView tbody > tr:nth-child(odd) {
      background: #f6f9f9;
    }
  `
});
