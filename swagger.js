const swaggerJSDoc = require("swagger-jsdoc");

const options = {
   definition: {
      openapi: "3.0.0",
      info: {
         title: "Social Media API",
         version: "1.0.0",
         description: "API documentation for Social Media Web App"
      },
      servers: [
         { url: "http://localhost:5000" } // change if deployed
      ],
   },
   apis: ["./routes/*.js"], // you can add models later: "./models/*.js"
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
