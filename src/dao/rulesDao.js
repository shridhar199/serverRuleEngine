import { v4 as uuidv4 } from "uuid";
import { Rule } from "../models/Rule.js";
import { Condition } from "../models/Condition.js";
import { Event } from "../models/Event.js";

export class RulesDao {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async getAllRules() {
    try {
      const { data: rulesData, error } = await this.supabase.from("rule_sets")
        .select(`
          id,
          name,
          active,
          conditions (
            id,
            rule_set_id,
            key,
            fact,
            value,
            operator
          ),
          event (
            id,
            rule_set_id,
            type,
            value
          )
        `);

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Transform raw data to model instances
      return rulesData.map((ruleData) => {
        const conditions = (ruleData.conditions || []).map(
          (condData) => new Condition(condData)
        );
        const events = (ruleData.event || []).map(
          (eventData) => new Event(eventData)
        );

        return new Rule({
          ...ruleData,
          conditions,
          events,
        });
      });
    } catch (error) {
      console.error("Error in RulesDao.getAllRules:", error);
      throw error;
    }
  }

  async getRuleById(id) {
    try {
      const { data: ruleData, error } = await this.supabase
        .from("rule_sets")
        .select(
          `
          id,
          name,
          active,
          conditions (
            id,
            rule_set_id,
            key,
            fact,
            value,
            operator
          ),
          event (
            id,
            rule_set_id,
            type,
            value
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!ruleData) {
        return null;
      }

      const conditions = (ruleData.conditions || []).map(
        (condData) => new Condition(condData)
      );
      const events = (ruleData.event || []).map(
        (eventData) => new Event(eventData)
      );

      return new Rule({
        ...ruleData,
        conditions,
        events,
      });
    } catch (error) {
      console.error("Error in RulesDao.getRuleById:", error);
      throw error;
    }
  }

  async getRuleByName(name) {
    try {
      const { data: ruleData, error } = await this.supabase
        .from("rule_sets")
        .select(
          `
          id,
          name,
          active,
          conditions (
            id,
            rule_set_id,
            key,
            fact,
            value,
            operator
          ),
          event (
            id,
            rule_set_id,
            type,
            value
          )
        `
        )
        .eq("name", name)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Rule not found
        }
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!ruleData) {
        return null;
      }

      const conditions = (ruleData.conditions || []).map(
        (condData) => new Condition(condData)
      );
      const events = (ruleData.event || []).map(
        (eventData) => new Event(eventData)
      );

      return new Rule({
        ...ruleData,
        conditions,
        events,
      });
    } catch (error) {
      console.error("Error in RulesDao.getRuleByName:", error);
      throw error;
    }
  }

  async createRule(ruleData) {
    const { name, active, conditions, events } = ruleData;
    const ruleSetId = uuidv4();

    try {
      // Start transaction-like operations
      // Insert into rule_sets
      const { error: ruleSetError } = await this.supabase
        .from("rule_sets")
        .insert([{ id: ruleSetId, name, active }]);

      if (ruleSetError) {
        throw new Error(`Failed to create rule set: ${ruleSetError.message}`);
      }

      // Prepare conditions data
      const conditionsData = conditions.map((cond) => ({
        id: uuidv4(),
        rule_set_id: ruleSetId,
        key: cond.key,
        fact: cond.fact,
        value: cond.value,
        operator: cond.operator,
      }));

      // Prepare events data
      const eventsData = events.map((ev) => ({
        id: uuidv4(),
        rule_set_id: ruleSetId,
        type: ev.type,
        value: ev.value,
      }));

      // Insert conditions and events in parallel
      const [conditionsResult, eventsResult] = await Promise.all([
        this.supabase.from("conditions").insert(conditionsData),
        this.supabase.from("event").insert(eventsData),
      ]);

      if (conditionsResult.error) {
        throw new Error(
          `Failed to insert conditions: ${conditionsResult.error.message}`
        );
      }

      if (eventsResult.error) {
        throw new Error(
          `Failed to insert events: ${eventsResult.error.message}`
        );
      }

      // Return the created rule ID
      return ruleSetId;
    } catch (error) {
      console.error("Error in RulesDao.createRule:", error);
      throw error;
    }
  }

  async updateRuleByName(name, updateData) {
    try {
      // First, get the existing rule to get its ID
      const existingRule = await this.getRuleByName(name);
      if (!existingRule) {
        throw new Error("Rule not found");
      }

      const ruleSetId = existingRule.id;
      const updateFields = {};

      // Only update fields that are provided
      if (updateData.name !== undefined) {
        updateFields.name = updateData.name;
      }
      if (updateData.active !== undefined) {
        updateFields.active = updateData.active;
      }

      // Update rule_sets table if there are fields to update
      if (Object.keys(updateFields).length > 0) {
        const { error: updateError } = await this.supabase
          .from("rule_sets")
          .update(updateFields)
          .eq("id", ruleSetId);

        if (updateError) {
          throw new Error(`Failed to update rule set: ${updateError.message}`);
        }
      }

      // Update conditions if provided
      if (updateData.conditions && Array.isArray(updateData.conditions)) {
        for (const conditionUpdate of updateData.conditions) {
          if (conditionUpdate.id) {
            // Update existing condition - only update provided fields
            const conditionUpdateFields = {};

            if (conditionUpdate.key !== undefined) {
              conditionUpdateFields.key = conditionUpdate.key;
            }
            if (conditionUpdate.fact !== undefined) {
              conditionUpdateFields.fact = conditionUpdate.fact;
            }
            if (conditionUpdate.value !== undefined) {
              conditionUpdateFields.value = conditionUpdate.value;
            }
            if (conditionUpdate.operator !== undefined) {
              conditionUpdateFields.operator = conditionUpdate.operator;
            }

            if (Object.keys(conditionUpdateFields).length > 0) {
              const { error: conditionError } = await this.supabase
                .from("conditions")
                .update(conditionUpdateFields)
                .eq("id", conditionUpdate.id)
                .eq("rule_set_id", ruleSetId);

              if (conditionError) {
                throw new Error(
                  `Failed to update condition ${conditionUpdate.id}: ${conditionError.message}`
                );
              }
            }
          } else {
            // Insert new condition (all required fields must be present)
            if (
              !conditionUpdate.key ||
              !conditionUpdate.fact ||
              conditionUpdate.value === undefined ||
              !conditionUpdate.operator
            ) {
              throw new Error(
                "New conditions must have all required fields: key, fact, value, operator"
              );
            }

            const newCondition = {
              id: uuidv4(),
              rule_set_id: ruleSetId,
              key: conditionUpdate.key,
              fact: conditionUpdate.fact,
              value: conditionUpdate.value,
              operator: conditionUpdate.operator,
            };

            const { error: insertError } = await this.supabase
              .from("conditions")
              .insert([newCondition]);

            if (insertError) {
              throw new Error(
                `Failed to insert new condition: ${insertError.message}`
              );
            }
          }
        }
      }

      // Handle condition deletions if specified
      // if (updateData.deleteConditions && Array.isArray(updateData.deleteConditions)) {
      //   for (const conditionId of updateData.deleteConditions) {
      //     const { error: deleteError } = await this.supabase
      //       .from("conditions")
      //       .delete()
      //       .eq("id", conditionId)
      //       .eq("rule_set_id", ruleSetId);

      //     if (deleteError) {
      //       throw new Error(`Failed to delete condition ${conditionId}: ${deleteError.message}`);
      //     }
      //   }
      // }

      // Update events if provided
      if (updateData.events && Array.isArray(updateData.events)) {
        for (const eventUpdate of updateData.events) {
          if (eventUpdate.id) {
            // Update existing event - only update provided fields
            const eventUpdateFields = {};

            if (eventUpdate.type !== undefined) {
              eventUpdateFields.type = eventUpdate.type;
            }
            if (eventUpdate.value !== undefined) {
              eventUpdateFields.value = eventUpdate.value;
            }

            if (Object.keys(eventUpdateFields).length > 0) {
              const { error: eventError } = await this.supabase
                .from("event")
                .update(eventUpdateFields)
                .eq("id", eventUpdate.id)
                .eq("rule_set_id", ruleSetId);

              if (eventError) {
                throw new Error(
                  `Failed to update event ${eventUpdate.id}: ${eventError.message}`
                );
              }
            }
          } else {
            // Insert new event (all required fields must be present)
            if (!eventUpdate.type || eventUpdate.value === undefined) {
              throw new Error(
                "New events must have all required fields: type, value"
              );
            }

            const newEvent = {
              id: uuidv4(),
              rule_set_id: ruleSetId,
              type: eventUpdate.type,
              value: eventUpdate.value,
            };

            const { error: insertError } = await this.supabase
              .from("event")
              .insert([newEvent]);

            if (insertError) {
              throw new Error(
                `Failed to insert new event: ${insertError.message}`
              );
            }
          }
        }
      }

      // Handle event deletions if specified
      // if (updateData.deleteEvents && Array.isArray(updateData.deleteEvents)) {
      //   for (const eventId of updateData.deleteEvents) {
      //     const { error: deleteError } = await this.supabase
      //       .from("event")
      //       .delete()
      //       .eq("id", eventId)
      //       .eq("rule_set_id", ruleSetId);

      //     if (deleteError) {
      //       throw new Error(`Failed to delete event ${eventId}: ${deleteError.message}`);
      //     }
      //   }
      // }

      return ruleSetId;
    } catch (error) {
      console.error("Error in RulesDao.updateRuleByName:", error);
      throw error;
    }
  }

  async deleteRuleByName(ruleName) {
    try {
      // Get rule ID by name
      const { data: ruleData, error: fetchError } = await this.supabase
        .from("rule_sets")
        .select("id")
        .eq("name", ruleName)
        .single();

      if (fetchError) throw new Error(`Rule "${ruleName}" not found.`);

      const ruleSetId = ruleData.id;

      // Delete associated conditions
      const { error: condError } = await this.supabase
        .from("conditions")
        .delete()
        .eq("rule_set_id", ruleSetId);
      if (condError)
        throw new Error(`Failed to delete conditions: ${condError.message}`);

      // Delete associated events
      const { error: eventError } = await this.supabase
        .from("event")
        .delete()
        .eq("rule_set_id", ruleSetId);
      if (eventError)
        throw new Error(`Failed to delete events: ${eventError.message}`);

      // Delete the rule set
      const { error: ruleSetError } = await this.supabase
        .from("rule_sets")
        .delete()
        .eq("id", ruleSetId);
      if (ruleSetError)
        throw new Error(`Failed to delete rule: ${ruleSetError.message}`);

      return {
        success: true,
        message: `Rule "${ruleName}" deleted successfully.`,
      };
    } catch (error) {
      console.error("Error in RulesDao.deleteRuleByName:", error);
      throw error;
    }
  }
}
