const { models } = require('./server/models');
console.log('Available models:', Object.keys(models).join(', '));
if (models.salesorder) {
    console.log('SalesOrder model found!');
} else {
    console.log('SalesOrder model NOT found!');
}
process.exit(0);
