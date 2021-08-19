
const express = require('express');
const OrderCtrl = require('../../controllers/OrderCtrl');
const passport = require('passport');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Order = require('../../models/Order');
const keys = require('../../config/keys');
const User = require('../../models/User');
const nodemailer = require('nodemailer');
const smtpTransporter=require('nodemailer-smtp-transport');
const crypto = require('crypto');
const validateOrderInput = require('../../validation/order');
const AdmZip = require('adm-zip');
var fs = require('fs-extra'); 
var uploadDir = fs.readdirSync(path.join(__dirname, '../..', '/files')); 
var pathToFiles = path.join(__dirname, '../..', '/files/');
// router.post('/', passport.authenticate('jwt', { session: false }), OrderCtrl.createOrder);
router.get('/', OrderCtrl.getAllOrders);
router.get('/admin', OrderCtrl.getAllOrdersForAdmin);
router.get('/person', OrderCtrl.getOrdersbyPerson);

router.get('/submission1', OrderCtrl.getSubmissions1);
router.get('/submission2', OrderCtrl.getSubmissions2);
router.get('/submission3', OrderCtrl.getSubmissions3);

router.get('/status', OrderCtrl.getFinishedOrders);

// router.put('/order/:id', OrderCtrl.updateOrder);

router.delete('/:id', OrderCtrl.deleteOrder);

router.get('/:id', OrderCtrl.getOrderById);




const smtpTransport = nodemailer.createTransport(smtpTransporter({
    service: 'Gmail',
    host:'smtp.gmail.com',
    auth: {
        user: keys.email,
        pass: keys.password
    },
    tls: {
        rejectUnauthorized: false
    }
}));

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}
const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, './files');
      },
      filename(req, file, cb) {
        cb(null, `${new Date().getTime()}_${file.originalname}`);
      }
    }),
    limits: {
      fileSize: 5000000 // max order size 1MB = 1000000 bytes
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xls)$/)) {
        return cb(
          new Error(
            'only upload orders with jpg, jpeg, png, pdf, doc, docx, xslx, xls format.'
          )
        );
      }
      cb(undefined, true); // continue with upload
    }
  });
  
  router.post('/upload', upload.array('fileCollection', 5), async (req, res) => {
        // const {errors, isValid} = validateOrderInput(req.body);

        // console.log(errors);
        // if(!isValid){      
        //     console.log('girdik');
        //     return res.status(400).json(errors);
        // }
        const reqFiles = [];
        // const url = req.protocol + '://' + req.get('host')
        for (var i = 0; i < req.files.length; i++) {
            console.log(req.files[i].destination);
            reqFiles.push(req.files[i].filename)
        }
        //console.log(reqFiles);
        const {milestone,statusUI, msdFileUI, dateR, numberOfFiles, numberOfItems, orderStatus, daysSinceRequest, receivedDate, orderMadeBy, price1, price2, submission,requestDay, vendor1, vendor2, category, catalog1, catalog2, date, description,notes, msdFile} = req.body;
        var dateUII = ''; 
        console.log(typeof date);
        if (date != ''){
          console.log('girdik');
          var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const year = date.substring(0,4);
          const m = date.substring(5,7);
          const mm = parseInt(m);
          const month = strArray[mm-1];
          const day = date.substring(8,10);
          dateUII = month + ' ' + day +  ', ' + year;  
        }
        
        const order = new Order({
          milestone,
          statusUI, 
          numberOfFiles, 
          numberOfItems,
          orderMadeBy,
          requestDay,
          msdFileUI,
          vendor1,
          daysSinceRequest,
          vendor2,
          category,
          catalog1,
          catalog2,
          date,
          notes,
          msdFile, 
          price1,
          price2,
          submission,
          receivedDate,
          dateR,
          orderStatus,
          description,
          dateUI: dateUII,

          fileCollection: reqFiles
        });
        var neededBy;
        console.log(order.dateUI);
        if (order.date == null){
          console.log('girdik');
          neededBy = 'Not mentioned';
        }
        else{
          console.log('bajeeeen');
          neededBy = order.date.toString().substring(4,15);
        }
        var fileAttached;

        if (msdFile === 'true') {
          fileAttached = 'Yes';
        }
        else{
          fileAttached = 'No';
        }
        var reqDay = new Date();
        console.log(reqDay);
        var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const year = reqDay.getFullYear();
        const m = reqDay.getMonth();
        const mm = parseInt(m)
        const month = strArray[mm]
        const day = reqDay.getDate();
        const hour = reqDay.getHours();
        var ampm = '';
        if (hour >= 12 && hour <= 24){
          ampm = 'PM';
        }
        else{
          ampm = 'AM';
        } 
        const mins = reqDay.getMinutes();
        const d = month + ' ' + day +  ', ' + year + ' ' + hour + ':' + mins + ' ' + ampm;
        const dd =  month + ' ' + day +  ', ' + year;
        order.requestDay = dd;
        console.log(d);
        console.log(order.requestDay);
        console.log('order oncesi');
        order
        .save()
        .then(() => {
            var mailOpt = {
                from: keys.email,
                to: 'alisoyunjov@gmail.com',
                subject: 'A new order has been made',
                html : '<h2>The order details are following:</h2><br><h4>Order made by:   ' + order.orderMadeBy + '</h4>' +
                '<h4>Vendors are:   ' + order.vendor1 + ' and ' + order.vendor2 + '</h4>' + 
                '<h4> Category:   ' + order.category + '</h4>' + 
                '<h4>Catalogs are:   ' + order.catalog1 + ' and ' + order.catalog2 + '</h4>' + 
                '<h4> Item Description:   ' + order.description + '</h4>' + 
                '<h4> Is File Needed?:   ' + fileAttached + '</h4>' +
                '<h4> Requested Date:   ' + d + '</h4>' + 
                '<h4> Needed Date:   ' + neededBy + '</h4>' 
            };
            smtpTransport.sendMail(mailOpt, (err, res) => {
                if (err) {
                    throw err;
                } 
                smtpTransport.close();
            });
            console.log('successssss');
            return res.status(200).json({
                success: true,
                id: order._id,
                message: 'Order created!',
            });
        })
        .catch(err => {
          console.log('error oncesi');
          console.log(err);
            return res.status(400).json({    
                error: err,
                message: 'Order not created!'
            });
        });
        
    },
    (error, req, res, next) => {
      if (error) {
        res.status(500).send(error.message);
      }
    }
  );
  router.put('/update/:id', upload.array('fileCollection', 5), async (req, res) => {
    console.log('function icindeyiz')
    const body = req.body
    if (!body) {
        console.log('body check')
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        });
    }
    const reqFiles = [];
    // const url = req.protocol + '://' + req.get('host')
    for (var i = 0; i < req.files.length; i++) {
        console.log(req.files[i].destination);
        reqFiles.push(req.files[i].filename)
    }
    Order.findOne({ _id: req.params.id }, (err, order) => {
        console.log('found one')
        if (err) {
            return res.status(404).json({
                error: err,
                message: 'Order not found!',
            });
        }
        console.log('no error')
        if (body.price1) order.price1 = body.price1;
        if (body.orderStatus) order.orderStatus = body.orderStatus;
        if (body.price2) order.price2 = body.price2;
        if (body.submission) order.submission = body.submission;
        if (body.receivedDate) order.receivedDate = body.receivedDate;
        if (body.notes) order.notes = body.notes;
        if (body.milestone) order.milestone = body.milestone;
        if (body.statusUI) order.statusUI = body.statusUI;
        if (body.numberOfFiles) order.numberOfFiles = body.numberOfFiles;
        if (reqFiles.length > 0){
          order.fileCollection = reqFiles;
        }
        var dateUII = '';
        if (order.receivedDate != null){
            var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const year = order.receivedDate.getFullYear();
            

            const m = order.receivedDate.getMonth();
            const mm = parseInt(m);
      
            const month = strArray[mm];
       
            const day = order.receivedDate.getDate();
           
            dateUII = month + ' ' + day +  ', ' + year;  
        
          order.dateR = dateUII;
        }
        

        order
            .save()
            .then(() => {
                console.log('finished')
                return res.status(200).json({
                    success: true,
                    id: order._id,
                    message: 'Order updated!',
                })
            })
            .catch(err => {
                console.log('error barow');
                console.log(err);
                return res.status(404).json({
                    error: err,
                    message: 'Order not updated!',
                })
            })
    })

  });

  router.get('/getAllFiles', async (req, res) => {
    try {
      const orders = await Order.find({});
      const sortedByCreationDate = orders.sort(
        (a, b) => b.createdAt - a.createdAt
      );
      res.send(sortedByCreationDate);
    } catch (error) {
      res.status(400).send('Error while getting list of orders. Try again later.');
    }
  });
  
  router.get('/download/:id', async (req, res) => {
    console.log('geldi');
    try {  
      console.log('geldi1');
      const order = await Order.findById(req.params.id);
      const zip = new AdmZip();
 
      for(var i = 0; i < order.fileCollection.length; i++){
          console.log(pathToFiles + order.fileCollection[i]);
          zip.addLocalFile(pathToFiles + order.fileCollection[i]);
      }
   
      // Define zip file name
      const downloadName = `${Date.now()}.zip`;
   
      const data = zip.toBuffer();
   
      // save file zip in root directory
      zip.writeZip(pathToFiles+downloadName);
      
      // code to download zip file
      console.log('geldi2');
      res.set('Content-Type','application/zip');
      res.set('Content-Disposition',`attachment; filename=${downloadName}`);
      res.set('Content-Length',data.length);
      res.send(data);
      console.log('geldik');
    }
    //   res.set({
    //     'Content-Type': order.file_mimetype
    //   });
    //   res.sendFile(path.join(__dirname, '../..', order.file_path));

     catch (error) {
      console.log('geldi err');
      console.log(error);
      res.status(400).send('Error while downloading order. Try again later.');
    }
  });
  router.get('/downloadFiles/:id', async (req, res) => {
    try {  
      const order = await Order.findById(req.params.id);
      res.set({
        'Content-Type': 'application/pdf'
      });
      res.sendFile(pathToFiles + order.fileCollection[0]);

    } catch (error) {
      res.status(400).send('Error while downloading order. Try again later.');
    }
  });

  router.put('/addFile/:id', upload.array('fileCollection', 5), async (req, res) => {
    console.log('function icindeyiz')
    const body = req.body
    if (!body) {
        console.log('body check')
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        });
    }
    const reqFiles = [];
    // const url = req.protocol + '://' + req.get('host')
    for (var i = 0; i < req.files.length; i++) {
        console.log(req.files[i].destination);
        reqFiles.push(req.files[i].filename)
    }
    Order.findOne({ _id: req.params.id }, (err, order) => {
        console.log('found one')
        if (err) {
            return res.status(404).json({
                error: err,
                message: 'Order not found!',
            });
        }
        console.log('no error')
        if (body.catalog1) order.catalog1 = body.catalog1;
        if (body.catalog2) order.catalog2 = body.catalog2;
        if (body.description) order.description = body.description;
        if (body.notes) order.notes = body.notes;
        if (body.numberOfFiles) order.numberOfFiles = body.numberOfFiles;
        if (reqFiles.length > 0){
          order.fileCollection = reqFiles;
        }
       
        if (body.numberOfItems && body.numberOfItems != 'Select') order.numberOfItems = body.numberOfItems;
        
        
        order
            .save()
            .then(() => {
                console.log('finished')
                return res.status(200).json({
                    success: true,
                    id: order._id,
                    message: 'Order updated!',
                })
            })
            .catch(err => {
                console.log('error barow');
                console.log(err);
                return res.status(404).json({
                    error: err,
                    message: 'Order not updated!',
                })
            })
    })

  });

module.exports = router;