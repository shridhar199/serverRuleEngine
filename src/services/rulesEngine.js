import { Engine } from "json-rules-engine";
import {
  fetchRulesData,
  transformRulesToJsonRulesFormat
} from "../utils/transformingRules.js";

class RulesEngine {
  constructor() {
    this.engine = new Engine();
  }

  // Add rules from your database
  async loadRulesFromDatabase(supabase) {
    try {
      const rules = await fetchRulesData(supabase);
      const transformedRules = transformRulesToJsonRulesFormat(rules);
      transformedRules.forEach((rule) => this.engine.addRule(rule));
    } catch (err) {
      console.error("Error loading rules:", err);
    }
  }

  // Evaluate facts against rules
  async evaluate(facts) {
    try {
      const { events } = await this.engine.run(facts);
      return events;
    } catch (err) {
      console.error("Error evaluating rules:", err);
      return [];
    }
  }
}

export default new RulesEngine();
