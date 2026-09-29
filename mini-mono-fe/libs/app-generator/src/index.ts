const {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree
} = require('@nrwl/devkit');
const path = require('path');
const { AppGeneratorGeneratorSchema } = require('./schema');

interface NormalizedSchema extends AppGeneratorGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  // parsedTags: string[];
}

function normalizeOptions(
  tree: typeof Tree,
  options: AppGeneratorGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  // const parsedTags = options.tags
  //   ? options.tags.split(',').map((s) => s.trim())
  //   : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory
    // parsedTags
  };
}

function addFiles(tree: typeof Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    projectPath: options.projectName,
    template: ''
  };

  const templatePath = path.join(__dirname, '../../../tools/template/nextjs');
  console.log('templatePath: ' + templatePath);
  generateFiles(tree, templatePath, options.projectRoot, templateOptions);
}

module.exports = {
  default: async function (
    tree: typeof Tree,
    options: AppGeneratorGeneratorSchema
  ) {
    const normalizedOptions = normalizeOptions(tree, options);
    console.log(normalizedOptions);
    addProjectConfiguration(tree, normalizedOptions.projectName, {
      root: normalizedOptions.projectRoot,
      projectType: 'application',
      sourceRoot: `${normalizedOptions.projectRoot}/src`,
      targets: {
        build: {
          executor: '@better-bit-fe/app-generator:build'
        }
      }
      // tags: normalizedOptions.parsedTags
    });
    addFiles(tree, normalizedOptions);
    await formatFiles(tree);
  }
};
