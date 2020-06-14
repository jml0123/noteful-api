const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name),
    date_created: folder.date_created,
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
        .then(folders => {
            res.json(folders.map(serializeFolder))    
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next)=> {
        const knexInstance = req.app.get('db')
        const {folder_name, date_created} = req.body;
        const newFolder = {folder_name}
        for (const [key, value] of Object.entries(newFolder))
        if (value == null)
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })
        newFolder.date_created = date_created

        FoldersService.insertFolder(knexInstance, newFolder)
        .then(folder => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                .json(serializeFolder(folder))
        })
        .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        knexInstance = req.app.get('db')
        FoldersService.getByFolderId(knexInstance, req.params.folder_id)
        .then(folder => {
            if (!folder) {
                return res.status(404).json({
                    error: { message: `Folder doesn't exist`}
                })
            }
            res.folder = folder
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        FoldersService.deleteFolder(knexInstance, req.params.folder_id)
        .then(AffectedEntries=> {
            res.status(204).end()
        })
        .catch(next)
    })
  
    // PATCH  not implemented -- user cannot edit or delete folder after creation


module.exports = foldersRouter