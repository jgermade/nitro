#!/usr/bin/env node

const yargs = require('yargs')

const files_cmd = require('./files.cli')

// eslint-disable-next-line no-unused-expressions
yargs
  .wrap(Math.min(yargs.terminalWidth(), 100))

;[
  files_cmd,
].forEach(cli_command => {
  yargs.command(
    cli_command.cmd,
    cli_command.description,
    cli_command.config || (yargs => yargs),
    cli_command.fn,
  )
})

// eslint-disable-next-line no-unused-expressions
yargs
  .help()
  .argv
