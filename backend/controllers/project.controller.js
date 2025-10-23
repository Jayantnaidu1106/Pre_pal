import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.services.js';
import { validationResult } from 'express-validator';
import userModel from '../models/user.models.js';

export const createProject = async (req, res) => {
    

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const { name } =  req.body;

    const loggedInUser = await userModel.findById(req.user._id);
    const users = [loggedInUser._id];

    try {
        const newProject = await projectService.createProject({
            name, users
        });

        res.status(201).json({
            newProject
        })
    }

    catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
 
}

export const getAllProjects = async (req, res) => {
    try {
        const loggedInUser = await userModel.findById(req.user._id);

        const allUserProjects = await projectService.getAllProjectByUserId(loggedInUser._id);

        res.status(200).json({
            allUserProjects
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })


        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        res.status(400).json({ error: err.message });
    }


}

export const getProjectById = async (req,res) => {
 
    const {projectId}  = req.params;

    
try{
    const project = await projectService.getProjectById(projectId);

    res.status(200).json({
        project
    })
}
catch(err){
        res.status(500).json({
            error: err.message
        })
    }
}
