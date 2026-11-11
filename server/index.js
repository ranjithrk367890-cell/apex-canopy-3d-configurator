import app from './app.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[Pricing API] Mock Pricing Service running at http://localhost:${PORT}`);
});
