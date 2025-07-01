import express from "express";
import {
  getRuleByName,
  updateRule,
  createRule,
  getAllRules,
  testRules,
  evaluateRules,
  RulesController,
  createUserController,
  getAllUsersController,
  deleteUserController
} from "../controller/rulesController.js";

const router = express.Router();

// router.get("/test", testRules);
// router.get("/transformedRules",RulesController.getAllRulesTransformed)
// router.post("/evaluate", evaluateRules);
// router.get("/", RulesController.getAllRules);
// // router.post("/", createRule);
// // router.get("/:name", getRuleByName);
// router.get('/rules/name/:name', RulesController.getRuleByName);
// // router.put("/:id", updateRule);
// router.post('/rules/update/:name', RulesController.updateRuleByName);
router.get("/test", testRules);
router.get("/transformedRules", RulesController.getAllRulesTransformed);
router.post("/evaluate", evaluateRules);
router.get('/name/:name', RulesController.getRuleByName);
router.post('/update/:name', RulesController.updateRuleByName);
router.delete("/delete/:name",RulesController.deleteRuleByName);
router.get("/", RulesController.getAllRules);
router.post("/", createRule);
router.post('/user',createUserController)
router.get('/users',getAllUsersController)
router.delete('/user/:id', deleteUserController);
export default router;
