const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const cheerio = require('cheerio');
const request = require('request');

const Comment = require('../models/comment.js');
const Article = require('../models/article');

mongoose.Promise = Promise;

router.get('/', (req, res) => res.render('index'));

router.get('/savedarticles', (req, res) => {
    Article.find({}, (error, response) => {
        if (error) { console.log(error); }
        else {
            const hbsArticleObj = {
                articles: response
            };
            res.render('savedarticles', hbsArticleObj);
        }
    });
});

router.post('/scrape', (req, res) => {
  request("http://www.nytimes.com/", (error, response, html) => {
    const $ = cheerio.load(html);
    let scrapedArticles = {};
    $("article h2").each(function(i, element) {
      let result = {};
      result.title = $(this).children("a").text();
      console.log("What's the result title? " + result.title);
      result.link = $(this).children("a").attr("href");
      scrapedArticles[i] = result;

    });
    console.log("Scraped Articles: " + scrapedArticles);
    let hbsArticleObject = {
        articles: scrapedArticles
    };
    res.render("index", hbsArticleObject);
    });
});

router.post('/save', (req, res) => {
    let newArticleObject = {};
    newArticleObject.title = req.body.title;
    newArticleObject.link = req.body.link;
    let loggedArticle = new Article(newArticleObject);
    loggedArticle.save((err, result) => {
        if (err) { console.log(err); }
        else { console.log(result); }
    });
    res.redirect('/savedarticles');
});

router.get('/delete/:id', (req, res) => {
    Article.findOneAndRemove({ '_id': req.params.id }, (err, reply) => {
        if (err) { console.log("Can't delete:" + err); }
        else { console.log('deleted that trash'); }
        res.redirect('/savedArticles');
    });
});

router.get('/comments/:id', (req, res) => {
    Comment.findOneAndRemove({ '_id': req.params.id }, (err, response) => {
        if (err) { console.log("Can't delete:" + err); }
        else { console.log('deleted that trash'); }
        res.send(response);
    });
});

router.get('/articles/:id', (req, res) => {
    Article.findOne({ '_id': req.params.id })
        .populate('comments')
        .exec((err, doc) => {
            if (err) { console.log("Unable to find article or comments."); }
            else {
                console.log("Article And Comments rendered " + doc);
                res.json(doc);
            }
        });
});

router.post('/articles/:id', (req, res) => {
    let newComment = new Comment(req.body);
    newComment.save((error, doc) => {
        if (error) { console.log(error); }
        else {
            Article.findOneAndUpdate({ '_id': req.params.id }, { $push: { comments: doc._id } }, { new: true, upsert: true })
                .populate('comments')
                .exec((err, doc) => {
                    if (err) { console.log('cannot find article'); }
                    else {
                        res.send(doc);
                    }
                })
        }});
});

module.exports = router;
