import { v4 as uuidv4 } from "uuid";
import { Engine } from "json-rules-engine";
import {
  transformRulesToJsonRulesFormat,
  fetchRulesData,
} from "../utils/transformingRules.js";
import { RulesService } from "../services/rulesService.js";

export class RulesController {
  static async getAllRules(req, res) {
    try {
      const supabase = req.supabase;
      const rulesService = new RulesService(supabase);

      const transformedRules = await rulesService.getAllRules();

      return res.status(200).json({
        success: true,
        data: transformedRules,
        count: transformedRules.length,
      });
    } catch (error) {
      console.error("Error in RulesController.getAllRules:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to fetch rules",
      });
    }
  }

  static async getAllRulesTransformed(req, res) {
    try {
      const supabase = req.supabase;
      const rulesService = new RulesService(supabase);

      const transformedRules = await rulesService.getAllRulesInJsonFormat();

      return res.status(200).json(transformedRules);
    } catch (error) {
      console.error("Error in RulesController.getAllRulesTransformed:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to fetch rules",
      });
    }
  }

  static async createRule(req, res) {
    try {
      const supabase = req.supabase;
      const rulesService = new RulesService(supabase);

      // Extract data from request body
      const { name, active, conditions, events } = req.body;

      const ruleData = {
        name,
        active,
        conditions,
        events,
      };

      const result = await rulesService.createRule(ruleData);

      return res.status(201).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in RulesController.createRule:", error);

      // Handle validation errors
      if (
        error.message.includes("required") ||
        error.message.includes("must be") ||
        error.message.includes("array")
      ) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to create rule",
      });
    }
  }

  static async getRuleByName(req, res) {
    try {
      const { name } = req.params;
      const supabase = req.supabase;
      const rulesService = new RulesService(supabase);

      const rule = await rulesService.getRuleByName(name);

      return res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      console.error("Error in RulesController.getRuleByName:", error);

      if (error.message === "Rule not found") {
        return res.status(404).json({
          success: false,
          error: "Not found",
          message: "Rule not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to fetch rule",
      });
    }
  }

  static async updateRuleByName(req, res) {
    try {
      const { name } = req.params;
      const supabase = req.supabase;
      const rulesService = new RulesService(supabase);

      // Extract update data from request body
      const updateData = {};

      // Only include fields that are present in the request body
      if (req.body.name !== undefined) {
        updateData.name = req.body.name;
      }
      if (req.body.active !== undefined) {
        updateData.active = req.body.active;
      }
      if (req.body.conditions !== undefined) {
        updateData.conditions = req.body.conditions;
      }
      if (req.body.events !== undefined) {
        updateData.events = req.body.events;
      }

      // Check if any fields are provided for update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          message: "No fields provided for update",
        });
      }

      const result = await rulesService.updateRuleByName(name, updateData);

      return res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in RulesController.updateRuleByName:", error);

      // Handle validation errors
      if (
        error.message.includes("required") ||
        error.message.includes("must be") ||
        error.message.includes("array") ||
        error.message.includes("boolean")
      ) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          message: error.message,
        });
      }

      // Handle not found errors
      if (error.message === "Rule not found") {
        return res.status(404).json({
          success: false,
          error: "Not found",
          message: "Rule not found",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to update rule",
      });
    }
  }

  static async deleteRuleByName(req, res) {
    try {
      const supabase = req.supabase;
      const rulesService = new RulesService(supabase);
      const { name } = req.params;

      const result = await rulesService.deleteRuleByName(name);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error in RulesController.deleteRuleByName:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
}

async function getAllRules(req, res) {
  const supabase = req.supabase;

  try {
    const rules = await fetchRulesData(supabase);

    const transformedRules = transformRulesToJsonRulesFormat(rules);
    return res.json(transformedRules);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function testRules(req, res) {
  console.log("inside test rules");
  const supabase = req.supabase;
  try {
    // const { data: ruleSets, error: ruleSetsError } = await supabase
    //   .from("rule_sets")
    //   .select("*");

    // if (ruleSetsError) {
    //   console.error("Error fetching rule sets:", ruleSetsError);
    //   return res.status(500).json({ error: "Failed to fetch rule sets" });
    // }

    // const [
    //   { data: conditions, error: condError },
    //   { data: events, error: eventError },
    // ] = await Promise.all([
    //   supabase.from("conditions").select("*"),
    //   supabase.from("event").select("*"),
    // ]);

    // if (condError || eventError) {
    //   console.error(
    //     "Error fetching conditions/events:",
    //     condError || eventError
    //   );
    //   return res.status(500).json({ error: "Failed to fetch related data" });
    // }

    // // Transforming the rules with results from rule_sets, conditions and event table
    // const rules = ruleSets.map((ruleSet) => ({
    //   id: ruleSet.id,
    //   name: ruleSet.name,
    //   active: ruleSet.active,
    //   conditions: conditions.filter((c) => c.rule_set_id === ruleSet.id),
    //   events: events.filter((e) => e.rule_set_id === ruleSet.id),
    // }));
    const rules = await fetchRulesData(supabase);
    const transformedRules = transformRulesToJsonRulesFormat(rules);
    const engine = new Engine();
    transformedRules.forEach((rule) => engine.addRule(rule));

    // Step 4: Define sample facts
    const facts = {
      marks: 55, // adjust based on what your rules expect
    };

    // Step 5: Run engine
    const results = await engine.run(facts);

    res.status(200).json({
      triggered: results,
    });
  } catch (err) {
    console.error("Error running rules engine:", err);
    res.status(500).json({ error: err.message });
  }
}

async function createRule(req, res) {
  const supabase = req.supabase;
  const { name, active = true, conditions = {}, events = {} } = req.body;

  if (!name || !Array.isArray(conditions) || !Array.isArray(events)) {
    return res.status(400).json({ error: "Missing or invalid rule data" });
  }

  const ruleSetId = uuidv4();

  try {
    // Insert into rule_sets
    const { error: ruleSetError } = await supabase
      .from("rule_sets")
      .insert([{ id: ruleSetId, name, active }]);

    if (ruleSetError) {
      console.error("Error inserting into rule_sets:", ruleSetError);
      return res.status(500).json({ error: "Failed to create rule set" });
    }

    // Prepare conditions
    const conditionsData = conditions.map((cond) => ({
      id: uuidv4(),
      rule_set_id: ruleSetId,
      key: cond.key,
      fact: cond.fact,
      value: cond.value,
      operator: cond.operator,
    }));

    // Prepare events
    const eventsData = events.map((ev) => ({
      id: uuidv4(),
      rule_set_id: ruleSetId,
      type: ev.type,
      value: ev.value,
    }));

    // Insert conditions and events
    const [{ error: condErr }, { error: eventErr }] = await Promise.all([
      supabase.from("conditions").insert(conditionsData),
      supabase.from("event").insert(eventsData),
    ]);

    if (condErr) {
      console.error("Error inserting related data in conditions:", condErr);
      return res
        .status(500)
        .json({ error: "Failed to insert conditions or events" });
    } else if (eventErr) {
      console.error("Error inserting related data in events:", eventErr);
      return res
        .status(500)
        .json({ error: "Failed to insert conditions or events" });
    }

    return res
      .status(201)
      .json({ message: "Rule created successfully", rule_set_id: ruleSetId });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateRule(req, res) {
  const supabase = req.supabase;
  const ruleSetId = req.params.id;
  const { name, active, conditions = [], events = [] } = req.body;

  if (
    !name ||
    typeof active !== "boolean" ||
    !Array.isArray(conditions) ||
    !Array.isArray(events)
  ) {
    return res.status(400).json({ error: "Missing or invalid rule data" });
  }

  try {
    // Check if rule set exists
    const { data: existingRuleSet, error: checkError } = await supabase
      .from("rule_sets")
      .select("id")
      .eq("id", ruleSetId)
      .single();

    if (checkError || !existingRuleSet) {
      return res.status(404).json({ error: "Rule set not found" });
    }

    // Update rule_sets
    const { error: updateError } = await supabase
      .from("rule_sets")
      .update({ name, active })
      .eq("id", ruleSetId);

    if (updateError) {
      console.error("Error updating rule_sets:", updateError);
      return res.status(500).json({ error: "Failed to update rule set" });
    }

    // Delete existing conditions and events
    await Promise.all([
      supabase.from("conditions").delete().eq("rule_set_id", ruleSetId),
      supabase.from("event").delete().eq("rule_set_id", ruleSetId),
    ]);

    // Insert updated conditions
    const conditionInserts = conditions.map((cond) => ({
      id: uuidv4(),
      rule_set_id: ruleSetId,
      key: cond.key,
      fact: cond.fact,
      value: cond.value,
      operator: cond.operator,
    }));

    // Insert updated events
    const eventInserts = events.map((ev) => ({
      id: uuidv4(),
      rule_set_id: ruleSetId,
      type: ev.type,
      value: ev.value,
    }));

    const [{ error: condErr }, { error: eventErr }] = await Promise.all([
      supabase.from("conditions").insert(conditionInserts),
      supabase.from("event").insert(eventInserts),
    ]);

    if (condErr || eventErr) {
      console.error(
        "Error inserting new conditions/events:",
        condErr || eventErr
      );
      return res
        .status(500)
        .json({ error: "Failed to update rule conditions or events" });
    }

    return res.status(200).json({ message: "Rule updated successfully" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getRuleByName(req, res) {
  const supabase = req.supabase;
  const name = req.params.name;

  try {
    // Fetch the rule set by name
    const { data: ruleSet, error: ruleSetError } = await supabase
      .from("rule_sets")
      .select("*")
      .eq("name", name)
      .single();

    if (ruleSetError || !ruleSet) {
      return res.status(404).json({ error: "Rule not found" });
    }

    // Fetch related conditions and events
    const [
      { data: conditions, error: condErr },
      { data: events, error: eventErr },
    ] = await Promise.all([
      supabase.from("conditions").select("*").eq("rule_set_id", ruleSet.id),
      supabase.from("event").select("*").eq("rule_set_id", ruleSet.id),
    ]);

    if (condErr || eventErr) {
      console.error("Error fetching related data:", condErr || eventErr);
      return res.status(500).json({ error: "Failed to fetch rule details" });
    }

    return res.json({
      id: ruleSet.id,
      name: ruleSet.name,
      active: ruleSet.active,
      conditions,
      events,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
async function evaluateRules(req, res) {
  try {
    const facts = req.body; // The facts to evaluate against your rules
    const { rulesEngine } = req;
    // await rulesEngine.loadRulesFromDatabase(req.supabase);

    const results = await rulesEngine.evaluate(facts);

    res.json({
      triggeredRules: results,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to evaluate rules",
    });
  }
}

export {
  getAllRules,
  createRule,
  updateRule,
  getRuleByName,
  testRules,
  evaluateRules,
};
