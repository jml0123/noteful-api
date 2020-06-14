const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()


const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    date_modified: note.date_modified,
    content: xss(note.content),
    folder_id: note.folder_id,
})

notesRouter
    .route('/')
    .all((req, res, next)=> {
        knexInstance = req.app.get('db')
        next()
    })
    .get((req, res, next) => {
        NotesService.getAllNotes(knexInstance)
        .then(notes => {
            res.json(notes.map(serializeNote))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {note_name, content, date_modified, folder_id } = req.body
        const newNote = { note_name, content, folder_id}
        for (const [key, value] of Object.entries(newNote))
        if (value == null)
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })

    newNote.date_modified = date_modified;

    NotesService.insertNote(knexInstance, newNote)
    .then(note => {
        res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${note.id}`))
            .json(serializeNote(note))
    })
    .catch(next)
})

notesRouter
    .route(`/:note_id`)
    .all((req, res, next) => {
        knexInstance = req.app.get('db')
        NotesService.getByNoteId(knexInstance, req.params.note_id)
        .then(note => {
            if (!note) {
                return res.status(404).json({
                    error: { message: `Note doesn't exist`}
                })
            }
            res.note = note
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(knexInstance, req.params.note_id)
        .then(AffectedEntries => {
            res.status(204).end()
        })
        .catch(next)
    })
    // PATCH not implemented -- user cannot edit note after creation

module.exports = notesRouter