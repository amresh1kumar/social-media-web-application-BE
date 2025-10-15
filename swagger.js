const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
   definition: {
      openapi: "3.0.0",
      info: {
         title: "Social Media Web Application API",
         version: "1.0.0",
         description:
            "API documentation for the Social Media Web Application built using Express, MongoDB, and Socket.IO",
         contact: {
            name: "Amresh Kumar",
            url: "https://github.com/amresh1kumar",
         },
      },

      components: {
         securitySchemes: {
            bearerAuth: {
               type: "http",
               scheme: "bearer",
               bearerFormat: "JWT",
            },
         },
      },

      // 🔹 Global security apply karne ke liye (sabhi endpoints me JWT option dikhe)
      security: [
         {
            bearerAuth: [],
         },
      ],

      servers: [
         {
            url: "http://localhost:5000/api",
            description: "Local Development Server",
         },
         {
            url: "https://social-media-web-application-be.onrender.com/api",
            description: "Production Server",
         },
      ],
   },

   // 🔹 route files ka path
   // apis: [path.join(__dirname, "./routes/*.js")],
   apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
