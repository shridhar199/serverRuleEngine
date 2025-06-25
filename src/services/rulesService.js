import { v4 as uuidv4 } from "uuid";
import { RulesDao } from "../dao/rulesDao.js";
import { transformRulesToJsonRulesFormat } from "../utils/transformingRules.js";

export class RulesService {
  constructor(supabase) {
    this.rulesDao = new RulesDao(supabase);
  }

  async getAllRules() {
    try {
      const rules = await this.rulesDao.getAllRules();
      return rules;
    } catch (error) {
      console.error("Error in RulesService.getAllRules:", error);
      throw new Error("Failed to fetch rules from database");
    }
  }

  async getRuleById(id) {
    try {
      if (!id) {
        throw new Error("Rule ID is required");
      }

      const rule = await this.rulesDao.getRuleById(id);
      if (!rule) {
        throw new Error("Rule not found");
      }

      return rule;
    } catch (error) {
      console.error("Error in RulesService.getRuleById:", error);
      throw error;
    }
  }

  async getAllRulesInJsonFormat() {
    try {
      const rules = await this.getAllRules();
      console.log("inside get all RulesIn Json", rules);
      const transformedRules = await transformRulesToJsonRulesFormat(rules);
      return transformedRules;
    } catch (error) {
      console.error("Error in RulesService.getAllRulesInJsonFormat:", error);
      throw new Error("Failed to transform rules to JSON format");
    }
  }

  async getActiveRules() {
    try {
      const rules = await this.getAllRules();
      return rules.filter((rule) => rule.active);
    } catch (error) {
      console.error("Error in RulesService.getActiveRules:", error);
      throw new Error("Failed to fetch active rules");
    }
  }

  async createRule(ruleData) {
    try {
      // Validate required fields
      const { name, conditions, events } = ruleData;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error("Rule name is required and must be a non-empty string");
      }

      if (!Array.isArray(conditions) || conditions.length === 0) {
        throw new Error("Conditions must be a non-empty array");
      }

      if (!Array.isArray(events) || events.length === 0) {
        throw new Error("Events must be a non-empty array");
      }

      // Validate conditions structure
      for (const condition of conditions) {
        if (!condition.key || !condition.fact || !condition.operator) {
          throw new Error("Each condition must have key, fact, and operator");
        }
      }

      // Validate events structure
      for (const event of events) {
        if (!event.type) {
          throw new Error("Each event must have a type");
        }
      }

      // Set default active status if not provided
      const processedRuleData = {
        name: name.trim(),
        active: ruleData.active !== undefined ? ruleData.active : true,
        conditions,
        events,
      };

      // Create the rule via DAO
      const ruleSetId = await this.rulesDao.createRule(processedRuleData);

      // Return the created rule details
      return {
        id: ruleSetId,
        name: processedRuleData.name,
        active: processedRuleData.active,
        message: "Rule created successfully",
      };
    } catch (error) {
      console.error("Error in RulesService.createRule:", error);
      throw error;
    }
  }

  async getRuleByName(name) {
    try {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error("Rule name is required");
      }

      const rule = await this.rulesDao.getRuleByName(name.trim());
      if (!rule) {
        throw new Error("Rule not found");
      }

      return rule;
    } catch (error) {
      console.error("Error in RulesService.getRuleByName:", error);
      throw error;
    }
  }

  async updateRuleByName(name, updateData) {
    try {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error("Rule name is required");
      }

      // Validate update data structure if provided
      if (updateData.conditions !== undefined) {
        if (!Array.isArray(updateData.conditions)) {
          throw new Error("Conditions must be an array");
        }

        for (const condition of updateData.conditions) {
          if (!condition.id) {
            throw new Error("Each condition must have id");
          }
        }
      }

      if (updateData.events !== undefined) {
        if (!Array.isArray(updateData.events)) {
          throw new Error("Events must be an array");
        }

        for (const event of updateData.events) {
          if (!event.id) {
            throw new Error("Each event must have a id");
          }
        }
      }

      if (
        updateData.active !== undefined &&
        typeof updateData.active !== "boolean"
      ) {
        throw new Error("Active field must be a boolean");
      }

      // Update via DAO
      const ruleSetId = await this.rulesDao.updateRuleByName(
        name.trim(),
        updateData
      );

      return {
        id: ruleSetId,
        message: "Rule updated successfully",
      };
    } catch (error) {
      console.error("Error in RulesService.updateRuleByName:", error);
      throw error;
    }
  }

  async deleteRuleByName(name) {
    try {
      if (!name || typeof name !== "string") {
        throw new Error("Rule name is required and must be a string");
      }

      return await this.rulesDao.deleteRuleByName(name);
    } catch (error) {
      console.error("Error in RulesService.deleteRuleByName:", error);
      throw error;
    }
  }
}
