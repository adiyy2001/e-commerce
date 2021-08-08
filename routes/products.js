const express = require('express');
const router = express.Router();
const {db} = require("../config/helpers");

/* GET home page. */
router.get('/', (req, res) => {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    let limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10

    let startValue;
    let endValue;

    if (page > 0) {
        startValue = (page * limit) - limit;
        endValue = page * limit;
    } else {
        startValue = 0;
        endValue = 10;
    }

    db.table('products as p').join([
        {
            table: 'categories as c',
            on: 'c.id = p.cat_id'
        }
    ]).withFields(['c.title as category', 'p.title as name', 'p.price', 'p.quantity', 'p.image', 'p.id'])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(products => {
          if(products.length > 0) {
            res.status(200).json({
              count: products.length,
              products
            } )
          } else {
            res.json({message: 'no products found'})
          }
        }).catch(err => console.log(err))
});


module.exports = router;
