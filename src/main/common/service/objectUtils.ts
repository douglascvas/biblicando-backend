'use strict';

export class ObjectUtils {
  public extractClassName(classz:Function):string {
    var asString = classz.toString();
    var match = asString.match(/(?:function|class)[\s]*(\w+).*(\(|\{)/);
    if (!match) {
      console.log('The class must specify a name.', classz);
      return null;
    }
    return match[1];
  }

  public isClass(classz:Function):boolean {
    return classz.toString().indexOf('class') === 0;
  }

  public extractArgs(classz:Function):string[] {
    var regexStr = '\\(([^)]*)\\)';
    if (this.isClass(classz)) {
      regexStr = 'constructor[ ]*' + regexStr;
    }
    var match = classz.toString().match(new RegExp(regexStr));
    if (!match) {
      return [];
    }
    return match[1]
      .split(',')
      .map(name => name.trim()).filter((value:string, index:number, array:string[]) => !!value);
  }

  /**
   * Make sure the first char is lower case.
   */
  public toInstanceName(name) {
    return name.replace(/^./, name[0].toLowerCase());
  }
}