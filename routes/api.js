'use strict';

const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const issueSchema = new mongoose.Schema({
  project: String,
  issue_title: String,
  issue_text: String,
  created_on: String,
  updated_on: String,
  created_by: String,
  assigned_to: String,
  open: Boolean,
  status_text: String
})

let Issue = mongoose.model('Issue', issueSchema)

async function postIssue(issue) {

  const done = await Issue.create({
    project: issue.project,
    issue_title: issue.issue_title,
    issue_text: issue.issue_text,
    created_on: issue.created_on,
    updated_on: issue.updated_on,
    created_by: issue.created_by,
    assigned_to: issue.assigned_to,
    open: true,
    status_text: issue.status_text
  })
  return done
}

function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if ((String)(new ObjectId(id)) === id)
      return true;
    return false;
  }
  return false;
}

module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(async function(req, res) {
      let projectName = req.params.project
      let filter = req.query
      try {
        const projectList = await Issue.find({ project: projectName })
        // Sort depending on filter:
        let attributeList = ['issue_title', 'issue_text', 'created_on', 'updated_on', 'created_by', 'assigned_to', 'open', 'status_test', '_id']
        let filteredList = projectList.filter(project => {
          let save = true
          for (const attribute of attributeList) {
            if (filter?.[attribute] != undefined && project?.[attribute] != filter[attribute]) {
              save = false
            }
          }
          return save
        })
        res.json(filteredList)
      } catch (e) {
        console.log(e.message)
      }
    })

    .post(function(req, res) {
      let project = req.params.project;
      let input = req.body;
      if (input.issue_title == undefined || input.issue_text == undefined || input.created_by == undefined) {
        res.json({ error: 'required field(s) missing' })
      } else {
        let output = {
          project: project,
          issue_title: input.issue_title,
          issue_text: input.issue_text,
          created_on: new Date().toISOString(),
          updated_on: new Date().toISOString(),
          created_by: input.created_by,
          open: true,
          // optional:
          assigned_to: input.assigned_to,
          status_text: input.status_text
        }
        if (output.status_text == undefined) {
          output.status_text = ''
        }
        if (output.assigned_to == undefined) {
          output.assigned_to = ''
        }
        post();
        async function post() {
          try {
            let newIssue = await postIssue(output)
            res.json(newIssue)
          }
          catch (e) {
            console.log(e.message)
          }
        }
      }
    })

    .put(async function(req, res) {
      let project = req.params.project;
      let input = req.body
      let id = input._id
      let update = input
      delete update._id

      if (isValidObjectId(id) && Object.keys(input).length >= 1 && Object.keys(update).length != 0) {
        try {
          update.updated_on = new Date().toISOString()
          let updatedIssue = await Issue.findByIdAndUpdate(id, update)
          updatedIssue == null ?
            res.json({ error: 'could not update', _id: id }) :
            res.json({ result: 'successfully updated', '_id': id })
        }
        catch (e) {
          console.log(e.message)
        }
      } else if (id == undefined) {
        res.json({ error: 'missing _id' })
      } else if (Object.keys(update).length == 0) {
        res.json({ error: 'no update field(s) sent', _id: id })
      } else {
        res.json({ error: 'could not update', _id: id })
      }


    })

    .delete(async function(req, res) {
      let project = req.params.project;
      let id = req.body._id
      if (id == undefined) {
        res.json({ error: 'missing _id' })
      } else if (isValidObjectId(id)) {
        try {
          let deletedIssue = await Issue.findByIdAndDelete(id)
          if (deletedIssue == null) {
            res.json({ error: 'could not delete', '_id': id })
          } else {
            res.json({ result: 'successfully deleted', '_id': id })
          }
        } catch (e) {
          console.log(e.message)
        }
      } else {
        res.json({ error: 'could not delete', '_id': id })
      }

    });
};
