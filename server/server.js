require("dotenv").config;
import express from "express";
import cors from "cors";
const morgan = require("morgan");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
