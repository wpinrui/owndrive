import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const resourcesDir = path.join(projectRoot, 'resources')
const iconsDir = path.join(resourcesDir, 'icons')

const ensureCleanDir = () => {
  rmSync(iconsDir, { recursive: true, force: true })
  mkdirSync(iconsDir, { recursive: true })
}

const runIconBuilder = () => {
  execSync('npx electron-icon-builder --input=resources/owndrive-icon.png --output=resources/icons', {
    stdio: 'inherit',
    cwd: projectRoot,
  })
}

const flattenOutput = () => {
  const nestedDir = path.join(iconsDir, 'icons')
  if (!existsSync(nestedDir)) {
    throw new Error(`Expected generated icons at ${nestedDir}, but directory was not found.`)
  }

  const mappings = [
    { src: path.join(nestedDir, 'png'), dest: path.join(iconsDir, 'png') },
    { src: path.join(nestedDir, 'mac'), dest: path.join(iconsDir, 'mac') },
    { src: path.join(nestedDir, 'win'), dest: path.join(iconsDir, 'win') },
  ]

  for (const { src, dest } of mappings) {
    mkdirSync(dest, { recursive: true })
    cpSync(src, dest, { recursive: true })
  }

  rmSync(nestedDir, { recursive: true, force: true })
}

const main = () => {
  console.log('Generating OwnDrive icons...')
  ensureCleanDir()
  runIconBuilder()
  flattenOutput()
  console.log('Icons ready in resources/icons.')
}

main()

