import { AppError } from './../errors/AppError';
import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from "yup";
import { UserRepository } from "../repositories/UserRepository";

class UserController {
    async create(request: Request, response: Response) {
        const { name, email } = request.body;

        const schema = yup.object().shape({
            name: yup.string().required("O nome é obrigatório"),
            email: yup.string().email("O e-mail informado é inválido").required("O e-mail é obrigatório"),
        })

        try {
            await schema.validate(request.body, { abortEarly: false });
        } catch (error) {
            throw new AppError(error);
        }
        const usersRepository = getCustomRepository(UserRepository);

        const userAlreadyExists = await usersRepository.findOne({
            email
        })

        if (userAlreadyExists) {
            throw new AppError("User already exists!");
        }

        const user = usersRepository.create({
            name, email
        });

        await usersRepository.save(user);

        return response.status(201).json(user);
    }
}

export { UserController };
