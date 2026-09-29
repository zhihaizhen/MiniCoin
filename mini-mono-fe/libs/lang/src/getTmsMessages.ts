import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import ts from 'typescript';

type Dependencies = {
  [index: string]: string[];
};

type Options = {
  /**
   * @summary project name, should be the same as the name of .sync file
   * @example 'wsot2022', same as the wsot2022.json in .sync library
   */
  project: string | string[];
  /**
   * @summary The path to the dependency json file
   * @example path.resolve(webpackContext, '../dependencies.json')
   */
  json?: string;
  /**
   * @summary The path to the entry file, normally is the page file
   * @example path.join(webpackContext, 'pages', 'current-page-file.tsx' )
   */
  entry: string | string[];
  /**
   * @summary webpack context path
   * @example path.resolve(__filename, '../..')
   */
  context?: string;
  /**
   * @summary current locale, normally is the language code
   * @example 'en-US'
   */
  locale: string;
  /**
   * @summary put the tms keys not used by fm, such as page title, description
   * @example ['myPageTitle', 'myPageDescription']
   */
  additions?: string[];
};

type ParsedOptions = Options & {
  entry: string[];
};

function getOptions(options: Options): ParsedOptions {
  const { project, json, entry, context, locale } = options;

  // check required fields
  if (!project) {
    throw new Error('project is required');
  }
  if (!locale) {
    throw new Error('locale is required');
  }
  if (!entry || (Array.isArray(entry) && entry.length === 0)) {
    throw new Error('entry is required');
  }
  // check non-required fields, and set default value
  if (!json) {
    console.log('__filename', __filename);
    // console.log('import.meta.url', import.meta.url);
    const defaultJsonPath = [
      path.resolve(__dirname, './dependency-tree.json'),
      path.resolve(__dirname, '../dependency-tree.json'),
      path.resolve(__dirname, '../../dependency-tree.json')
    ];
    options.json = defaultJsonPath.find((p) => fs.existsSync(p)) || '';
  }
  // if (!fs.existsSync(options.json)) {
  //   throw new Error('dependency json file is required');
  // }
  // if (!context) {
  //   const jsonContent = fse.readJsonSync(options.json);
  //   options.context = jsonContent.context;
  // }

  // process the entry to relative path array
  let entries = Array.isArray(options.entry) ? options.entry : [options.entry];
  entries = entries.map((entry) =>
    toRelativePath(entry, options.context || '')
  );
  return { ...options, entry: entries };
}

/**
 * 逻辑步骤
 * 1. 获取项目的dependency-tree.json
 * 2. 根据entry，通过dependency-tree.json获取该entry下所有的dependencyFiles （深度遍历）
 * 3. 通过对应的dependencyFile，生成ast，然后递归遍历ast中所有含有fm的callExpression名，生成所有的tmsKey
 * 4. 读取该项目的对应语言的tms文件
 * 5. 遍历tmsKey，依次取出key和tms文件中的key进行校验，如果相等，则取出，不相等写入告警
 * 最后返回 根据tmsKey获得对应的tms内容文件
 * @param opts
 * @returns
 */
export const getTmsMessages = async (
  opts: Options /* , writePrefix = '' */
) => {
  // 1.
  const options = getOptions(opts);
  // const { dependencies = {} } = fse.readJsonSync(options.json);

  // 2.
  // const dependencyFiles = new Set<string>();
  // console.log(options.entry, 'options.entry');
  // options.entry.forEach((entry) =>
  //   getAllDependencies(dependencies, entry, dependencyFiles)
  // );

  // console.log('dependencyFiles', dependencyFiles);

  // if (writePrefix) {
  //   dependencyFiles.forEach((file) => {
  //     writeTmsPrefix(path.resolve(options.context, file), writePrefix);
  //   });
  // }

  const tmsKeys = new Set<string>(options.additions);

  // 3.
  // dependencyFiles.forEach((file) => {
  //   const absPath = path.resolve(options.context, file);
  //   getAllTmsKey(absPath, tmsKeys);
  // });

  // 4.
  const translations = await loadTranslationFileContent(
    options.project,
    options.locale
  );
  // 5.
  const messages: Record<string, string> = {};
  const missedMessages = new Set();
  tmsKeys.forEach((key) => {
    if (!translations[key]) {
      missedMessages.add(key);
    }
    messages[key] = translations[key] || '$:' + key;
  });
  // console.log('messages', messages);
  console.error(`missed messages: `, Array.from(missedMessages));
  const finalMessages = { ...messages, ...translations };
  return finalMessages;
};

/**
 * 深度遍历，把从上到下依赖的文件，一个个加载到result内
 * @param dependencies
 * @param entry
 * @param result
 * @returns
 */
function getAllDependencies(
  dependencies: Dependencies,
  entry: string,
  result: Set<string>
) {
  result.add(entry);

  if (!dependencies[entry]) return;

  const deps = dependencies[entry];
  deps.forEach((dep) => {
    if (!result.has(dep)) {
      getAllDependencies(dependencies, dep, result);
    }
  });
}

function toRelativePath(absPath: string, context: string) {
  if (!(path.isAbsolute(absPath) || /^file:/.test(absPath))) {
    return absPath;
  }

  absPath = fileProtocolToPath(absPath);
  const relativePath = path.relative(context, absPath);
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

export function fileProtocolToPath(url: string) {
  url = url.replace(/^file:\/\//, '');
  return path.resolve(url);
}

/**
 * 1. 根据文件生成对应的ast
 * 2. 递归遍历ast中的fm, 获取callExpression
 * @param file
 * @param result
 */
function getAllTmsKey(file: string, result: Set<string>) {
  const rootNode = getTsAst(file);
  rootNode.getChildren().forEach((node) => recursiveGetFmNode(node, result));
}

function getTsAst(file: string): ts.SourceFile {
  const content = fs.readFileSync(file, 'utf8');
  const node = ts.createSourceFile(
    'code.tsx',
    content,
    ts.ScriptTarget.Latest,
    true
  );

  return node;
}

function recursiveGetFmNode(node: ts.Node, result: Set<string>) {
  if (node.kind === ts.SyntaxKind.CallExpression) {
    const callExpression = node as ts.CallExpression;

    if (callExpression.expression.getText() === 'fm') {
      let text = callExpression.arguments[0].getText();
      text = text.replace(/'/g, '');
      result.add(text);
    }
  }
  node.getChildren().forEach((n) => recursiveGetFmNode(n, result));
}

async function loadTranslationFileContent(project: any, locale: string) {
  let res;
  if (Array.isArray(project)) {
    const asyncImportList = project.map((name) => {
      return (async () => import(`../.sync/${locale}/${name}.json`))();
    });
    const contentList = await Promise.all(asyncImportList);
    for (const content of contentList) {
      res = {
        ...res,
        ...content
      };
    }
  } else {
    res = await import(`../.sync/${locale}/${project}.json`);
  }
  return res;
}

// function writeTmsPrefix(filePath: string, prefix: string) {
//   let content = fse.readFileSync(filePath, 'utf8');
//   const reg = /fm\('([a-zA-Z\d_-]+)'/g;
//   content = content.replace(reg, (p1, p2) => {
//     const s =
//       p2.startsWith('common') || p2.startsWith(prefix)
//         ? p2
//         : prefix + p2.charAt(0).toUpperCase() + p2.slice(1);
//     console.log(p2, s);
//     return "fm('" + s + "'";
//   });

//   fse.writeFileSync(filePath, content);
// }
