import {default as script} from "./commands/script.ts";
import {default as varCommand} from "./commands/var.ts";
import {default as func} from "./commands/func.ts";
import {default as vars} from "./commands/vars.ts";
import {default as funcs} from "./commands/funcs.ts";
import {default as call} from "./commands/call.ts";
import {default as echo} from "./commands/echo.ts";
import {default as sleep} from "./commands/sleep.ts";
import {default as prompt} from "./commands/prompt.ts";
import {default as confirm} from "./commands/confirm.ts";
import {default as list} from "./commands/list.ts";
import {default as lists} from "./commands/lists.ts";
import {default as ifCommand} from "./commands/if.ts";
import {default as forCommand} from "./commands/for.ts";
import {default as whileCommand} from "./commands/while.ts";

export default {
  script,
  var: varCommand,
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
  if: ifCommand,
  for: forCommand,
  while: whileCommand,
};