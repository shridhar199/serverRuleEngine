export class Event {
  constructor(data) {
    this.id = data.id;
    this.ruleSetId = data.rule_set_id;
    this.type = data.type;
    this.value = data.value;
  }
}