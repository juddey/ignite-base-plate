const options = require('./options')
const { merge, pipe, assoc, omit, __ } = require('ramda')
const { getReactNativeVersion } = require('./lib/react-native-version')

/**
 * Is Android installed?
 *
 * $ANDROID_HOME/tools folder has to exist.
 *
 * @param {*} context - The gluegun context.
 * @returns {boolean}
 */
const isAndroidInstalled = function (context) {
  const androidHome = process.env['ANDROID_HOME']
  const hasAndroidEnv = !context.strings.isBlank(androidHome)
  const hasAndroid = hasAndroidEnv && context.filesystem.exists(`${androidHome}/tools`) === 'dir'

  return Boolean(hasAndroid)
}

/**
 * Let's install.
 *
 * @param {any} context - The gluegun context.
 */
async function install (context) {
  const {
    filesystem,
    parameters,
    ignite,
    reactNative,
    print,
    system,
    prompt,
    template
  } = context
  const { colors } = print
  const { red, gray, blue, bold, cyan, yellow } = colors

  const perfStart = (new Date()).getTime()

  // --feature, --function, interactive
  let answers

  if (parameters.options.min) {
    answers = options.answers.min
  } else if (parameters.options.max) {
    answers = options.answers.max
  } else {
    answers = await prompt.ask(options.questions)
  }

  const name = parameters.third
  const spinner = print
    .spin(`using the ignite ${cyan('magic')} base`)
    .succeed()

  const features = answers['dir-structure'] === 'feature'
  const pathToMainJs = features ? './src/app/' : '/App/Containers/'
  const componentpath = features ? './src/views/' : '/App/Components/'
  const appdir = features ? './src/' : './App/'
  const linter = answers['linter']
  const storybooks = answers['storybooks']
  const ii18n = answers['i18n']

  // attempt to install React Native or die trying
  const rnInstall = await reactNative.install({
    name,
    version: getReactNativeVersion(context)
  })
  if (rnInstall.exitCode > 0) process.exit(rnInstall.exitCode)

  // remove the __tests__ directory and App.js that come with React Native
  filesystem.remove('__tests__')
  filesystem.remove('App.js')

  // create skeleton directory structure & move files
  if (answers['dir-structure'] === 'feature') {
    filesystem.copy(`${__dirname}/boilerplate/feature`, `${process.cwd()}/`, {
      overwrite: true,
      matching: '!*.ejs'
    })
  }

  if (answers['dir-structure'] === 'function') {
    filesystem.copy(`${__dirname}/boilerplate/function`, `${process.cwd()}/`, {
      overwrite: true,
      matching: '!*.ejs'
    })
  }

  // Copy Internationalisation Config
  if (ii18n) {
    filesystem.copy(`${__dirname}/boilerplate/common/i18n`, `${appdir}/i18n`, {
      overwrite: true
    })
  }

  // generate templates
  spinner.text = '▸ generating files'
  spinner.start()

  // common
  let templates = [
    { template: 'index.js.ejs', target: 'index.js' },
    { template: 'README.md', target: 'README.md' },
    { template: 'ignite.json.ejs', target: 'ignite/ignite.json' },
    { template: '.editorconfig', target: '.editorconfig' },
    { template: '.babelrc', target: '.babelrc' },
    { template: 'main/main.js.ejs', target: `${pathToMainJs}/main.js` },
    { template: 'main/root-component.js.ejs', target: `${pathToMainJs}/root-component.js` },
    { template: '.env', target: '.env' }
  ]

  // add storybooks
  if (storybooks) {
    templates.push(
      { template: 'storybook/index.ejs', target: 'storybook/index.js' },
      { template: 'storybook/storybook-registry.ejs', target: 'storybook/storybook-registry.js' })
  }

  if (linter) {
    templates.push({ template: '.prettierrc', target: '.prettierrc' },
      { template: '.prettierignore', target: '.prettierignore' })
  }

  const templateProps = {
    name,
    igniteVersion: ignite.version,
    reactNativeVersion: rnInstall.version,
    mainjs: pathToMainJs + 'main.js',
    pathToMainJs,
    dirstructure: answers['dir-structure'],
    linter: linter,
    storybooks: storybooks,
    i18n: ii18n,
    sourcepath: appdir,
    componentpath: componentpath
  }

  await ignite.copyBatch(context, templates, templateProps, {
    quiet: true,
    directory: `${ignite.ignitePluginPath()}/boilerplate/common`
  })

  spinner.text = 'generated files'
  spinner.stop().succeed()

  // This ones for kevin.
  // https://github.com/facebook/react-native/issues/12724
  filesystem.appendAsync('.gitattributes', '*.bat text eol=crlf')

  // Ignore the .env file.
  filesystem.append('.gitignore', '\n# Misc\n#')
  filesystem.append('.gitignore', '\n.env\n')

  /**
   * Merge the package.json from our template into the one provided from react-native init.
   */
  async function mergePackageJsons () {
    // transform our package.json in case we need to replace variables
    const rawJson = await template.generate({
      directory: `${ignite.ignitePluginPath()}/boilerplate/common`,
      template: 'package.json.ejs',
      props: templateProps
    })
    const newPackageJson = JSON.parse(rawJson)

    // read in the react-native created package.json
    const currentPackage = filesystem.read('package.json', 'json')

    // deep merge, lol
    const newPackage = pipe(
      assoc(
        'dependencies',
        merge(currentPackage.dependencies, newPackageJson.dependencies)
      ),
      assoc(
        'devDependencies',
        merge(currentPackage.devDependencies, newPackageJson.devDependencies)
      ),
      assoc('scripts', merge(currentPackage.scripts, newPackageJson.scripts)),
      merge(
        __,
        omit(['dependencies', 'devDependencies', 'scripts'], newPackageJson)
      )
    )(currentPackage)

    // write this out
    filesystem.write('package.json', newPackage, { jsonIndent: 2 })
  }
  await mergePackageJsons()

  spinner.stop()

  // react native link -- must use spawn & stdio: ignore or it hangs!! :(
  if (ii18n) {
    spinner.text = `▸ linking native libraries`
    spinner.start()
    await system.spawn('react-native link react-native-i18n', { stdio: 'ignore' })
    spinner.stop()
  }

  // pass along the debug flag if we're running in that mode
  const debugFlag = parameters.options.debug ? '--debug' : ''

  try {
    // boilerplate adds itself to get plugin.js/generators etc
    // Could be directory, npm@version, or just npm name.  Default to passed in values
    const boilerplate = parameters.options.b || parameters.options.boilerplate || 'ignite-magic-plate'

    await system.spawn(`ignite add ${boilerplate} ${debugFlag}`, { stdio: 'inherit' })
    // Plugin install can go here.
  } catch (e) {
    ignite.log(e)
    throw e
  }

  if (linter) { await system.spawn(`yarn run lint`) }

  // git config
  const gitExists = await filesystem.exists('./.git')
  if (!gitExists && !parameters.options['skip-git'] && system.which('git')) {
    // initial git
    const spinner = print.spin('configuring git')
    system.run(`git init . && git add . && git commit -m "Initial commit."`)
    spinner.succeed(`configured git`)
  }

  const perfDuration = parseInt(((new Date()).getTime() - perfStart) / 10) / 100
  spinner.succeed(`ignited ${yellow(name)} in ${perfDuration}s`)

  const androidInfo = isAndroidInstalled(context) ? ''
    : `\n\nTo run in Android, make sure you've followed the latest react-native setup instructions at https://facebook.github.io/react-native/docs/getting-started.html before using ignite.\nYou won't be able to run ${bold('react-native run-android')} successfully until you have.`

  const successMessage = `
    ${red('Ignite CLI')} ignited ${yellow(name)} in ${gray(`${perfDuration}s`)}

    To get started:

      cd ${name}
      react-native run-ios
      react-native run-android${androidInfo}
      ignite --help

    ${blue('Need additional help? Join our Slack community at http://community.infinite.red.')}

    ${bold('Now get cooking! 🍽')}
  `

  print.info(successMessage)
}

module.exports = {
  install
}
