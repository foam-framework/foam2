/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.script.jShell;

import java.util.LinkedList;
import java.util.List;

import jdk.jshell.JShell;
import jdk.jshell.SourceCodeAnalysis;

public class InstractionPresentation {
  public JShell jShell;
  List<String>  listInstraction = new LinkedList<String>();

  public InstractionPresentation(JShell jShell) {
    this.jShell = jShell;
  }

  public List<String> parseToInstraction(List<String> scripts) {
    int i = 0;
    String codeToParse = "";
    while ( i < scripts.size() ) {
      codeToParse += scripts.get(i);
      SourceCodeAnalysis.CompletionInfo info = jShell.sourceCodeAnalysis().analyzeCompletion(codeToParse);
      if ( info.completeness().isComplete() ) {
        listInstraction.add(codeToParse);
        codeToParse = "";
      }
      i++;
    }
    return listInstraction;
  }
}