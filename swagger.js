import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "HRMS & Authentication API",
    description: "Production-ready API documentation generated automatically by swagger-autogen, detailing JWT cookie-based RBAC authentication and employee/HR systems.",
    version: "1.0.0",
  },
  host: "localhost:8000",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./index.js"];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger JSON documentation successfully generated!");
});
