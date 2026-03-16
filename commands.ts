import type {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import call from "./commands/call.ts";
import confirm from "./commands/confirm.ts";
import echo from "./commands/echo.ts";
import evalCommand from "./commands/eval.ts";
import forCommand from "./commands/for.ts";
import funcDelete from "./commands/func/delete.ts";
import funcJs from "./commands/func/defineJs.ts";
import funcLlm from "./commands/func/defineLLM.ts";
import funcStatic from "./commands/func/defineExpression.ts";
import funcsClear from "./commands/func/clear.ts";
import funcsList from "./commands/func/list.ts";
import funcsShow from "./commands/func/show.ts";
import ifCommand from "./commands/if.ts";
import list from "./commands/list.ts";
import lists from "./commands/lists.ts";
import prompt from "./commands/prompt.ts";
import scriptInfo from "./commands/script/info.ts";
import scriptList from "./commands/script/list.ts";
import scriptRun from "./commands/script/run.ts";
import sleep from "./commands/sleep.ts";
import varDelete from "./commands/var/delete.ts";
import varCommand from "./commands/var/set.ts";
import varsClear from "./commands/vars/clear.ts";
import vars from "./commands/vars/list.ts";
import varsShow from "./commands/vars/show.ts";
import whileCommand from "./commands/while.ts";

export default [
  scriptList,
  scriptRun,
  scriptInfo,
  varCommand,
  varDelete,
  funcStatic,
  funcLlm,
  funcJs,
  funcDelete,
  vars,
  varsShow,
  varsClear,
  funcsList,
  funcsShow,
  funcsClear,
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
] as const satisfies readonly TokenRingAgentCommand<any>[];
