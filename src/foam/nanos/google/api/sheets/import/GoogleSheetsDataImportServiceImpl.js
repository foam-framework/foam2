foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetsDataImportServiceImpl',
  implements: [
    'foam.nanos.google.api.sheets.GoogleSheetsDataImportService'
  ],
  javaImports: [
    'com.google.api.services.sheets.v4.model.ValueRange',

    'java.lang.Throwable',
    'java.util.List',
    'java.util.regex.Matcher',
    'java.util.regex.Pattern',
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        //move all this to helper class
        cls.extras.push(foam.java.Code.create({
          data: `
          public static Pattern digitAppearenceRegex = Pattern.compile("(\\\\d){1}");
          `
        }));
      }
    }
  ],
  methods: [
    {
      name: 'getColumns',
      javaType: 'String[]',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'importConfig',
          type: 'foam.nanos.google.api.sheets.GoogleSheetsImportConfig'
        }
      ],
      javaCode:`
      GoogleSheetsApiService googleSheetsAPIEnabler = (GoogleSheetsApiService)x.get("googleSheetsDataExport");
      ValueRange values;
      try {

        //to calculate column headers row
        String[] rangeLimits = importConfig.getCellsRange().split(":");
        Matcher m = digitAppearenceRegex.matcher(rangeLimits[0]);
        if ( !m.find() ) return null;
        int indexOfFirstRowInRange = m.start();
        String startColumn = rangeLimits[0].substring(0, indexOfFirstRowInRange);
        String startRow = rangeLimits[0].substring(indexOfFirstRowInRange);
        m = digitAppearenceRegex.matcher(rangeLimits[1]);
        if ( !m.find() ) return null;
        String endColumn = rangeLimits[1].substring(0, m.start());
        StringBuilder sb = new StringBuilder();
        sb.append(startColumn);
        sb.append(startRow);
        sb.append(":");
        sb.append(endColumn);
        sb.append(startRow);

        values = googleSheetsAPIEnabler.getValues(x, importConfig.getGoogleSpreadsheetId(), sb.toString());
        List<Object> firstRow = values.getValues().get(0);
        String[] columnNames = new String[firstRow.size()];
        for ( int i = 0 ; i < firstRow.size() ; i++ ) {
          columnNames[i] = String.valueOf(firstRow.get(i));
        }
        return columnNames; 
      } catch( Throwable t ) {
      }
      return null;
      `
    }
  ]
});