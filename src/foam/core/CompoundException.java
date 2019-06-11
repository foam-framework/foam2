package foam.core;

import java.util.ArrayList;

public class CompoundException extends RuntimeException {
  ArrayList exceptions = new ArrayList<RuntimeException>();
}