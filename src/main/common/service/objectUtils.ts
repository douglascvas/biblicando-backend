export class ObjectUtils {
  public extractClassName(classz) {
    var match = classz.toString().match(/function ([^(]+?)\(/);
    if (!match) {
      throw new Error('The class must specify a name.');
    }
    return match[1].trim();
  }

  public extractArgs(classz) {
    var match = classz.toString().match(/\(([^)]*)\)/);
    if (!match) {
      throw new Error('The class must specify the arguments.');
    }
    return match[1]
      .split(',')
      .map(name => name.trim()).filter(name => name);
  }

  /**
   * Make sure the first char is lower case.
   */
  public toInstanceName(name) {
    return name.replace(/^./, name[0].toLowerCase());
  }
}