import script from "./commands/script.ts";
import varCommand from "./commands/var.ts";
import func from "./commands/func.ts";
import vars from "./commands/vars.ts";
import funcs from "./commands/funcs.ts";
import call from "./commands/call.ts";
import echo from "./commands/echo.ts";
import sleep from "./commands/sleep.ts";
import prompt from "./commands/prompt.ts";
import confirm from "./commands/confirm.ts";
import list from "./commands/list.ts";
import lists from "./commands/lists.ts";
import ifCommand from "./commands/if.ts";
import forCommand from "./commands/for.ts";
import whileCommand from "./commands/while.ts";

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