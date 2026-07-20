const z = require('zod');
const result = z.string().safeParse(123);
console.log('errors:', result.error.errors);
console.log('issues:', result.error.issues);
