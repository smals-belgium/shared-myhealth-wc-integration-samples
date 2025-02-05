const fs = require('node:fs/promises')
const versionFile = 'src/version.ts'

async function main() {
  const version = JSON.parse( (await fs.readFile('../package.json')).toString() ).version

  const content = `export const version = '${version}'`
  await fs.writeFile(versionFile, content)

  const pkgJson = JSON.parse( (await fs.readFile('package.json')).toString() )
  pkgJson.version = version
  await fs.writeFile('package.json', JSON.stringify(pkgJson, null,2))
}

main()
