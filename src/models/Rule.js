export class Rule {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.active = data.active;
    this.conditions = data.conditions || [];
    this.events = data.events || [];
  }

  // Convert to JSON Rules Engine format
  toJsonRulesFormat() {
//      return this.data.map((rule) => {
//     const transformedConditions = rule.conditions.map((cond) => ({
//       fact: cond.fact,
//       operator: cond.operator,
//       value: isNaN(cond.value) ? cond.value : Number(cond.value),
//     }));

//     return {
//       name: rule.name,
//       active:rule.active,
//       conditions: {
//         [rule.conditions[0]?.key || "any"]: transformedConditions,
//       },
//       event: {
//         type: rule.events[0]?.type,
//         params: {
//           value: rule.events[0]?.value,
//         },
//       },
//     };
//   });
console.log("inside json rule conversion",data)
return
  }
}