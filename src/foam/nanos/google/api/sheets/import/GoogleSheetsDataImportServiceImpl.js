foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetsDataImportServiceImpl',
  implements: [
    'foam.nanos.google.api.sheets.GoogleSheetsDataImportService'
  ],
  javaImports: [
    'com.google.api.services.sheets.v4.model.ValueRange',

    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.AbstractEnumPropertyInfo',

    'java.lang.Throwable',
    'java.math.BigDecimal',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.regex.Matcher',
    'java.util.regex.Pattern',

    'foam.dao.DAO',
    'foam.nanos.boot.NSpec', 

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.CONTAINS_IC',
    'static foam.mlang.MLang.EQ'
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        //move all this to helper class
        cls.extras.push(foam.java.Code.create({
          data: `
          public static Pattern digitAppearenceRegex = Pattern.compile("(\\\\d){1}");
          public static Pattern numbersRegex = Pattern.compile("\\\\d+(\\\\.\\\\d{1,2})?");
          public static Pattern alphabeticalCharsRegex = Pattern.compile("[a-zA-Z]{1,}");

          public static List<String> alphabet = java.util.Arrays.asList(new String[] {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"});
          //so to calculate column in index that you need
          // eg "A", "CA", "B"
          public int findAndValidateIndexOfColumnInArrayOfValues (List<List<String>> base, int startColumnIndex, int endColumnIndex, String col) {
            int colIndex = findColumnIndex(col, base);
            return colIndex > endColumnIndex ?  -1 : colIndex < startColumnIndex ? -1 : colIndex;
          }      
          // public int[] generateColumnRange(String startColumn, String endColumn, List<List<String>> base) {
      
          // // List<List<String>> base = generateBase(endColumn.length());
          //   return new int[] { findColumnIndex(startColumn, base), findColumnIndex(endColumn, base) };
          // }

          //index which is length of column "name"/"title"
          public int findColumnIndex(String col, List<List<String>> base) {
      
            // List<List<String>> base = generateBase(endColumn.length());
            int i = 0;
            int preIndex = 0;
            while ( i < col.length() - 1 ) {
              preIndex = base.get(i).size();
              i++;
            }
            int startIndex = preIndex + base.get(col.length() - 1).indexOf(col);
            return startIndex;
          }
          
          
          public List<List<String>> generateBase(int endColumnLength) {
      
            List<List<String>> base = new ArrayList<>();
      
            List<String> level = new ArrayList<>();
            for ( int i = 0 ; i < alphabet.size() ; i++ ) {
              level.add(alphabet.get(i));
            }
            base.add(level);
      
            while ( base.size() != endColumnLength ) {
              level = new ArrayList<>();
              for ( int i = 0 ; i < base.get(base.size() - 1).size() ; i++ ) {
                for ( int j = 0 ; j < alphabet.size() ; j++ ) {
                  level.add(base.get(base.size() - 1).get(i) + alphabet.get(j));
                }
              }
              base.add(level);
            }
            return base;
          }
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
        System.out.println(t);
      }
      return null;
      `
    },
    {
      name: 'importData',
      type: 'Boolean',
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
      javaCode: `
        GoogleSheetsApiService googleSheetsAPIEnabler = (GoogleSheetsApiService)x.get("googleSheetsDataExport");
        ValueRange values;
        try {
          values = googleSheetsAPIEnabler.getValues(x, importConfig.getGoogleSpreadsheetId(), importConfig.getCellsRange());
          List<List<Object>> data = values.getValues();
          List<String> columnHeaders = new ArrayList<>();

          for ( int i = 0 ; i <  data.get(0).size() ; i++ ) {
            columnHeaders.add(data.get(0).get(i).toString());
          }

          List<FObject> objs = new ArrayList<>();
    
          for ( int i = 1 ; i < data.size() ; i++ ) {
            Object obj = importConfig.getImportClassInfo().newInstance();
            for ( int j = 0 ; j < importConfig.getColumnHeaderPropertyMappings().length ; j ++ ) {
              if ( importConfig.getColumnHeaderPropertyMappings()[j].getProp() == null ) continue;
              int columnIndex = columnHeaders.indexOf(importConfig.getColumnHeaderPropertyMappings()[j].getColumnHeader());
              Object val = data.get(i).get(columnIndex);
              PropertyInfo prop = ((PropertyInfo)importConfig.getColumnHeaderPropertyMappings()[j].getProp());
              switch (prop.getValueClass().getName()) {
                case "long":
                  if ( prop.getName().equals("amount") ) {
                    String finVal = data.get(i).get(columnIndex).toString();
                    Matcher numMatcher = numbersRegex.matcher(finVal);
                    Matcher currencyMatcher = alphabeticalCharsRegex.matcher(finVal);
                    if ( ! numMatcher.find() ) {
                      continue;
                    }
                    String number = finVal.substring(numMatcher.start(), numMatcher.end());
                    currencyMatcher.find();
                    String currency = finVal.substring(currencyMatcher.start(), currencyMatcher.end());
                    prop.set(obj, Math.round( Double.parseDouble(number) * 100));
                    obj.getClass().getMethod("setSourceCurrency", String.class).invoke(obj, currency);
                  } else prop.set(obj, Long.parseLong(data.get(i).get(columnIndex).toString()));
                  break;
                case "double":
                  prop.set(obj, Double.parseDouble(data.get(i).get(columnIndex).toString()));
                  break;
                default:
                  if ( prop instanceof AbstractEnumPropertyInfo)
                    prop.set(obj, ((AbstractEnumPropertyInfo)prop).getValueClass().getMethod("forLabel", String.class).invoke(null, data.get(i).get(columnIndex).toString()));
                  else if ( prop.getValueClass().getName().equals("java.util.Date") ) {
                    prop.set(obj, new java.util.Date(data.get(i).get(columnIndex).toString()));
                  }
                  else
                    prop.set(obj, data.get(i).get(columnIndex));
                  break;
              }
            }
            objs.add((FObject)obj);
          }

          DAO nspecDAO = (DAO) x.get("nSpecDAO");
          NSpec nsp = (NSpec) nspecDAO.find(AND(CONTAINS_IC(NSpec.ID, "DAO"), CONTAINS_IC(NSpec.CLIENT, importConfig.getImportClassInfo().getId())));
          if ( nsp == null ) return false;
          DAO dao  = (DAO)x.get(nsp.getId());
          for ( FObject obj: objs) {
            dao.put(obj);
          }
        } catch(Exception e) {
          System.out.println(e);
          return false;
        }
        return true;
      `
  }
  ]
});