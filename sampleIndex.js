// import { Engine } from 'json-rules-engine';
// import { supabase } from './supabaseClient.js';

// const engine = new Engine();

// async function fetchRules() {
//   const { data, error } = await supabase.from('rules').select('*');

//   if (error) {
//     console.error('Error fetching rules:', error);
//     return [];
//   }

//   return data;
// }

// // Wrap everything in an async function
// (async () => {
//   const rules = await fetchRules();

//   if (rules.length === 0) {
//     console.warn('No rules found. Exiting.');
//     return;
//   }

//   // Add all rules to the engine
//   rules.forEach(rule => engine.addRule(rule));

//   // Define some facts
//   const facts = { orderTotal: 120 };

//   // Run the rules engine
//   const { events } = await engine.run(facts);

//   if (events.length > 0) {
//     events.forEach(event => {
//       console.log("Event triggered:", event.type, event.params);
//     });
//   } else {
//     console.log("No rules matched.");
//   }
// })();
// import express from 'express';
// app.post('/orders', async (req, res) => {
//   try {

//     const orderData = req.body;

//     const { data: rules, error: fetchError } = await supabase
//       .from('rules')
//       .select('*')
//       .eq('route', '/orders') 
//       .eq('active', true) 
//       .order('version', { ascending: false })
//       .limit(1);


//     if (fetchError) {
//       console.error('Error fetching rules from Supabase:', fetchError);
//       return res.status(500).json({ error: 'Failed to fetch rules' });
//     }

//     // If no rule is found, respond accordingly
//     if (!rules || rules.length === 0) {
//       console.log('No active rule found for /orders');
//       return res.status(400).json({ error: 'No active rule found for orders' });
//     }

//     const ruleDefinition = rules[0].rule;

//     const engine = new Engine();
//     engine.addRule(ruleDefinition);

//     const results = await engine.run(orderData);

//     if (results.events.length > 0) {
//       console.log('Rule triggered events for /orders:', results.events);
//       // Respond with success and triggered events
//       return res.json({
//         success: true,
//         message: 'Order processed; rule triggered.',
//         events: results.events
//       });
//     } else {
//       console.log('No rule events triggered for /orders');
//       // Respond with success and no events
//       return res.json({
//         success: true,
//         message: 'Order processed; no rule triggers.',
//         events: []
//       });
//     }
//   } catch (error) {
//     // Catch and log any unexpected errors during processing
//     console.error('Error processing /orders request:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });