#!/usr/bin/env node
import "reflect-metadata";
import yargs from "yargs";
import {WriteApiClientCommand} from "./commands/WriteApiClientCommand";
import {WriteTypeOrmConfigCommand} from "./commands/WriteTypeOrmConfigCommand";

void yargs
    .usage("Usage: $0 <command> [options]")
    .command(new WriteTypeOrmConfigCommand())
    .command(new WriteApiClientCommand())
    .recommendCommands()
    .demandCommand(1)
    .strict()
    .alias("v", "version")
    .help("h")
    .alias("h", "help").argv;
