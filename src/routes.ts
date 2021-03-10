import { Router } from "express";
import { AnswerController } from "./controllers/AnswerController";
import { NpsController } from "./controllers/NpsController";
import { SendMailController } from "./controllers/SendMailController";
import { SurveyController } from "./controllers/SurveyController";
import { UserController } from "./controllers/UserController";

const router = Router();

const surveyController = new SurveyController();

router.post("/users", new UserController().create);
router.post("/surveys", surveyController.create);
router.get("/surveys", surveyController.show);
router.post("/sendMail", new SendMailController().execute);
router.get("/answers/:value", new AnswerController().execute);
router.get("/nps/:survey_id", new NpsController().execute);

export { router };
