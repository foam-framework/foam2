package foam.nanos.google.api.sheets;

import java.util.ArrayList;
import java.util.List;

public class GoogleSheetsParsingHelper {
  public static List<String> alphabet = java.util.Arrays.asList(new String[] {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"});
  public static int findAndValidateIndexOfColumnInArrayOfValues (List<List<String>> base, int startColumnIndex, int endColumnIndex, String col) {
    int colIndex = findColumnIndex(col, base);
    return colIndex > endColumnIndex ?  -1 : colIndex < startColumnIndex ? -1 : colIndex;
  }      

  public static int findColumnIndex(String col, List<List<String>> base) {

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
  
  public static List<List<String>> generateBase(int endColumnLength) {

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

  public static String findColumn(List<List<String>> base, String startCol, int startColCurrColDiff) {
    int startColIndex = base.get(startCol.length() - 1).indexOf(startCol);
    int currColumnIndex = startColIndex + startColCurrColDiff;
    if ( currColumnIndex > base.get(startCol.length() - 1).size() ) {
      return base.get(startCol.length()).get(currColumnIndex - base.get(startCol.length() - 1).size() - 1);
    }
    return base.get(startCol.length() - 1).get(currColumnIndex);
  }   
}