const express = require('express');
const router = express.Router();
const {db} = require("../config/helpers");


router.get('/', (req, res) => {
    const {startValue, endValue} = setPaginationValue(req);

    productsJoin
        .withFields(['c.title as category', 'p.title as name', 'p.price', 'p.quantity', 'p.image', 'p.id'])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(products => {
            if (products.length > 0) {
                res.status(200).json({
                    count: products.length,
                    products
                })
            } else {
                res.json({message: 'no products found'})
            }
        }).catch(err => console.log(err))
});
router.get('/:id', ((req, res) => {
    const productId = req.params.id;
    productsJoin.withFields(['c.title as category', 'p.title as name', 'p.price', 'p.quantity', 'p.images', 'p.id'])
        .filter({'p.id': productId})
        .get()
        .then(product => {
            if (product) {
                res.status(200).json(product)
            } else {
                res.json({message: `no product found with id ${productId}`})
            }
        }).catch(err => console.log(err))
}));

router.get('/category/:categoryName', (req, res) => {

    const {startValue, endValue} = setPaginationValue(req);
    const category = req.params.categoryName;
    db.table('products as p').join([
        {
            table: 'categories as c',
            on: `c.id = p.cat_id WHERE c.title LIKE '%${category}%'`
        }
    ]).withFields(['c.title as category', 'p.title as name', 'p.price', 'p.quantity', 'p.image', 'p.id'])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(products => {
            if (products.length > 0) {
                res.status(200).json({
                    count: products.length,
                    products
                })
            } else {
                res.json({message: `no products found from ${category} category`})
            }
        }).catch(err => console.log(err))
})

function setPaginationValue(req) {
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
    return {startValue, endValue}
}

const productsJoin = db.table('products as p').join([
    {
        table: 'categories as c',
        on: 'c.id = p.cat_id'
    }])

module.exports = router;
