const express = require('express');
const router = express.Router();

module.exports =(db)=>{
    router.get('/', async (req, res) =>{
        const { email } = req.query;

        try {
          const coordinator = await Coordinator.findOne({ where: { coordinator_email: email } });
          res.json({ exists: !!coordinator });
        } catch (error) {
          console.error("Error checking email:", error);
          res.status(500).json({ error: "Failed to check email availability." });
        }
    });
    return router;
}