export class Condition {
  constructor(data) {
    this.id = data.id;
    this.ruleSetId = data.rule_set_id;
    this.key = data.key;
    this.fact = data.fact;
    this.value = data.value;
    this.operator = data.operator;
  }
}