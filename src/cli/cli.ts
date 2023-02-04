#!/usr/bin/env node
import "reflect-metadata";
import * as yargs from "yargs";
import {WriteApiClientCommand} from "./commands/WriteApiClientCommand";

void yargs
    .usage("Usage: $0 <command> [options]")
    .command(new WriteApiClientCommand())
    .recommendCommands()
    .demandCommand(1)
    .strict()
    .alias("v", "version")
    .help("h")
    .alias("h", "help").argv;
