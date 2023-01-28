#!/usr/bin/env node
import "reflect-metadata";
import yargs from "yargs";
import {WriteTypeOrmConfigCommand} from "./commands/WriteTypeOrmConfigCommand";

void yargs
    .usage("Usage: $0 <command> [options]")
    .command(new WriteTypeOrmConfigCommand())
    .recommendCommands()
    .demandCommand(1)
    .strict()
    .alias("v", "version")
    .help("h")
    .alias("h", "help").argv;
