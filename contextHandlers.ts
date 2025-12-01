import {ContextHandler} from "@tokenring-ai/chat/types";
import {default as availableScripts} from "./contextHandlers/availableScripts.ts";

export default {
  'available-scripts': availableScripts,
} as Record<string, ContextHandler>;
