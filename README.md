# eta-compiler
Simple eta embedded JS template engine compiler with `--watch` support

## Installation
`npm i eta-compiler -g`

## Features
- watch support
- fast, only compile changed files

## Example
`eta-compiler --input=src/eta --data=src/eta/data.json --output=dist/html`

`eta-compiler --input=src/eta --data=src/eta/data.json --output=dist/html --watch`

`eta-compiler --input=src/html --ext=html --data=src/eta/data.json --output=dist/html`

## Options
- `--input=[dir]`       Input directory
- `--ext=[ext]`         Input extension, default: `eta`
- `--data=[file.json]`  Data file
- `--output=[dir]`      Output directory
- `--watch`             Enable watch

## Notes
- Use [_filename.ext] for partial or layout file
