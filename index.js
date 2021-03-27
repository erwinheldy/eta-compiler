#!/usr/bin/env node

const fs = require('fs-extra')
const eta = require('eta')
const log = console.log.bind(console)
const chokidar = require('chokidar')
const { resolve, basename } = require('path')

eta.configure({
  varName: 'data',
})

class compiler {

  constructor() {
    this.input = this.argv('input')
    this.inputExt = this.argv('ext') || 'eta'
    this.data = resolve(this.argv('data'))
    this.output = this.argv('output')
    this.watch = this.argv('watch')
  }

  async run() {
    if (this.watch) {
      chokidar.watch(this.input, { ignoreInitial: true })
        .on('add', async target => await this.renderTarget(target))
        .on('change', async target => await this.renderTarget(target))
        .on('unlink', async () => await this.renderAll())
        .on('ready', () => log('Waiting for file changes...'))
    }
    else {
      await this.renderAll()
    }
  }

  argv(key) {
    const arg = process.argv.filter(val => val.startsWith('--' + key))
    return arg.length ? arg.pop().split('=').pop() : null
  }

  getFiles() {
    let files = []
    fs.readdirSync(this.input).map(file => {
      if (file.endsWith('.' + this.inputExt) && !file.startsWith('_')) { // ignore partial
        files.push(file)
      }
    })
    return files
  }

  async render(file) {
    const fullPath = resolve(this.input, file)
    if (fs.readFileSync(fullPath, 'utf-8').trim() != '') {
      fs.readJSON(this.data, async (err, data) => {
        if (err) log(err)
        const html = await eta.renderFile(fullPath, data)
        fs.outputFileSync(resolve(this.output, file.replace('.' + this.inputExt, '.html')), html)
      })
    }
  }

  async renderAll() {
    log('\nProcessing html...'); console.time('Finished')

    fs.emptyDirSync(this.output)
    await Promise.all(this.getFiles().map(file => this.render(file)))

    console.timeEnd('Finished')
  }

  async renderPartial(target) {
    const partial = target.replace('.eta', '')
    this.getFiles().forEach(async file => {
      const content = (await fs.readFile(resolve(this.input, file))).toString()
      if (content.includes(partial + "'") || content.includes(partial + '"')) {
        await this.render(file)
      }
    })
  }

  async renderTarget(e) {
    const target = resolve(e)
    if (target === this.data) {
      await this.renderAll()
    }
    else {
      log('\nProcessing html...'); console.time('Finished')

      const file = basename(target)

      if (file.startsWith('_')) {
        await this.renderPartial(file)
      }
      else {
        await this.render(file)
      }
      console.timeEnd('Finished')
    }
  }

}

(async function () {
  await new compiler().run()
})()