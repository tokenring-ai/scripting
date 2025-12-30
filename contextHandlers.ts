import {ContextHandler} from "@tokenring-ai/chat/schema";
import availableScripts from "./contextHandlers/availableScripts.ts";

export default {
  'available-scripts': availableScripts,
} as Record<string, ContextHandler>;
