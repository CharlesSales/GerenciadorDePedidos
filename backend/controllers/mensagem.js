import express from 'express'


var request = require("request");

var options = {
  method: 'POST',
  url: 'https://api.z-api.io/instances/3E9B4088C58941EC306A02FCF4BC8665/token/3ADFE5D2154378C268CC92A7/send-text',
  headers: {'content-type': 'application/json', 'client-token': '{{security-token}}'},
  body: {phone: '5571996282236', message: 'Hello world*'},
  json: true
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});