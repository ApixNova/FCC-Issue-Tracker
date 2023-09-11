const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let firstId = ''

suite('Functional Tests', function() {
  test("Create an issue with every field", function(done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/{project}")
      .type('form')
      .send({
        "issue_title": "Fix error in posting data",
        "issue_text": "When we post data it has an error.",
        "created_by": "Joe",
        "assigned_to": "Joe",
        "status_text": "In QA"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        firstId = res.body._id
        done();
      });
  })
  //test 2
  test("Create an issue with only required fields", function(done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/{project}")
      .type('form')
      .send({
        "issue_title": "Fix error in posting data",
        "issue_text": "When we post data it has an error.",
        "created_by": "Joe",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
  })
  //test 3
  test("Create an issue with missing required fields", function(done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/{project}")
      .type('form')
      .send({
        "issue_title": "Fix error in posting data"
      })
      .end(function(err, res) {
        assert.equal(JSON.stringify(res.body), '{"error":"required field(s) missing"}');
        done();
      });
  })
  //test 4
  test("View issues on a project: GET request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/{project}")
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      });
  })
  //test 5
  test("View issues on a project with one filter: GET request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/{project}?created_on=2023-09-08T15:29:08.176Z")
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(JSON.stringify(res.body), '[{"_id":"64fb3dc40deb0cbfe1bc9993","project":"{project}","issue_title":"Fix error in posting data","issue_text":"When we post data it has an error.","created_on":"2023-09-08T15:29:08.176Z","updated_on":"2023-09-08T15:29:08.176Z","created_by":"Joe","open":true,"__v":0}]')
        done();
      });
  })
  //test 6
  test("View issues on a project with multiple filters: GET request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/{project}?created_on=2023-09-08T15:29:08.176Z&created_by=Joe")
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(JSON.stringify(res.body), '[{"_id":"64fb3dc40deb0cbfe1bc9993","project":"{project}","issue_title":"Fix error in posting data","issue_text":"When we post data it has an error.","created_on":"2023-09-08T15:29:08.176Z","updated_on":"2023-09-08T15:29:08.176Z","created_by":"Joe","open":true,"__v":0}]')
        done();
      });
  })
  //test 7
  test("Update one field on an issue: PUT request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/{project}")
      .send({
        "_id": "64fa70ee35412c842c4fccd0",
        "issue_text": "text updated"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"result":"successfully updated","_id":"64fa70ee35412c842c4fccd0"}')
        done();
      });
  })
  //test 8
  test("Update multiple fields on an issue: PUT request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/{project}")
      .send({
        "_id": "64fa70ee35412c842c4fccd0",
        "issue_text": "text updated",
        "isssue_title": "title updated"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(JSON.stringify(res.body), '{"result":"successfully updated","_id":"64fa70ee35412c842c4fccd0"}')
        done();
      });
  })
  //test 9
  test("Update an issue with missing _id: PUT request ", function(done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/{project}")
      .send({
        "issue_text": "text updated",
        "isssue_title": "title updated"
      })
      .end(function(err, res) {
        assert.equal(res.text, '{"error":"missing _id"}');
        done();
      });
  })
  //test 10
  test("Update an issue with no fields to update: PUT request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/{project}")
      .send({
        "_id": "64fa70ee35412c842c4fccd0"
      })
      .end(function(err, res) {
        assert.equal(res.text, '{"error":"no update field(s) sent","_id":"64fa70ee35412c842c4fccd0"}');
        done();
      });
  })
  //test 11
  test("Update an issue with an invalid _id: PUT request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/{project}")
      .send({
        "_id": "12344567890",
        "isssue_title": "title updated"
      })
      .end(function(err, res) {
        assert.equal(res.text, '{"error":"could not update","_id":"12344567890"}');
        console.log(firstId)
        done();
      });
  })
  //test 12
  test("Delete an issue: DELETE request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/{project}")
      .send({ _id: firstId })
      .end(function(err, res) {
        assert.equal(res.text, '{"result":"successfully deleted","_id":"'+firstId+'"}');
        done();
      });
  })
  //test 13
  test("Delete an issue with an invalid _id: DELETE request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/{project}")
      .send({ _id: "745" })
      .end(function(err, res) {
        assert.equal(res.text, '{"error":"could not delete","_id":"745"}');
        done();
      });
  })
  //test 14
  test("Delete an issue with missing _id: DELETE request", function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/{project}")
      .end(function(err, res) {
        assert.equal(res.text, '{"error":"missing _id"}');
        done();
      });
  })
  
});
