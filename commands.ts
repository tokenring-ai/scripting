import type {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import call from "./commands/call.ts";
import confirm from "./commands/confirm.ts";
import echo from "./commands/echo.ts";
import evalCommand from "./commands/eval.ts";
import forCommand from "./commands/for.ts";
import func from "./commands/func.ts";
import funcs from "./commands/funcs.ts";
import ifCommand from "./commands/if.ts";
import list from "./commands/list.ts";
import lists from "./commands/lists.ts";
import prompt from "./commands/prompt.ts";
import script from "./commands/script.ts";
import sleep from "./commands/sleep.ts";
import varCommand from "./commands/var.ts";
import vars from "./commands/vars.ts";
import whileCommand from "./commands/while.ts";

export default [
  script,
  varCommand,
  func,
  vars,
  funcs,
  call,
  echo,
  sleep,
  prompt,
  confirm,
  list,
  lists,
  ifCommand,
  forCommand,
  whileCommand,
  evalCommand,
] satisfies TokenRingAgentCommand[];