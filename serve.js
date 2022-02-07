import {app} from './src/index.js';

const port = Number(process.env['PORT'] || 3000);
app.listen(port, () => console.log(`API server started on :${port}`));
