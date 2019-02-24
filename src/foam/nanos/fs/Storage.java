package foam.nanos.fs;

import foam.util.SafetyUtil;

import java.io.*;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.*;
import java.util.zip.*;
import java.util.regex.*;

public class Storage {
  private java.io.File root_;

  private boolean isResource_ = false;
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

  public Storage (String root, boolean isResource) {
    isResource_ = isResource;
    resourceDir_ = root;
  }

  public boolean isResource() {
    return isResource_;
  }
  
  public java.io.File get(String name) {
    return new java.io.File(root_, name).getAbsoluteFile();
  }

  public java.io.InputStream getResourceAsStream(String name) {
    String path = "/" + name;
    if ( ! SafetyUtil.isEmpty(resourceDir_) ) {
      path = "/" + resourceDir_ + path;
    }
    return getClass().getResourceAsStream(path);
  }
}
