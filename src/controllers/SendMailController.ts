import { Request, Response } from "express";
import { resolve } from "path";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveyRepository } from "../repositories/SurveyRepository";
import { SurveyUserRepository } from "../repositories/SurveyUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const userRepository = getCustomRepository(UserRepository);
        const surveyRepository = getCustomRepository(SurveyRepository);
        const surveyUserRepository = getCustomRepository(SurveyUserRepository);

        const user = await userRepository.findOne({ email });
        if (!user) {
            throw new AppError("User does not exists!");
        }

        const survey = await surveyRepository.findOne({ id: survey_id });
        if (!survey) {
            throw new AppError("Survey does not exists!");
        }

        const surveyUserAlreadyExists = await surveyUserRepository.findOne({
            where: { user_id: user.id, value: null },
            relations: ["user", "survey"]
        })

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");
        const variables = {
            name: user.name,
            id: "",
            title: survey.title,
            description: survey.description,
            link: process.env.URL_MAIL
        }

        if (surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id;
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists);
        }

        const surveyUser = surveyUserRepository.create({
            user_id: user.id,
            survey_id
        });

        await surveyUserRepository.save(surveyUser);
        variables.id = surveyUser.id;
        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.status(201).json(surveyUser);
    }
}

export { SendMailController }