const crypto = require('crypto');
const axios = require('axios');

const partnerCode = "PAY2S7EPF0SB1ZP27W71";
const accessKey = "66e862c89d4d4d1f34063dc1967fbd64dece4da3cba90af65167fbb8503b2eb3";
const secretKey = "3cb0ba535605a7f1bad779d727bd234e8227073fc3f531b394524c2e4644ff97";

const orderCode = "TEST-123";
const amount = 100000;
const description = "Test";
const returnUrl = "http://localhost:3000/orders";

const dataToSign1 = accessKey + amount + orderCode + partnerCode + returnUrl;
const dataToSign2 = accessKey + amount + description + orderCode + partnerCode + returnUrl;
const dataToSign3 = `${amount}|${orderCode}|${partnerCode}|${returnUrl}`;

async function testSig(dataToSign) {
  const signature = crypto.createHmac('sha256', secretKey).update(dataToSign).digest('hex');
  console.log("Testing:", dataToSign);
  try {
    const res = await axios.post('https://payment.pay2s.vn/v1/gateway/api/create', {
      partnerCode, accessKey, orderCode, amount, description, returnUrl, signature
    });
    console.log("Result:", res.data);
    if(res.data.status) process.exit(0);
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
}

async function run() {
  await testSig(dataToSign1);
  await testSig(dataToSign2);
  await testSig(dataToSign3);
}
run();
