package foam.nanos.fs;

public class Storage {
  private java.io.File root_;

  public Storage() {
    this(new java.io.File(""));
  }

  public Storage(String root) {
    this(new java.io.File(root));
  }

  public Storage(java.io.File root) {
    root_ = root.getAbsoluteFile();
  }

  public java.io.File get(String name) {
    return new java.io.File(root_, name).getAbsoluteFile();
  }
}
