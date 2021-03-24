/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.script.jShell;

import java.util.List;

import foam.core.X;
import jdk.jshell.JShell;
import jdk.jshell.SnippetEvent;

/**
 * Evaluate each instruction and return the result 
 *
 */
public class EvalInstruction {
  public JShell jShell;
  List<String>  listInstruction;
  String        result = null;

  public EvalInstruction(JShell jShell, List<String> listInstruction, X x) {
    this.jShell = jShell;
    this.listInstruction = listInstruction;
    this.result = "";
  }

  public String runEvalInstruction() throws Exception {
    for ( int j = 0 ; j < listInstruction.size() ; j++ ) {
      result += evalSingleInstruction(listInstruction.get(j));
    }
    return result;
  }

  private String evalSingleInstruction(String source) throws Exception {
    String output = "";
    for ( SnippetEvent event : jShell.eval(source) ) {
      switch ( event.snippet().subKind() ) {
        case ANNOTATION_TYPE_SUBKIND: // An annotation interface declaration.
        case ASSIGNMENT_SUBKIND: // An assignment expression.
        case CLASS_SUBKIND:
        case ENUM_SUBKIND:
        case INTERFACE_SUBKIND:
        case SINGLE_STATIC_IMPORT_SUBKIND:
        case SINGLE_TYPE_IMPORT_SUBKIND:
        case STATIC_IMPORT_ON_DEMAND_SUBKIND:
        case TYPE_IMPORT_ON_DEMAND_SUBKIND:
        case VAR_DECLARATION_SUBKIND:
        case VAR_VALUE_SUBKIND:
        case METHOD_SUBKIND:
        case STATEMENT_SUBKIND:
        case TEMP_VAR_EXPRESSION_SUBKIND:
        case VAR_DECLARATION_WITH_INITIALIZER_SUBKIND:
          String val = event.value();
          if ( val != null ) output += val + "\n";
          break;
        case OTHER_EXPRESSION_SUBKIND: // An expression which has not been
                                       // wrapped in a temporary variable
                                       // (reserved).
        case UNKNOWN_SUBKIND:
          String message = "Unknown subkind instruction " + source;
          throw new Exception(message);
        default:
          break;
      }
      Exception exc = event.exception();
      if ( exc != null ) {
        exc.printStackTrace();
      }
    }
    return output;
  }
}