function transformRulesToJsonRulesFormat(rules) {
  return rules.map((rule) => {
    const transformedConditions = rule.conditions.map((cond) => ({
      fact: cond.fact,
      operator: cond.operator,
      value: isNaN(cond.value) ? cond.value : Number(cond.value),
    }));

    return {
      name: rule.name,
      active:rule.active,
      conditions: {
        [rule.conditions[0]?.key || "any"]: transformedConditions,
      },
      event: {
        type: rule.events[0]?.type,
        params: {
          value: rule.events[0]?.value,
        },
      },
    };
  });
}

async function fetchRulesData(supabase) {
  try {
    // Single query with joins - much more efficient than 3 separate queries
    const { data: rulesData, error } = await supabase.from("rule_sets").select(`
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
    console.log("rules data", rulesData);
    // Transform to the expected format
    const transformedData = rulesData.map((ruleSet) => ({
      id: ruleSet.id,
      name: ruleSet.name,
      active: ruleSet.active,
      conditions: ruleSet.conditions || [],
      events: ruleSet.event || [], // Note: Supabase returns 'event' not 'events'
    }));

    return transformedData;
  } catch (error) {
    console.error("Error fetching rules data:", error);
    throw error;
  }
}

export { transformRulesToJsonRulesFormat, fetchRulesData };
