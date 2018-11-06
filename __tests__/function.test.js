const execa = require('execa')
const jetpack = require('fs-jetpack')
const tempy = require('tempy')

const IGNITE = 'ignite'
const APP = 'FunctionTest'

// calling the ignite cli takes a while
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000

test('writes the install files for the function template', async () => {
  let dir = tempy.directory()
  process.chdir(dir)
  await execa(IGNITE, ['new', `${APP}`, '-b', 'ignite-base-plate', '--function'])
  process.chdir(APP)
  expect(jetpack.list().includes('src')).toEqual(true)
  expect(jetpack.list().includes('storybook')).toBe(true)
  expect(jetpack.list().includes('.babelrc')).toBe(true)
  expect(jetpack.list().includes('.editorconfig')).toBe(true)
  expect(jetpack.list().includes('.prettierignore')).toBe(true)
  expect(jetpack.list().includes('.prettierrc')).toBe(true)
  expect(jetpack.list().includes('.linguirc')).toBe(true)
  expect(jetpack.list().includes('index.js')).toBe(true)
  expect(jetpack.exists('package.json')).toEqual('file')
  expect(jetpack.exists('yarn.lock')).toEqual('file')
  expect(jetpack.exists('ignite/ignite.json')).toEqual('file')
  expect(jetpack.exists('README.md')).toEqual('file')
  expect(jetpack.read('index.js')).toContain('./src/App/main.js')
  expect(jetpack.exists('./src/App/main.js')).toEqual('file')
  process.chdir('./src')
  expect(jetpack.list().includes('Components')).toBe(true)
  expect(jetpack.list().includes('Mutations')).toBe(true)
  expect(jetpack.list().includes('Queries')).toBe(true)
  expect(jetpack.list().includes('Screens')).toBe(true)        
  expect(jetpack.list().includes('services')).toBe(true)  
})
