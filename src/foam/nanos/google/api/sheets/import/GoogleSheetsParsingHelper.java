package foam.nanos.google.api.sheets;

import java.util.ArrayList;
import java.util.List;

public class GoogleSheetsParsingHelper {
  public static List<String> alphabet = java.util.Arrays.asList(new String[] {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"});

  // this method generates all posible column names ( A, B, ... , AA, AB, ..)
  // this column names are located in base depending on its length
  // eg column names A-Z in generateBase(endColumnLength).get(0)
  // AA-ZZ generateBase(endColumnLength).get(1)
  // length of end column let us know how many "base rows" should be generated
  // for endColumnLength = 2 we would generate A - ZZ column names
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

  // this method is used to return Google Sheets Column "Header" for column which is startColCurrColDiff away from startCol Google Sheets Name
  // eg base = A-Z, startCol = "A", startColCurrColDiff = 3
  // result would be "D"
  public static String findColumnNameStartingWithStartColumn(List<List<String>> base, String startCol, int startColCurrColDiff) {
    int startColIndex = base.get(startCol.length() - 1).indexOf(startCol);
    int currColumnIndex = startColIndex + startColCurrColDiff;
    if ( currColumnIndex > base.get(startCol.length() - 1).size() ) {
      return base.get(startCol.length()).get(currColumnIndex - base.get(startCol.length() - 1).size() - 1);
    }
    return base.get(startCol.length() - 1).get(currColumnIndex);
  }   
}