const express = require('express');
const { chromium } = require('playwright-core');

const app = express();
app.use(express.json());

app.post('/run-test', async (req, res) => {
  const { connectUrl, script } = req.body;
  
  try {
    const browser = await chromium.connectOverCDP(connectUrl);
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();
    
    let result = "TEST PASSED";
    try {
      const testFunction = new Function('page', 'require', `
        return (async () => {
          ${script}
        })();
      `);
      await testFunction(page, require);
    } catch (err) {
      result = "TEST FAILED: " + err.message;
    }
    
    await browser.close();
    res.json({ status: result });
  } catch (err) {
    res.status(500).json({ status: "ERROR: " + err.message });
  }
});

app.get('/', (req, res) => res.send('QA Automation Server Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
