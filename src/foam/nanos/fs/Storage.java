package foam.nanos.fs;

public class Storage {
  private java.io.File root_;

  private boolean useResources_ = false;
  private String resourceDir_;

  public Storage() {
    this(new java.io.File(""));
  }

  public Storage(String root) {
    this(new java.io.File(root));
  }

  public Storage(java.io.File root) {
    root_ = root.getAbsoluteFile();
  }

  public Storage (String root, boolean useResources) {
    useResources_ = useResources;
    resourceDir_ = root;
  }

  public java.io.File get(String name) {
    if ( useResources_ ) {
      ClassLoader classLoader = getClass().getClassLoader();
	    return new java.io.File(classLoader.getResource(resourceDir_ + "/" + name).getFile());
    } else {
      return new java.io.File(root_, name).getAbsoluteFile();
    }
  }
}
